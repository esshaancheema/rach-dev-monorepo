import * as ss from 'simple-statistics';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export interface StatisticalResult {
  isSignificant: boolean;
  pValue: number;
  zScore: number;
  confidence: number;
  confidenceInterval: [number, number];
  effect: number;
  standardError: number;
}

export interface ExperimentAnalysis {
  isSignificant: boolean;
  pValue: number;
  confidence: number;
  confidenceInterval: [number, number];
  winner?: string;
  improvements: VariationImprovement[];
  recommendations: string[];
}

export interface VariationImprovement {
  variationId: string;
  variationName: string;
  improvement: number; // percentage improvement over control
  confidenceInterval: [number, number];
  pValue: number;
  isSignificant: boolean;
}

export interface SampleSizeCalculation {
  sampleSizePerVariation: number;
  totalSampleSize: number;
  estimatedDuration: number; // days
  assumptions: {
    baselineConversionRate: number;
    minimumDetectableEffect: number;
    power: number;
    significanceLevel: number;
  };
}

export interface BayesianAnalysis {
  posteriorProbability: number;
  probabilityToBeBest: number;
  expectedLoss: number;
  credibleInterval: [number, number];
  priorParameters: {
    alpha: number;
    beta: number;
  };
  posteriorParameters: {
    alpha: number;
    beta: number;
  };
}

export interface SequentialTestResult {
  shouldStop: boolean;
  reason: 'significance' | 'futility' | 'superiority' | 'continue';
  currentPower: number;
  currentAlpha: number;
  recommendation: string;
}

export class StatisticsService {
  constructor() {}

  /**
   * Calculate required sample size for an A/B test
   */
  public calculateSampleSize(
    minimumDetectableEffect: number,
    power: number = 0.8,
    significanceLevel: number = 0.05,
    baselineRate: number = 0.1
  ): number {
    try {
      const alpha = significanceLevel;
      const beta = 1 - power;
      
      // Calculate z-scores
      const zAlpha = this.inverseNormalCDF(1 - alpha / 2);
      const zBeta = this.inverseNormalCDF(1 - beta);
      
      // Convert MDE to absolute difference
      const p1 = baselineRate;
      const p2 = baselineRate * (1 + minimumDetectableEffect);
      
      // Pooled proportion
      const pPooled = (p1 + p2) / 2;
      
      // Standard deviation
      const sd1 = Math.sqrt(p1 * (1 - p1));
      const sd2 = Math.sqrt(p2 * (1 - p2));
      const sdPooled = Math.sqrt(2 * pPooled * (1 - pPooled));
      
      // Sample size calculation
      const numerator = Math.pow(zAlpha * sdPooled + zBeta * Math.sqrt(sd1 * sd1 + sd2 * sd2), 2);
      const denominator = Math.pow(p2 - p1, 2);
      
      const sampleSizePerVariation = Math.ceil(numerator / denominator);
      
      logger.debug('Sample size calculated', {
        mde: minimumDetectableEffect,
        power,
        significanceLevel,
        baselineRate,
        sampleSizePerVariation,
      });
      
      return sampleSizePerVariation;
      
    } catch (error) {
      logger.error('Sample size calculation failed', { error: error.message });
      return config.abTesting.minSampleSize;
    }
  }

  /**
   * Perform statistical test comparing two proportions
   */
  public twoProportionZTest(
    n1: number, x1: number, // control: sample size, successes
    n2: number, x2: number, // treatment: sample size, successes
    significanceLevel: number = 0.05
  ): StatisticalResult {
    try {
      if (n1 <= 0 || n2 <= 0) {
        throw new Error('Sample sizes must be positive');
      }

      const p1 = x1 / n1; // control proportion
      const p2 = x2 / n2; // treatment proportion
      
      // Pooled proportion
      const pPooled = (x1 + x2) / (n1 + n2);
      
      // Standard error
      const se = Math.sqrt(pPooled * (1 - pPooled) * (1/n1 + 1/n2));
      
      // Z-score
      const zScore = se > 0 ? (p2 - p1) / se : 0;
      
      // P-value (two-tailed)
      const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
      
      // Significance
      const isSignificant = pValue < significanceLevel;
      
      // Confidence interval for difference
      const criticalValue = this.inverseNormalCDF(1 - significanceLevel / 2);
      const seDiff = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
      const diff = p2 - p1;
      const margin = criticalValue * seDiff;
      const confidenceInterval: [number, number] = [diff - margin, diff + margin];
      
      // Effect size (Cohen's h)
      const effect = 2 * (Math.asin(Math.sqrt(p2)) - Math.asin(Math.sqrt(p1)));
      
      const confidence = (1 - pValue) * 100;
      
      const result: StatisticalResult = {
        isSignificant,
        pValue,
        zScore,
        confidence: Math.min(confidence, 99.9),
        confidenceInterval,
        effect,
        standardError: se,
      };
      
      logger.debug('Two-proportion z-test completed', {
        control: { n: n1, x: x1, rate: p1 },
        treatment: { n: n2, x: x2, rate: p2 },
        result,
      });
      
      return result;
      
    } catch (error) {
      logger.error('Two-proportion z-test failed', { error: error.message });
      
      return {
        isSignificant: false,
        pValue: 1,
        zScore: 0,
        confidence: 0,
        confidenceInterval: [0, 0],
        effect: 0,
        standardError: 0,
      };
    }
  }

  /**
   * Analyze entire experiment with multiple variations
   */
  public async analyzeExperiment(
    experiment: any,
    variationResults: any[]
  ): Promise<ExperimentAnalysis> {
    try {
      const controlVariation = variationResults.find(v => 
        experiment.variations.find((ev: any) => ev.id === v.variationId)?.isControl
      );
      
      if (!controlVariation) {
        throw new Error('Control variation not found');
      }

      const improvements: VariationImprovement[] = [];
      let overallSignificance = false;
      let lowestPValue = 1;
      let bestImprovement = 0;
      let winner: string | undefined;

      // Compare each treatment to control
      for (const variation of variationResults) {
        if (variation.variationId === controlVariation.variationId) {
          continue; // Skip control
        }

        const primaryGoal = experiment.goals.find((g: any) => g.isPrimary);
        const controlGoalResult = controlVariation.goalResults.find((g: any) => g.goalId === primaryGoal.id);
        const treatmentGoalResult = variation.goalResults.find((g: any) => g.goalId === primaryGoal.id);

        if (!controlGoalResult || !treatmentGoalResult) {
          continue;
        }

        // Perform statistical test
        const testResult = this.twoProportionZTest(
          controlVariation.visitors,
          controlGoalResult.conversions,
          variation.visitors,
          treatmentGoalResult.conversions,
          experiment.statisticalConfig.significanceLevel
        );

        // Calculate improvement percentage
        const controlRate = controlGoalResult.conversionRate;
        const treatmentRate = treatmentGoalResult.conversionRate;
        const improvement = controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0;

        improvements.push({
          variationId: variation.variationId,
          variationName: variation.variationName,
          improvement,
          confidenceInterval: [
            testResult.confidenceInterval[0] * 100,
            testResult.confidenceInterval[1] * 100
          ],
          pValue: testResult.pValue,
          isSignificant: testResult.isSignificant,
        });

        // Track overall significance and best performer
        if (testResult.isSignificant) {
          overallSignificance = true;
        }

        if (testResult.pValue < lowestPValue) {
          lowestPValue = testResult.pValue;
        }

        if (improvement > bestImprovement && testResult.isSignificant) {
          bestImprovement = improvement;
          winner = variation.variationId;
        }
      }

      // Apply multiple testing correction if needed
      if (improvements.length > 1 && experiment.statisticalConfig.multipleTestingCorrection !== 'none') {
        this.applyMultipleTestingCorrection(improvements, experiment.statisticalConfig.multipleTestingCorrection);
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        experiment,
        improvements,
        overallSignificance
      );

      const analysis: ExperimentAnalysis = {
        isSignificant: overallSignificance,
        pValue: lowestPValue,
        confidence: Math.min((1 - lowestPValue) * 100, 99.9),
        confidenceInterval: [0, bestImprovement], // Simplified
        winner,
        improvements,
        recommendations,
      };

      logger.info('Experiment analysis completed', {
        experimentId: experiment.id,
        isSignificant: overallSignificance,
        winner,
        improvements: improvements.length,
      });

      return analysis;

    } catch (error) {
      logger.error('Experiment analysis failed', {
        experimentId: experiment.id,
        error: error.message,
      });

      return {
        isSignificant: false,
        pValue: 1,
        confidence: 0,
        confidenceInterval: [0, 0],
        improvements: [],
        recommendations: ['Analysis failed - check data quality'],
      };
    }
  }

  /**
   * Perform Bayesian analysis for A/B test
   */
  public bayesianAnalysis(
    controlData: { successes: number; trials: number },
    treatmentData: { successes: number; trials: number },
    priorAlpha: number = 1,
    priorBeta: number = 1
  ): BayesianAnalysis {
    try {
      // Control posterior parameters
      const controlPosteriorAlpha = priorAlpha + controlData.successes;
      const controlPosteriorBeta = priorBeta + controlData.trials - controlData.successes;
      
      // Treatment posterior parameters
      const treatmentPosteriorAlpha = priorAlpha + treatmentData.successes;
      const treatmentPosteriorBeta = priorBeta + treatmentData.trials - treatmentData.successes;
      
      // Monte Carlo simulation to calculate probability
      const simulations = 100000;
      let treatmentWins = 0;
      
      for (let i = 0; i < simulations; i++) {
        const controlSample = this.betaRandom(controlPosteriorAlpha, controlPosteriorBeta);
        const treatmentSample = this.betaRandom(treatmentPosteriorAlpha, treatmentPosteriorBeta);
        
        if (treatmentSample > controlSample) {
          treatmentWins++;
        }
      }
      
      const probabilityToBeBest = treatmentWins / simulations;
      
      // Calculate expected values
      const controlMean = controlPosteriorAlpha / (controlPosteriorAlpha + controlPosteriorBeta);
      const treatmentMean = treatmentPosteriorAlpha / (treatmentPosteriorAlpha + treatmentPosteriorBeta);
      
      // Calculate credible interval (95%)
      const credibleInterval = this.betaCredibleInterval(
        treatmentPosteriorAlpha,
        treatmentPosteriorBeta,
        0.95
      );
      
      // Calculate expected loss
      const expectedLoss = Math.max(0, controlMean - treatmentMean);
      
      return {
        posteriorProbability: probabilityToBeBest,
        probabilityToBeBest,
        expectedLoss,
        credibleInterval,
        priorParameters: { alpha: priorAlpha, beta: priorBeta },
        posteriorParameters: { alpha: treatmentPosteriorAlpha, beta: treatmentPosteriorBeta },
      };
      
    } catch (error) {
      logger.error('Bayesian analysis failed', { error: error.message });
      
      return {
        posteriorProbability: 0.5,
        probabilityToBeBest: 0.5,
        expectedLoss: 0,
        credibleInterval: [0, 1],
        priorParameters: { alpha: priorAlpha, beta: priorBeta },
        posteriorParameters: { alpha: priorAlpha, beta: priorBeta },
      };
    }
  }

  /**
   * Sequential testing analysis
   */
  public sequentialTest(
    experiment: any,
    currentResults: any[],
    spentAlpha: number = 0
  ): SequentialTestResult {
    try {
      const totalSampleSize = currentResults.reduce((sum, r) => sum + r.visitors, 0);
      const plannedSampleSize = this.calculateSampleSize(
        experiment.statisticalConfig.minimumDetectableEffect,
        experiment.statisticalConfig.power,
        experiment.statisticalConfig.significanceLevel
      );
      
      const informationFraction = totalSampleSize / (plannedSampleSize * experiment.variations.length);
      
      // O'Brien-Fleming spending function
      const currentAlpha = this.obrienFlemingSpendingFunction(
        informationFraction,
        experiment.statisticalConfig.significanceLevel
      );
      
      const adjustedSignificanceLevel = currentAlpha - spentAlpha;
      
      // Check current results with adjusted significance level
      const controlVariation = currentResults.find(r => 
        experiment.variations.find((v: any) => v.id === r.variationId)?.isControl
      );
      
      if (!controlVariation) {
        return {
          shouldStop: false,
          reason: 'continue',
          currentPower: 0,
          currentAlpha: adjustedSignificanceLevel,
          recommendation: 'Control variation not found',
        };
      }

      let maxZScore = 0;
      let significantDifference = false;

      for (const result of currentResults) {
        if (result.variationId === controlVariation.variationId) continue;

        const primaryGoal = experiment.goals.find((g: any) => g.isPrimary);
        const controlGoal = controlVariation.goalResults.find((g: any) => g.goalId === primaryGoal.id);
        const treatmentGoal = result.goalResults.find((g: any) => g.goalId === primaryGoal.id);

        if (controlGoal && treatmentGoal) {
          const testResult = this.twoProportionZTest(
            controlVariation.visitors,
            controlGoal.conversions,
            result.visitors,
            treatmentGoal.conversions,
            adjustedSignificanceLevel
          );

          maxZScore = Math.max(maxZScore, Math.abs(testResult.zScore));
          
          if (testResult.isSignificant) {
            significantDifference = true;
          }
        }
      }

      // Calculate current power
      const currentPower = this.calculateCurrentPower(maxZScore, informationFraction);
      
      // Decision logic
      if (significantDifference && informationFraction >= 0.5) {
        return {
          shouldStop: true,
          reason: 'significance',
          currentPower,
          currentAlpha: adjustedSignificanceLevel,
          recommendation: 'Significant difference detected, consider stopping',
        };
      }

      if (informationFraction >= 1.0) {
        return {
          shouldStop: true,
          reason: 'futility',
          currentPower,
          currentAlpha: adjustedSignificanceLevel,
          recommendation: 'Planned sample size reached',
        };
      }

      // Futility check
      if (informationFraction >= 0.5 && currentPower < 0.2) {
        return {
          shouldStop: true,
          reason: 'futility',
          currentPower,
          currentAlpha: adjustedSignificanceLevel,
          recommendation: 'Low probability of detecting effect, consider stopping',
        };
      }

      return {
        shouldStop: false,
        reason: 'continue',
        currentPower,
        currentAlpha: adjustedSignificanceLevel,
        recommendation: 'Continue collecting data',
      };

    } catch (error) {
      logger.error('Sequential test failed', { error: error.message });
      
      return {
        shouldStop: false,
        reason: 'continue',
        currentPower: 0,
        currentAlpha: 0,
        recommendation: 'Error in sequential analysis',
      };
    }
  }

  /**
   * Calculate confidence interval for conversion rate
   */
  public conversionRateConfidenceInterval(
    conversions: number,
    visitors: number,
    confidenceLevel: number = 0.95
  ): [number, number] {
    if (visitors === 0) return [0, 0];

    const rate = conversions / visitors;
    const alpha = 1 - confidenceLevel;
    const zScore = this.inverseNormalCDF(1 - alpha / 2);
    
    // Wilson score interval (more accurate for small samples)
    const n = visitors;
    const p = rate;
    const z2 = zScore * zScore;
    
    const center = (p + z2 / (2 * n)) / (1 + z2 / n);
    const margin = (zScore / (1 + z2 / n)) * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
    
    return [
      Math.max(0, center - margin),
      Math.min(1, center + margin)
    ];
  }

  /**
   * Apply multiple testing correction
   */
  private applyMultipleTestingCorrection(
    improvements: VariationImprovement[],
    method: string
  ): void {
    const pValues = improvements.map(i => i.pValue);
    let adjustedPValues: number[];

    switch (method) {
      case 'bonferroni':
        adjustedPValues = pValues.map(p => Math.min(1, p * pValues.length));
        break;
      case 'holm':
        adjustedPValues = this.holmBonferroniCorrection(pValues);
        break;
      case 'benjamini_hochberg':
        adjustedPValues = this.benjaminiHochbergCorrection(pValues);
        break;
      default:
        adjustedPValues = pValues;
    }

    improvements.forEach((improvement, index) => {
      improvement.pValue = adjustedPValues[index];
      improvement.isSignificant = adjustedPValues[index] < 0.05;
    });
  }

  private holmBonferroniCorrection(pValues: number[]): number[] {
    const sortedIndices = pValues
      .map((p, i) => ({ p, i }))
      .sort((a, b) => a.p - b.p)
      .map(item => item.i);

    const adjustedPValues = new Array(pValues.length);
    
    for (let j = 0; j < sortedIndices.length; j++) {
      const i = sortedIndices[j];
      const adjustment = pValues.length - j;
      adjustedPValues[i] = Math.min(1, pValues[i] * adjustment);
      
      // Ensure monotonicity
      if (j > 0) {
        const prevIndex = sortedIndices[j - 1];
        adjustedPValues[i] = Math.max(adjustedPValues[i], adjustedPValues[prevIndex]);
      }
    }

    return adjustedPValues;
  }

  private benjaminiHochbergCorrection(pValues: number[]): number[] {
    const sortedIndices = pValues
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p - a.p) // Sort in descending order
      .map(item => item.i);

    const adjustedPValues = new Array(pValues.length);
    
    for (let j = 0; j < sortedIndices.length; j++) {
      const i = sortedIndices[j];
      const rank = pValues.length - j;
      adjustedPValues[i] = Math.min(1, pValues[i] * pValues.length / rank);
      
      // Ensure monotonicity
      if (j > 0) {
        const prevIndex = sortedIndices[j - 1];
        adjustedPValues[i] = Math.min(adjustedPValues[i], adjustedPValues[prevIndex]);
      }
    }

    return adjustedPValues;
  }

  private generateRecommendations(
    experiment: any,
    improvements: VariationImprovement[],
    isSignificant: boolean
  ): string[] {
    const recommendations: string[] = [];

    if (!isSignificant) {
      recommendations.push('No statistically significant differences detected');
      recommendations.push('Consider running the test longer to gather more data');
      
      // Check if sample size is too small
      const totalSampleSize = improvements.reduce((sum, i) => sum + 100, 100); // Simplified
      const requiredSampleSize = this.calculateSampleSize(
        experiment.statisticalConfig.minimumDetectableEffect,
        experiment.statisticalConfig.power,
        experiment.statisticalConfig.significanceLevel
      );
      
      if (totalSampleSize < requiredSampleSize) {
        recommendations.push(`Increase sample size (current: ~${totalSampleSize}, required: ${requiredSampleSize})`);
      }
    } else {
      const significantImprovements = improvements.filter(i => i.isSignificant && i.improvement > 0);
      
      if (significantImprovements.length > 0) {
        const best = significantImprovements.reduce((max, current) => 
          current.improvement > max.improvement ? current : max
        );
        
        recommendations.push(`Implement ${best.variationName} (${best.improvement.toFixed(2)}% improvement)`);
        recommendations.push('Monitor metrics closely after implementation');
      }
      
      const negativeImprovements = improvements.filter(i => i.isSignificant && i.improvement < 0);
      if (negativeImprovements.length > 0) {
        recommendations.push('Some variations show significant negative impact - avoid implementing these');
      }
    }

    // Check for practical significance
    const practicalThreshold = 0.05; // 5% minimum practical significance
    const practicallySignificant = improvements.some(i => 
      i.isSignificant && Math.abs(i.improvement) >= practicalThreshold * 100
    );
    
    if (isSignificant && !practicallySignificant) {
      recommendations.push('Statistically significant but may not be practically significant');
      recommendations.push('Consider business impact beyond statistical significance');
    }

    return recommendations;
  }

  // Statistical utility functions
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private inverseNormalCDF(p: number): number {
    // Approximation of inverse normal CDF
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    
    const a0 = -3.969683028665376e+01;
    const a1 = 2.209460984245205e+02;
    const a2 = -2.759285104469687e+02;
    const a3 = 1.383577518672690e+02;
    const a4 = -3.066479806614716e+01;
    const a5 = 2.506628277459239e+00;

    const b1 = -5.447609879822406e+01;
    const b2 = 1.615858368580409e+02;
    const b3 = -1.556989798598866e+02;
    const b4 = 6.680131188771972e+01;
    const b5 = -1.328068155288572e+01;

    const c0 = -7.784894002430293e-03;
    const c1 = -3.223964580411365e-01;
    const c2 = -2.400758277161838e+00;
    const c3 = -2.549732539343734e+00;
    const c4 = 4.374664141464968e+00;
    const c5 = 2.938163982698783e+00;

    const d1 = 7.784695709041462e-03;
    const d2 = 3.224671290700398e-01;
    const d3 = 2.445134137142996e+00;
    const d4 = 3.754408661907416e+00;

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let x: number;

    if (p < pLow) {
      const q = Math.sqrt(-2 * Math.log(p));
      x = (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) /
          ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= pHigh) {
      const q = p - 0.5;
      const r = q * q;
      x = (((((a0 * r + a1) * r + a2) * r + a3) * r + a4) * r + a5) * q /
          (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) /
           ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }

    return x;
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private betaRandom(alpha: number, beta: number): number {
    // Generate random sample from Beta distribution using Gamma samples
    const gamma1 = this.gammaRandom(alpha, 1);
    const gamma2 = this.gammaRandom(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  private gammaRandom(shape: number, scale: number): number {
    // Simplified gamma random generation (Marsaglia-Tsang method)
    if (shape < 1) {
      return this.gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }

    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x, v;
      do {
        x = this.standardNormal();
        v = 1 + c * x;
      } while (v <= 0);

      v = v * v * v;
      const u = Math.random();

      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale;
      }

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  private standardNormal(): number {
    // Box-Muller transformation
    let u1 = Math.random();
    let u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private betaCredibleInterval(alpha: number, beta: number, credibility: number): [number, number] {
    // Calculate credible interval for Beta distribution
    const tail = (1 - credibility) / 2;
    
    // Use inverse Beta CDF approximation
    const lower = this.betaInverseCDF(alpha, beta, tail);
    const upper = this.betaInverseCDF(alpha, beta, 1 - tail);
    
    return [lower, upper];
  }

  private betaInverseCDF(alpha: number, beta: number, p: number): number {
    // Approximation of inverse Beta CDF
    // This is a simplified implementation
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    
    // Initial guess using normal approximation
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) * (alpha + beta) * (alpha + beta + 1));
    
    let x = Math.max(0, Math.min(1, mean + this.inverseNormalCDF(p) * Math.sqrt(variance)));
    
    // Newton's method refinement (simplified)
    for (let i = 0; i < 10; i++) {
      const fx = this.betaCDF(alpha, beta, x) - p;
      const fpx = this.betaPDF(alpha, beta, x);
      
      if (Math.abs(fx) < 1e-10 || fpx === 0) break;
      
      x = Math.max(0, Math.min(1, x - fx / fpx));
    }
    
    return x;
  }

  private betaCDF(alpha: number, beta: number, x: number): number {
    // Simplified Beta CDF using incomplete beta function approximation
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    
    // Use regularized incomplete beta function
    return this.incompleteBeta(alpha, beta, x);
  }

  private betaPDF(alpha: number, beta: number, x: number): number {
    // Beta probability density function
    if (x <= 0 || x >= 1) return 0;
    
    const logBeta = this.logGamma(alpha) + this.logGamma(beta) - this.logGamma(alpha + beta);
    return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta);
  }

  private incompleteBeta(a: number, b: number, x: number): number {
    // Simplified incomplete beta function
    // This is a very basic approximation
    const betaValue = Math.exp(this.logGamma(a) + this.logGamma(b) - this.logGamma(a + b));
    return Math.pow(x, a) * Math.pow(1 - x, b) / (a * betaValue);
  }

  private logGamma(x: number): number {
    // Stirling's approximation for log gamma function
    if (x < 12) {
      return Math.log(this.gamma(x));
    }
    
    const c = [
      76.18009172947146,
      -86.50532032941677,
      24.01409824083091,
      -1.231739572450155,
      0.1208650973866179e-2,
      -0.5395239384953e-5
    ];
    
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    
    for (let j = 0; j <= 5; j++) {
      ser += c[j] / ++y;
    }
    
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  private gamma(x: number): number {
    // Gamma function approximation
    if (x < 0.5) {
      return Math.PI / (Math.sin(Math.PI * x) * this.gamma(1 - x));
    }
    
    x -= 1;
    let a = 0.99999999999980993;
    const coeff = [
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    
    for (let i = 0; i < coeff.length; i++) {
      a += coeff[i] / (x + i + 1);
    }
    
    const t = x + coeff.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
  }

  private obrienFlemingSpendingFunction(informationFraction: number, alpha: number): number {
    if (informationFraction <= 0) return 0;
    if (informationFraction >= 1) return alpha;
    
    // O'Brien-Fleming spending function
    const z = this.inverseNormalCDF(1 - alpha / 2);
    const spentAlpha = 2 * (1 - this.normalCDF(z / Math.sqrt(informationFraction)));
    
    return Math.min(spentAlpha, alpha);
  }

  private calculateCurrentPower(zScore: number, informationFraction: number): number {
    // Approximate current power calculation
    if (informationFraction <= 0) return 0;
    
    const adjustedZ = zScore * Math.sqrt(informationFraction);
    const power = 1 - this.normalCDF(1.96 - adjustedZ) + this.normalCDF(-1.96 - adjustedZ);
    
    return Math.max(0, Math.min(1, power));
  }
}