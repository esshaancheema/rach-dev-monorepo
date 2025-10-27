// AMP testing utilities and automated test runner

import { ampValidator, ampTester, AMPValidationResult } from './validator';
import { AMPComponentUtils } from './component-registry';

export interface AMPTestSuite {
  name: string;
  tests: AMPTest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface AMPTest {
  name: string;
  description: string;
  html: string;
  css?: string;
  expectedValid: boolean;
  expectedErrors?: string[];
  expectedWarnings?: string[];
  customValidation?: (result: AMPValidationResult) => boolean;
}

export interface AMPTestResult {
  test: AMPTest;
  result: AMPValidationResult;
  passed: boolean;
  errors: string[];
  duration: number;
}

export interface AMPTestSuiteResult {
  suite: AMPTestSuite;
  results: AMPTestResult[];
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

// Test runner for AMP validation
export class AMPTestRunner {
  private testSuites: AMPTestSuite[] = [];

  // Add test suite
  addTestSuite(suite: AMPTestSuite): void {
    this.testSuites.push(suite);
  }

  // Run all test suites
  async runAllTests(): Promise<AMPTestSuiteResult[]> {
    const results: AMPTestSuiteResult[] = [];

    for (const suite of this.testSuites) {
      const result = await this.runTestSuite(suite);
      results.push(result);
    }

    return results;
  }

  // Run specific test suite
  async runTestSuite(suite: AMPTestSuite): Promise<AMPTestSuiteResult> {
    const startTime = Date.now();
    const results: AMPTestResult[] = [];

    // Setup
    if (suite.setup) {
      await suite.setup();
    }

    try {
      // Run tests
      for (const test of suite.tests) {
        const result = await this.runTest(test);
        results.push(result);
      }
    } finally {
      // Teardown
      if (suite.teardown) {
        await suite.teardown();
      }
    }

    const duration = Date.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;

    return {
      suite,
      results,
      passed: failedTests === 0,
      totalTests: results.length,
      passedTests,
      failedTests,
      duration,
    };
  }

  // Run individual test
  async runTest(test: AMPTest): Promise<AMPTestResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Validate the test HTML
      const result = await ampValidator.validate(test.html, test.css);
      
      // Check if validation result matches expectations
      if (result.isValid !== test.expectedValid) {
        errors.push(
          `Expected ${test.expectedValid ? 'valid' : 'invalid'} AMP, got ${result.isValid ? 'valid' : 'invalid'}`
        );
      }

      // Check expected errors
      if (test.expectedErrors) {
        for (const expectedError of test.expectedErrors) {
          const found = result.errors.some(error => 
            error.message.includes(expectedError)
          );
          if (!found) {
            errors.push(`Expected error not found: ${expectedError}`);
          }
        }
      }

      // Check expected warnings
      if (test.expectedWarnings) {
        for (const expectedWarning of test.expectedWarnings) {
          const found = result.warnings.some(warning => 
            warning.message.includes(expectedWarning)
          );
          if (!found) {
            errors.push(`Expected warning not found: ${expectedWarning}`);
          }
        }
      }

      // Run custom validation if provided
      if (test.customValidation && !test.customValidation(result)) {
        errors.push('Custom validation failed');
      }

      const duration = Date.now() - startTime;

      return {
        test,
        result,
        passed: errors.length === 0,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      errors.push(`Test execution failed: ${error}`);

      return {
        test,
        result: {
          isValid: false,
          errors: [],
          warnings: [],
          performance: { cssSize: 0, cssOptimization: 0, imageOptimization: 0, componentCount: 0, cacheability: 0, score: 0 },
          seo: { hasStructuredData: false, hasMetaTags: false, hasOpenGraph: false, hasTwitterCard: false, hasCanonical: false, titleLength: 0, descriptionLength: 0, score: 0 },
          accessibility: { hasAltTexts: false, hasHeadingStructure: false, hasAriaLabels: false, hasSemanticMarkup: false, colorContrast: 0, score: 0 },
        },
        passed: false,
        errors,
        duration,
      };
    }
  }

  // Generate test report
  generateReport(results: AMPTestSuiteResult[]): string {
    let report = '# AMP Test Report\n\n';
    
    const totalSuites = results.length;
    const passedSuites = results.filter(r => r.passed).length;
    const totalTests = results.reduce((sum, r) => sum + r.totalTests, 0);
    const passedTests = results.reduce((sum, r) => sum + r.passedTests, 0);
    
    report += `## Summary\n`;
    report += `- **Test Suites**: ${passedSuites}/${totalSuites} passed\n`;
    report += `- **Test Cases**: ${passedTests}/${totalTests} passed\n`;
    report += `- **Success Rate**: ${Math.round((passedTests / totalTests) * 100)}%\n\n`;

    results.forEach(suiteResult => {
      report += `## ${suiteResult.suite.name}\n`;
      report += `**Status**: ${suiteResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
      report += `**Tests**: ${suiteResult.passedTests}/${suiteResult.totalTests} passed\n`;
      report += `**Duration**: ${suiteResult.duration}ms\n\n`;

      if (!suiteResult.passed) {
        const failedTests = suiteResult.results.filter(r => !r.passed);
        report += `### Failed Tests\n`;
        failedTests.forEach(testResult => {
          report += `- **${testResult.test.name}**: ${testResult.errors.join(', ')}\n`;
        });
        report += '\n';
      }
    });

    return report;
  }
}

// Predefined test suites
export const AMPTestSuites = {
  // Basic AMP structure validation
  basicStructure: {
    name: 'Basic AMP Structure',
    tests: [
      {
        name: 'Valid minimal AMP page',
        description: 'Test a minimal valid AMP page',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
            <link rel="canonical" href="https://example.com/test">
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
            <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
          </head>
          <body>
            <h1>Hello World</h1>
          </body>
          </html>
        `,
        expectedValid: true,
      },
      {
        name: 'Missing AMP attribute',
        description: 'Test page without ⚡ attribute',
        html: `
          <!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
          </head>
          <body>
            <h1>Hello World</h1>
          </body>
          </html>
        `,
        expectedValid: false,
        expectedErrors: ['mandatory attribute ⚡ or amp is missing'],
      },
      {
        name: 'Missing viewport meta',
        description: 'Test page without viewport meta tag',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
          </head>
          <body>
            <h1>Hello World</h1>
          </body>
          </html>
        `,
        expectedValid: false,
        expectedErrors: ['mandatory tag head > meta[name="viewport"] is missing'],
      },
    ],
  } as AMPTestSuite,

  // Component validation
  components: {
    name: 'AMP Components',
    tests: [
      {
        name: 'Valid amp-img',
        description: 'Test valid amp-img component',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both}</style>
            <noscript><style amp-boilerplate>body{-webkit-animation:none}</style></noscript>
          </head>
          <body>
            <amp-img src="test.jpg" alt="Test image" width="300" height="200" layout="responsive"></amp-img>
          </body>
          </html>
        `,
        expectedValid: true,
      },
      {
        name: 'amp-img without alt',
        description: 'Test amp-img without alt attribute',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both}</style>
            <noscript><style amp-boilerplate>body{-webkit-animation:none}</style></noscript>
          </head>
          <body>
            <amp-img src="test.jpg" width="300" height="200"></amp-img>
          </body>
          </html>
        `,
        expectedValid: false,
        expectedErrors: ['amp-img requires alt attribute'],
      },
      {
        name: 'Invalid img tag',
        description: 'Test regular img tag instead of amp-img',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both}</style>
            <noscript><style amp-boilerplate>body{-webkit-animation:none}</style></noscript>
          </head>
          <body>
            <img src="test.jpg" alt="Test image" width="300" height="200">
          </body>
          </html>
        `,
        expectedValid: false,
        expectedErrors: ['Use amp-img instead of img'],
      },
    ],
  } as AMPTestSuite,

  // CSS validation
  css: {
    name: 'CSS Validation',
    tests: [
      {
        name: 'Valid CSS under 75KB',
        description: 'Test CSS within size limits',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
            <style amp-custom>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 1200px; margin: 0 auto; }
            </style>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both}</style>
            <noscript><style amp-boilerplate>body{-webkit-animation:none}</style></noscript>
          </head>
          <body>
            <div class="container">
              <h1>Hello World</h1>
            </div>
          </body>
          </html>
        `,
        css: 'body { font-family: Arial, sans-serif; } .container { max-width: 1200px; margin: 0 auto; }',
        expectedValid: true,
      },
      {
        name: 'CSS with forbidden properties',
        description: 'Test CSS with forbidden properties',
        html: `
          <!doctype html>
          <html ⚡>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <title>Test Page</title>
            <style amp-custom>
              .zoom { zoom: 1.5; }
            </style>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both}</style>
            <noscript><style amp-boilerplate>body{-webkit-animation:none}</style></noscript>
          </head>
          <body>
            <div class="zoom">Content</div>
          </body>
          </html>
        `,
        css: '.zoom { zoom: 1.5; }',
        expectedValid: false,
        expectedErrors: ['Forbidden CSS property: zoom'],
      },
    ],
  } as AMPTestSuite,
};

// Performance testing utilities
export class AMPPerformanceTester {
  // Test AMP page loading performance
  async testPageLoad(url: string): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    recommendations: string[];
  }> {
    try {
      const startTime = performance.now();
      
      // Simulate performance testing
      // In a real implementation, this would use tools like Lighthouse
      const loadTime = Math.random() * 1000 + 500; // 500-1500ms
      const domContentLoaded = loadTime * 0.6;
      const firstContentfulPaint = loadTime * 0.4;
      const largestContentfulPaint = loadTime * 0.8;
      const cumulativeLayoutShift = Math.random() * 0.1;
      
      const recommendations: string[] = [];
      
      if (loadTime > 1000) {
        recommendations.push('Optimize images and reduce resource sizes');
      }
      
      if (firstContentfulPaint > 400) {
        recommendations.push('Optimize critical rendering path');
      }
      
      if (cumulativeLayoutShift > 0.05) {
        recommendations.push('Reduce layout shifts by setting image dimensions');
      }
      
      return {
        loadTime,
        domContentLoaded,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        recommendations,
      };
    } catch (error) {
      throw new Error(`Performance test failed: ${error}`);
    }
  }

  // Test AMP cache performance
  async testCachePerformance(url: string): Promise<{
    cacheHit: boolean;
    cacheAge: number;
    cdnLatency: number;
    recommendations: string[];
  }> {
    try {
      // Simulate cache testing
      const cacheHit = Math.random() > 0.3; // 70% cache hit rate
      const cacheAge = cacheHit ? Math.random() * 3600 : 0; // 0-1 hour
      const cdnLatency = Math.random() * 50 + 10; // 10-60ms
      
      const recommendations: string[] = [];
      
      if (!cacheHit) {
        recommendations.push('Enable AMP caching for better performance');
      }
      
      if (cdnLatency > 40) {
        recommendations.push('Consider using a faster CDN');
      }
      
      return {
        cacheHit,
        cacheAge,
        cdnLatency,
        recommendations,
      };
    } catch (error) {
      throw new Error(`Cache performance test failed: ${error}`);
    }
  }
}

// Automated testing utilities
export class AMPAutomatedTester {
  private testRunner = new AMPTestRunner();
  private performanceTester = new AMPPerformanceTester();

  // Run comprehensive AMP tests
  async runComprehensiveTests(urls: string[]): Promise<{
    validation: AMPTestSuiteResult[];
    performance: any[];
    summary: {
      totalUrls: number;
      validAmp: number;
      performanceScore: number;
      recommendations: string[];
    };
  }> {
    // Add predefined test suites
    this.testRunner.addTestSuite(AMPTestSuites.basicStructure);
    this.testRunner.addTestSuite(AMPTestSuites.components);
    this.testRunner.addTestSuite(AMPTestSuites.css);

    // Run validation tests
    const validation = await this.testRunner.runAllTests();

    // Run performance tests
    const performance = await Promise.all(
      urls.map(async url => {
        try {
          const pageLoad = await this.performanceTester.testPageLoad(url);
          const cache = await this.performanceTester.testCachePerformance(url);
          const ampTest = await ampTester.testAMPPage(url);
          
          return {
            url,
            pageLoad,
            cache,
            amp: ampTest,
          };
        } catch (error) {
          return {
            url,
            error: error.toString(),
          };
        }
      })
    );

    // Generate summary
    const totalUrls = urls.length;
    const validAmp = performance.filter(p => !p.error && p.amp?.validation.isValid).length;
    const performanceScores = performance
      .filter(p => !p.error && p.amp?.validation.performance.score)
      .map(p => p.amp.validation.performance.score);
    const performanceScore = performanceScores.length > 0 
      ? Math.round(performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length)
      : 0;

    const recommendations: string[] = [];
    if (validAmp < totalUrls) {
      recommendations.push(`${totalUrls - validAmp} pages have AMP validation errors`);
    }
    if (performanceScore < 80) {
      recommendations.push('Optimize page performance for better user experience');
    }

    return {
      validation,
      performance,
      summary: {
        totalUrls,
        validAmp,
        performanceScore,
        recommendations,
      },
    };
  }
}

// Export testing utilities
export const ampTestRunner = new AMPTestRunner();
export const ampPerformanceTester = new AMPPerformanceTester();
export const ampAutomatedTester = new AMPAutomatedTester();