#!/usr/bin/env node

/**
 * Consolidated Performance Report Generator
 * Combines K6 and Artillery test results into a comprehensive HTML report
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = process.argv[2] || './results';

// Report data structure
const reportData = {
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalRequests: 0,
    avgResponseTime: 0,
    errorRate: 0,
    throughput: 0
  },
  k6Results: [],
  artilleryResults: [],
  recommendations: []
};

// Load and parse K6 results
function loadK6Results() {
  const k6Files = fs.readdirSync(RESULTS_DIR)
    .filter(file => file.startsWith('k6-') && file.endsWith('.json'));
  
  for (const file of k6Files) {
    try {
      const filePath = path.join(RESULTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const testName = file.replace('k6-', '').replace('-results.json', '');
      const result = parseK6Result(testName, data);
      
      reportData.k6Results.push(result);
      reportData.summary.totalTests++;
      
      if (result.passed) {
        reportData.summary.passedTests++;
      }
      
      // Aggregate metrics
      reportData.summary.totalRequests += result.requests || 0;
      reportData.summary.avgResponseTime += result.avgResponseTime || 0;
      reportData.summary.errorRate += result.errorRate || 0;
      reportData.summary.throughput += result.throughput || 0;
      
    } catch (error) {
      console.error(`Error parsing K6 result ${file}:`, error.message);
    }
  }
}

// Load and parse Artillery results
function loadArtilleryResults() {
  const artilleryFiles = fs.readdirSync(RESULTS_DIR)
    .filter(file => file.startsWith('artillery-') && file.endsWith('.json'));
  
  for (const file of artilleryFiles) {
    try {
      const filePath = path.join(RESULTS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const testName = file.replace('artillery-', '').replace('-results.json', '');
      const result = parseArtilleryResult(testName, data);
      
      reportData.artilleryResults.push(result);
      reportData.summary.totalTests++;
      
      if (result.passed) {
        reportData.summary.passedTests++;
      }
      
    } catch (error) {
      console.error(`Error parsing Artillery result ${file}:`, error.message);
    }
  }
}

// Parse K6 result data
function parseK6Result(testName, data) {
  const metrics = data.metrics || {};
  const thresholds = data.thresholds || {};
  
  const httpReqs = metrics.http_reqs?.values?.count || 0;
  const httpReqDuration = metrics.http_req_duration?.values || {};
  const httpReqFailed = metrics.http_req_failed?.values?.rate || 0;
  
  const allThresholdsPassed = Object.values(thresholds).every(t => t.ok);
  
  return {
    name: testName,
    type: 'K6',
    passed: allThresholdsPassed,
    requests: httpReqs,
    avgResponseTime: httpReqDuration.avg || 0,
    p95ResponseTime: httpReqDuration['p(95)'] || 0,
    p99ResponseTime: httpReqDuration['p(99)'] || 0,
    maxResponseTime: httpReqDuration.max || 0,
    errorRate: httpReqFailed * 100,
    throughput: metrics.http_reqs?.values?.rate || 0,
    duration: data.state?.testRunDurationMs || 0,
    vus: metrics.vus_max?.values?.value || 0,
    iterations: metrics.iterations?.values?.count || 0,
    thresholds: Object.entries(thresholds).map(([key, value]) => ({
      name: key,
      passed: value.ok,
      thresholds: value.thresholds || []
    })),
    customMetrics: extractCustomMetrics(metrics, 'k6')
  };
}

// Parse Artillery result data
function parseArtilleryResult(testName, data) {
  const aggregate = data.aggregate || {};
  const intermediate = data.intermediate || [];
  
  const requests = aggregate.requestsCompleted || 0;
  const errors = aggregate.errors || 0;
  const errorRate = requests > 0 ? (errors / requests) * 100 : 0;
  
  return {
    name: testName,
    type: 'Artillery',
    passed: errorRate < 5, // Consider passed if error rate < 5%
    requests: requests,
    errors: errors,
    errorRate: errorRate,
    avgResponseTime: aggregate.latency?.mean || 0,
    p95ResponseTime: aggregate.latency?.p95 || 0,
    p99ResponseTime: aggregate.latency?.p99 || 0,
    maxResponseTime: aggregate.latency?.max || 0,
    throughput: aggregate.rps?.mean || 0,
    duration: calculateTestDuration(intermediate),
    scenarios: aggregate.scenariosCompleted || 0,
    websocketConnections: aggregate.websocketConnectionsCreated || 0,
    customMetrics: extractCustomMetrics(aggregate, 'artillery')
  };
}

// Extract custom metrics
function extractCustomMetrics(metrics, type) {
  const customMetrics = [];
  
  for (const [key, value] of Object.entries(metrics)) {
    if (key.startsWith('custom_') || key.includes('_custom_')) {
      customMetrics.push({
        name: key,
        value: type === 'k6' ? value.values : value,
        type: type
      });
    }
  }
  
  return customMetrics;
}

// Calculate test duration from intermediate data
function calculateTestDuration(intermediate) {
  if (!intermediate || intermediate.length === 0) return 0;
  
  const timestamps = intermediate.map(i => new Date(i.timestamp).getTime());
  return Math.max(...timestamps) - Math.min(...timestamps);
}

// Generate performance recommendations
function generateRecommendations() {
  const recommendations = [];
  
  // Calculate overall metrics
  const avgErrorRate = reportData.summary.errorRate / Math.max(reportData.summary.totalTests, 1);
  const avgResponseTime = reportData.summary.avgResponseTime / Math.max(reportData.summary.totalTests, 1);
  const successRate = (reportData.summary.passedTests / Math.max(reportData.summary.totalTests, 1)) * 100;
  
  // Error rate recommendations
  if (avgErrorRate > 5) {
    recommendations.push({
      priority: 'high',
      category: 'reliability',
      title: 'High Error Rate Detected',
      description: `Average error rate of ${avgErrorRate.toFixed(2)}% exceeds acceptable threshold of 5%`,
      suggestions: [
        'Review application error logs for common failure patterns',
        'Implement circuit breaker patterns for external dependencies',
        'Add comprehensive error handling and retry mechanisms',
        'Scale up infrastructure resources if errors are capacity-related'
      ]
    });
  }
  
  // Response time recommendations
  if (avgResponseTime > 1000) {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'Slow Response Times',
      description: `Average response time of ${avgResponseTime.toFixed(0)}ms exceeds target of 1000ms`,
      suggestions: [
        'Implement caching strategies (Redis, CDN, application-level)',
        'Optimize database queries and add appropriate indexes',
        'Consider implementing pagination for large data sets',
        'Review and optimize API endpoint implementations'
      ]
    });
  }
  
  // Success rate recommendations
  if (successRate < 80) {
    recommendations.push({
      priority: 'high',
      category: 'stability',
      title: 'Low Test Success Rate',
      description: `Only ${successRate.toFixed(1)}% of performance tests passed`,
      suggestions: [
        'Review failed test thresholds and adjust if unrealistic',
        'Investigate system capacity limits and bottlenecks',
        'Implement auto-scaling policies for variable load',
        'Consider load balancing across multiple instances'
      ]
    });
  }
  
  // K6-specific recommendations
  const k6Tests = reportData.k6Results;
  const highLatencyK6Tests = k6Tests.filter(test => test.p95ResponseTime > 2000);
  
  if (highLatencyK6Tests.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      title: 'High Latency in API Tests',
      description: `${highLatencyK6Tests.length} K6 tests showed P95 latency > 2000ms`,
      suggestions: [
        'Profile slow API endpoints using APM tools',
        'Implement database connection pooling',
        'Consider asynchronous processing for heavy operations',
        'Add monitoring for slow query detection'
      ]
    });
  }
  
  // Artillery-specific recommendations
  const artilleryTests = reportData.artilleryResults;
  const websocketTests = artilleryTests.filter(test => test.websocketConnections > 0);
  
  if (websocketTests.length > 0) {
    const avgWSConnections = websocketTests.reduce((sum, test) => sum + test.websocketConnections, 0) / websocketTests.length;
    
    if (avgWSConnections < 50) {
      recommendations.push({
        priority: 'low',
        category: 'scalability',
        title: 'Limited WebSocket Concurrency',
        description: `Average WebSocket connections (${avgWSConnections.toFixed(0)}) may limit real-time features`,
        suggestions: [
          'Optimize WebSocket connection handling',
          'Implement connection pooling for WebSocket servers',
          'Consider horizontal scaling of WebSocket services',
          'Add WebSocket connection limits and graceful degradation'
        ]
      });
    }
  }
  
  reportData.recommendations = recommendations;
}

// Generate HTML report
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zoptal Platform - Performance Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .subtitle {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            text-align: center;
            border-left: 4px solid #3498db;
        }
        
        .summary-card.success { border-left-color: #27ae60; }
        .summary-card.warning { border-left-color: #f39c12; }
        .summary-card.error { border-left-color: #e74c3c; }
        
        .summary-card h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 5px;
        }
        
        .summary-card.success .value { color: #27ae60; }
        .summary-card.warning .value { color: #f39c12; }
        .summary-card.error .value { color: #e74c3c; }
        
        .summary-card .unit {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .section {
            padding: 40px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .section:last-child {
            border-bottom: none;
        }
        
        .section h2 {
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 1.8em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 25px;
        }
        
        .test-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            position: relative;
            border-left: 4px solid #3498db;
        }
        
        .test-card.passed { border-left-color: #27ae60; }
        .test-card.failed { border-left-color: #e74c3c; }
        
        .test-card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .test-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .test-badge.k6 { background: #3498db; color: white; }
        .test-badge.artillery { background: #e67e22; color: white; }
        
        .test-metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .metric:last-child {
            border-bottom: none;
        }
        
        .metric-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .metric-value {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .recommendations {
            background: #f8f9fa;
        }
        
        .recommendation {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        }
        
        .recommendation.high { border-left-color: #e74c3c; }
        .recommendation.medium { border-left-color: #f39c12; }
        .recommendation.low { border-left-color: #95a5a6; }
        
        .recommendation h4 {
            color: #2c3e50;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .priority-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7em;
            text-transform: uppercase;
            font-weight: bold;
        }
        
        .priority-badge.high { background: #e74c3c; color: white; }
        .priority-badge.medium { background: #f39c12; color: white; }
        .priority-badge.low { background: #95a5a6; color: white; }
        
        .recommendation ul {
            margin-left: 20px;
            margin-top: 10px;
        }
        
        .recommendation li {
            margin-bottom: 5px;
            color: #5d6d7e;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            opacity: 0.8;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-indicator.passed { background: #27ae60; }
        .status-indicator.failed { background: #e74c3c; }
        
        @media (max-width: 768px) {
            .test-grid {
                grid-template-columns: 1fr;
            }
            
            .test-metrics {
                grid-template-columns: 1fr;
            }
            
            .summary {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Test Report</h1>
            <p class="subtitle">Comprehensive performance analysis for Zoptal Platform</p>
            <p style="margin-top: 10px; opacity: 0.7;">Generated on ${new Date().toISOString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card ${reportData.summary.passedTests === reportData.summary.totalTests ? 'success' : 'warning'}">
                <h3>Test Success Rate</h3>
                <div class="value">${Math.round((reportData.summary.passedTests / Math.max(reportData.summary.totalTests, 1)) * 100)}</div>
                <div class="unit">%</div>
            </div>
            
            <div class="summary-card">
                <h3>Total Requests</h3>
                <div class="value">${reportData.summary.totalRequests.toLocaleString()}</div>
                <div class="unit">requests</div>
            </div>
            
            <div class="summary-card ${reportData.summary.avgResponseTime / Math.max(reportData.summary.totalTests, 1) > 1000 ? 'warning' : 'success'}">
                <h3>Avg Response Time</h3>
                <div class="value">${Math.round(reportData.summary.avgResponseTime / Math.max(reportData.summary.totalTests, 1))}</div>
                <div class="unit">ms</div>
            </div>
            
            <div class="summary-card ${reportData.summary.errorRate / Math.max(reportData.summary.totalTests, 1) > 5 ? 'error' : 'success'}">
                <h3>Error Rate</h3>
                <div class="value">${(reportData.summary.errorRate / Math.max(reportData.summary.totalTests, 1)).toFixed(1)}</div>
                <div class="unit">%</div>
            </div>
        </div>
        
        ${reportData.k6Results.length > 0 ? `
        <div class="section">
            <h2>📊 K6 Performance Tests</h2>
            <div class="test-grid">
                ${reportData.k6Results.map(test => `
                <div class="test-card ${test.passed ? 'passed' : 'failed'}">
                    <h3>
                        <span>
                            <span class="status-indicator ${test.passed ? 'passed' : 'failed'}"></span>
                            ${test.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span class="test-badge k6">K6</span>
                    </h3>
                    <div class="test-metrics">
                        <div class="metric">
                            <span class="metric-label">Requests</span>
                            <span class="metric-value">${test.requests.toLocaleString()}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Error Rate</span>
                            <span class="metric-value">${test.errorRate.toFixed(2)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Avg Response</span>
                            <span class="metric-value">${Math.round(test.avgResponseTime)}ms</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">P95 Response</span>
                            <span class="metric-value">${Math.round(test.p95ResponseTime)}ms</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Throughput</span>
                            <span class="metric-value">${test.throughput.toFixed(1)} RPS</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Max VUs</span>
                            <span class="metric-value">${test.vus}</span>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${reportData.artilleryResults.length > 0 ? `
        <div class="section">
            <h2>🎯 Artillery Performance Tests</h2>
            <div class="test-grid">
                ${reportData.artilleryResults.map(test => `
                <div class="test-card ${test.passed ? 'passed' : 'failed'}">
                    <h3>
                        <span>
                            <span class="status-indicator ${test.passed ? 'passed' : 'failed'}"></span>
                            ${test.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span class="test-badge artillery">Artillery</span>
                    </h3>
                    <div class="test-metrics">
                        <div class="metric">
                            <span class="metric-label">Requests</span>
                            <span class="metric-value">${test.requests.toLocaleString()}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Errors</span>
                            <span class="metric-value">${test.errors}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Error Rate</span>
                            <span class="metric-value">${test.errorRate.toFixed(2)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Avg Response</span>
                            <span class="metric-value">${Math.round(test.avgResponseTime)}ms</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Throughput</span>
                            <span class="metric-value">${test.throughput.toFixed(1)} RPS</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">WebSocket Connections</span>
                            <span class="metric-value">${test.websocketConnections || 0}</span>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${reportData.recommendations.length > 0 ? `
        <div class="section recommendations">
            <h2>💡 Performance Recommendations</h2>
            ${reportData.recommendations.map(rec => `
            <div class="recommendation ${rec.priority}">
                <h4>
                    ${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'}
                    ${rec.title}
                    <span class="priority-badge ${rec.priority}">${rec.priority}</span>
                </h4>
                <p style="color: #5d6d7e; margin-bottom: 10px;">${rec.description}</p>
                <ul>
                    ${rec.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                </ul>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Performance testing completed with K6 and Artillery • Zoptal Platform Performance Suite</p>
            <p style="margin-top: 10px;">For detailed analysis, review individual test result files and metrics</p>
        </div>
    </div>
</body>
</html>
  `;
  
  const reportPath = path.join(RESULTS_DIR, 'consolidated-report.html');
  fs.writeFileSync(reportPath, html);
  console.log(`✅ Consolidated report generated: ${reportPath}`);
}

// Main execution
function main() {
  console.log('🚀 Generating consolidated performance report...');
  
  // Ensure results directory exists
  if (!fs.existsSync(RESULTS_DIR)) {
    console.error(`❌ Results directory not found: ${RESULTS_DIR}`);
    process.exit(1);
  }
  
  try {
    // Load test results
    loadK6Results();
    loadArtilleryResults();
    
    // Generate recommendations
    generateRecommendations();
    
    // Generate HTML report
    generateHTMLReport();
    
    // Generate summary JSON
    const summaryPath = path.join(RESULTS_DIR, 'performance-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(reportData, null, 2));
    console.log(`✅ Performance summary JSON: ${summaryPath}`);
    
    console.log('\n📊 Performance Test Summary:');
    console.log(`   Total Tests: ${reportData.summary.totalTests}`);
    console.log(`   Passed: ${reportData.summary.passedTests}`);
    console.log(`   Failed: ${reportData.summary.totalTests - reportData.summary.passedTests}`);
    console.log(`   Success Rate: ${Math.round((reportData.summary.passedTests / Math.max(reportData.summary.totalTests, 1)) * 100)}%`);
    console.log(`   Total Requests: ${reportData.summary.totalRequests.toLocaleString()}`);
    console.log(`   Recommendations: ${reportData.recommendations.length}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateRecommendations, loadK6Results, loadArtilleryResults };