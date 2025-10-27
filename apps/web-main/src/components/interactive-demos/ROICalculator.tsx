'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalculatorIcon,
  TrendingUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ROICalculatorProps {
  className?: string;
  onCalculationComplete?: (results: ROIResults) => void;
}

interface ROIResults {
  totalCost: number;
  monthlySavings: number;
  yearlyROI: number;
  paybackPeriod: number;
  fiveYearValue: number;
  efficiencyGain: number;
  recommendations: string[];
}

interface IndustryMultipliers {
  costSaving: number;
  efficiency: number;
  scalability: number;
  compliance: number;
}

const industryMultipliers: Record<string, IndustryMultipliers> = {
  'healthcare': { costSaving: 1.8, efficiency: 2.2, scalability: 1.5, compliance: 2.0 },
  'fintech': { costSaving: 2.0, efficiency: 1.8, scalability: 2.5, compliance: 2.2 },
  'ecommerce': { costSaving: 1.6, efficiency: 2.0, scalability: 2.8, compliance: 1.3 },
  'logistics': { costSaving: 2.2, efficiency: 2.5, scalability: 1.8, compliance: 1.5 },
  'education': { costSaving: 1.4, efficiency: 1.6, scalability: 1.4, compliance: 1.8 },
  'manufacturing': { costSaving: 2.4, efficiency: 2.8, scalability: 2.0, compliance: 1.7 },
  'real-estate': { costSaving: 1.5, efficiency: 1.8, scalability: 1.6, compliance: 1.4 },
  'default': { costSaving: 1.5, efficiency: 1.8, scalability: 1.8, compliance: 1.5 }
};

export default function ROICalculator({ className, onCalculationComplete }: ROICalculatorProps) {
  const [currentEmployees, setCurrentEmployees] = useState(50);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [projectComplexity, setProjectComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [hasLegacySystems, setHasLegacySystems] = useState(false);
  const [needsCompliance, setNeedsCompliance] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    totalCost: 0,
    monthlySavings: 0,
    yearlyROI: 0,
    paybackPeriod: 0,
    fiveYearValue: 0,
    efficiencyGain: 0
  });

  const { industry, industryContent } = useIndustryDetection();
  const { trackEvent } = useAnalytics();

  const complexityMultipliers = {
    simple: { cost: 0.7, timeline: 0.8 },
    medium: { cost: 1.0, timeline: 1.0 },
    complex: { cost: 1.5, timeline: 1.4 }
  };

  const roiResults: ROIResults = useMemo(() => {
    const multipliers = industryMultipliers[industry] || industryMultipliers.default;
    const complexity = complexityMultipliers[projectComplexity];
    
    // Base project cost calculation
    const baseProjectCost = 45000 + (currentEmployees * 500) + (hoursPerWeek * hourlyRate * 12);
    const totalCost = baseProjectCost * complexity.cost + 
                      (hasLegacySystems ? baseProjectCost * 0.3 : 0) +
                      (needsCompliance ? baseProjectCost * 0.2 : 0);

    // Monthly savings calculation
    const manualProcessTime = hoursPerWeek * currentEmployees * 0.1; // 10% of time spent on manual processes
    const automationSavings = manualProcessTime * hourlyRate * 4.33 * multipliers.efficiency; // monthly savings
    const efficiencySavings = (currentEmployees * hourlyRate * 40 * 4.33) * 0.15 * multipliers.costSaving; // 15% efficiency gain
    const monthlySavings = automationSavings + efficiencySavings;

    const yearlyROI = ((monthlySavings * 12 - totalCost) / totalCost) * 100;
    const paybackPeriod = totalCost / monthlySavings;
    const fiveYearValue = (monthlySavings * 60) - totalCost;
    const efficiencyGain = 25 * multipliers.efficiency; // Base 25% efficiency gain

    // Industry-specific recommendations
    const recommendations = [
      `${Math.round(efficiencyGain)}% increase in operational efficiency`,
      `${Math.round(monthlySavings / 1000)}K+ monthly cost savings`,
      `ROI achieved in ${Math.round(paybackPeriod)} months`,
      `${Math.round(fiveYearValue / 1000)}K value over 5 years`
    ];

    if (industry === 'healthcare') {
      recommendations.push('HIPAA compliance built-in', 'Patient data security enhanced');
    } else if (industry === 'fintech') {
      recommendations.push('SOC 2 Type II compliance', 'PCI DSS security standards');
    } else if (industry === 'ecommerce') {
      recommendations.push('Scalable during peak seasons', 'Customer experience improved');
    }

    return {
      totalCost,
      monthlySavings,
      yearlyROI,
      paybackPeriod,
      fiveYearValue,
      efficiencyGain,
      recommendations
    };
  }, [currentEmployees, hourlyRate, hoursPerWeek, projectComplexity, hasLegacySystems, needsCompliance, industry]);

  // Animate number changes
  useEffect(() => {
    if (!showResults) return;

    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        callback(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    };

    // Animate all values
    animateValue(0, roiResults.totalCost, 1500, (value) => 
      setAnimatedValues(prev => ({ ...prev, totalCost: value }))
    );
    animateValue(0, roiResults.monthlySavings, 2000, (value) => 
      setAnimatedValues(prev => ({ ...prev, monthlySavings: value }))
    );
    animateValue(0, roiResults.yearlyROI, 2500, (value) => 
      setAnimatedValues(prev => ({ ...prev, yearlyROI: value }))
    );
    animateValue(0, roiResults.paybackPeriod, 1800, (value) => 
      setAnimatedValues(prev => ({ ...prev, paybackPeriod: value }))
    );
    animateValue(0, roiResults.fiveYearValue, 2200, (value) => 
      setAnimatedValues(prev => ({ ...prev, fiveYearValue: value }))
    );
    animateValue(0, roiResults.efficiencyGain, 1600, (value) => 
      setAnimatedValues(prev => ({ ...prev, efficiencyGain: value }))
    );
  }, [roiResults, showResults]);

  const handleCalculate = () => {
    setShowResults(true);
    
    trackEvent('roi_calculation_complete', 'conversion', 'roi_calculator', industry, roiResults.yearlyROI, {
      industry,
      employees: currentEmployees,
      projectComplexity,
      totalCost: roiResults.totalCost,
      yearlyROI: roiResults.yearlyROI,
      paybackPeriod: roiResults.paybackPeriod
    });

    if (onCalculationComplete) {
      onCalculationComplete(roiResults);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4"
        >
          <CalculatorIcon className="h-4 w-4 mr-2" />
          ROI Calculator - {industryContent.title}
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          Calculate Your Development ROI
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 max-w-3xl mx-auto"
        >
          Get personalized ROI projections based on your industry, team size, and project requirements
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h3>
          
          <div className="space-y-6">
            {/* Team Size */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UsersIcon className="h-4 w-4 mr-2 text-blue-600" />
                Number of Employees
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={currentEmployees}
                onChange={(e) => setCurrentEmployees(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span className="font-semibold text-blue-600">{currentEmployees}</span>
                <span>500+</span>
              </div>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-blue-600" />
                Average Hourly Rate ($)
              </label>
              <input
                type="range"
                min="25"
                max="200"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$25</span>
                <span className="font-semibold text-blue-600">${hourlyRate}</span>
                <span>$200+</span>
              </div>
            </div>

            {/* Manual Process Hours */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-4 w-4 mr-2 text-blue-600" />
                Manual Process Hours/Week
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5h</span>
                <span className="font-semibold text-blue-600">{hoursPerWeek}h</span>
                <span>40h+</span>
              </div>
            </div>

            {/* Project Complexity */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <ChartBarIcon className="h-4 w-4 mr-2 text-blue-600" />
                Project Complexity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['simple', 'medium', 'complex'] as const).map((complexity) => (
                  <button
                    key={complexity}
                    onClick={() => setProjectComplexity(complexity)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      projectComplexity === complexity
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="legacy"
                  checked={hasLegacySystems}
                  onChange={(e) => setHasLegacySystems(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="legacy" className="ml-3 text-sm text-gray-700">
                  Integration with legacy systems required
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="compliance"
                  checked={needsCompliance}
                  onChange={(e) => setNeedsCompliance(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="compliance" className="ml-3 text-sm text-gray-700">
                  Industry compliance requirements (HIPAA, SOC 2, etc.)
                </label>
              </div>
            </div>

            {/* Calculate Button */}
            <motion.button
              onClick={handleCalculate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Calculate ROI
            </motion.button>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-xl border border-blue-200 p-8"
        >
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center min-h-[500px]"
              >
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <TrendingUpIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Calculate
                </h3>
                <p className="text-gray-600 max-w-md">
                  Fill out your details on the left and click "Calculate ROI" to see your personalized projections for {industryContent.title.toLowerCase()}.
                </p>
                
                <div className="mt-8 space-y-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <LightBulbIcon className="h-4 w-4 mr-2 text-yellow-500" />
                    Industry-specific calculations for {industryContent.title}
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                    Based on 500+ completed projects
                  </div>
                  <div className="flex items-center">
                    <InformationCircleIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Conservative estimates with proven results
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your ROI Projection</h3>
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Project Investment</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(animatedValues.totalCost)}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                    <div className="text-sm text-gray-600 mb-1">Monthly Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(animatedValues.monthlySavings)}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Yearly ROI</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(animatedValues.yearlyROI, 1)}%
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                    <div className="text-sm text-gray-600 mb-1">Payback Period</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatNumber(animatedValues.paybackPeriod, 1)} mo
                    </div>
                  </div>
                </div>

                {/* Five Year Value */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90 mb-1">5-Year Net Value</div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(animatedValues.fiveYearValue)}
                      </div>
                    </div>
                    <TrendingUpIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                {/* Industry Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Benefits:</h4>
                  {roiResults.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + (index * 0.1) }}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {recommendation}
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 }}
                  className="mt-8"
                >
                  <a
                    href="/contact"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Get Detailed Proposal
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}