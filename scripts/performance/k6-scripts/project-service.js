import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  vus: __ENV.K6_VUS || 10,
  duration: __ENV.K6_DURATION || '60s',
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3002';

// Mock authentication token (in real scenario, this would be obtained from auth service)
const AUTH_TOKEN = 'mock-jwt-token';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  };

  // Test 1: Health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(0.1);

  // Test 2: List projects
  const listResponse = http.get(`${BASE_URL}/api/projects`, { headers });
  check(listResponse, {
    'list projects status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'list projects response time < 2000ms': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(0.2);

  // Test 3: Create project
  const projectPayload = {
    name: `Test Project ${Math.random().toString(36).substring(7)}`,
    description: 'Performance test project',
    type: 'web',
    settings: {
      framework: 'react',
      buildTool: 'vite',
    },
  };

  const createResponse = http.post(
    `${BASE_URL}/api/projects`,
    JSON.stringify(projectPayload),
    { headers }
  );

  const createSuccess = check(createResponse, {
    'create project status is 201 or 401': (r) => r.status === 201 || r.status === 401,
    'create project response time < 3000ms': (r) => r.timings.duration < 3000,
  });

  if (!createSuccess) errorRate.add(1);

  let projectId = null;
  if (createResponse.status === 201) {
    try {
      const projectData = JSON.parse(createResponse.body);
      projectId = projectData.id;
    } catch (e) {
      console.error('Failed to parse create project response');
    }
  }

  sleep(0.3);

  // Test 4: Get project details (if we have a project ID)
  if (projectId) {
    const detailsResponse = http.get(`${BASE_URL}/api/projects/${projectId}`, { headers });
    check(detailsResponse, {
      'get project details status is 200': (r) => r.status === 200,
      'get project details response time < 1500ms': (r) => r.timings.duration < 1500,
    }) || errorRate.add(1);

    sleep(0.1);

    // Test 5: Update project
    const updatePayload = {
      name: `Updated Project ${Math.random().toString(36).substring(7)}`,
      description: 'Updated description for performance test',
    };

    const updateResponse = http.put(
      `${BASE_URL}/api/projects/${projectId}`,
      JSON.stringify(updatePayload),
      { headers }
    );

    check(updateResponse, {
      'update project status is 200': (r) => r.status === 200,
      'update project response time < 2000ms': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);

    sleep(0.2);

    // Test 6: List project files
    const filesResponse = http.get(`${BASE_URL}/api/projects/${projectId}/files`, { headers });
    check(filesResponse, {
      'list project files status is 200': (r) => r.status === 200,
      'list project files response time < 1500ms': (r) => r.timings.duration < 1500,
    }) || errorRate.add(1);

    sleep(0.1);

    // Test 7: Create project file
    const filePayload = {
      path: `src/components/Test${Math.random().toString(36).substring(7)}.tsx`,
      content: 'export default function TestComponent() { return <div>Test</div>; }',
      type: 'file',
    };

    const createFileResponse = http.post(
      `${BASE_URL}/api/projects/${projectId}/files`,
      JSON.stringify(filePayload),
      { headers }
    );

    check(createFileResponse, {
      'create project file status is 201': (r) => r.status === 201,
      'create project file response time < 2000ms': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);

    sleep(0.2);

    // Test 8: Build project
    const buildResponse = http.post(
      `${BASE_URL}/api/projects/${projectId}/build`,
      JSON.stringify({ environment: 'development' }),
      { headers }
    );

    check(buildResponse, {
      'build project status is 200 or 202': (r) => r.status === 200 || r.status === 202,
      'build project response time < 5000ms': (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);

    sleep(0.3);

    // Test 9: Get build status
    const buildStatusResponse = http.get(
      `${BASE_URL}/api/projects/${projectId}/builds/latest`,
      { headers }
    );

    check(buildStatusResponse, {
      'get build status is 200': (r) => r.status === 200,
      'get build status response time < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    sleep(0.1);

    // Test 10: Deploy project
    const deployResponse = http.post(
      `${BASE_URL}/api/projects/${projectId}/deploy`,
      JSON.stringify({ 
        environment: 'staging',
        branch: 'main',
      }),
      { headers }
    );

    check(deployResponse, {
      'deploy project status is 200 or 202': (r) => r.status === 200 || r.status === 202,
      'deploy project response time < 3000ms': (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);

    sleep(0.2);

    // Test 11: Get deployment status
    const deployStatusResponse = http.get(
      `${BASE_URL}/api/projects/${projectId}/deployments/latest`,
      { headers }
    );

    check(deployStatusResponse, {
      'get deployment status is 200': (r) => r.status === 200,
      'get deployment status response time < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    sleep(0.1);

    // Test 12: Delete project (cleanup)
    const deleteResponse = http.del(`${BASE_URL}/api/projects/${projectId}`, { headers });
    check(deleteResponse, {
      'delete project status is 200 or 204': (r) => r.status === 200 || r.status === 204,
      'delete project response time < 2000ms': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
  }

  sleep(0.5);

  // Test 13: Search projects
  const searchResponse = http.get(
    `${BASE_URL}/api/projects/search?q=test&limit=10`,
    { headers }
  );

  check(searchResponse, {
    'search projects status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'search projects response time < 1500ms': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1);

  sleep(0.1);

  // Test 14: Get project templates
  const templatesResponse = http.get(`${BASE_URL}/api/templates`, { headers });
  check(templatesResponse, {
    'get templates status is 200': (r) => r.status === 200,
    'get templates response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(0.2);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`k6-results-project-service-${Date.now()}.json`]: JSON.stringify(data),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const colors = options.enableColors;
  
  let summary = '';
  
  if (colors) {
    summary += `\n${indent}\x1b[36m=== Project Service Performance Test Results ===\x1b[0m\n`;
  } else {
    summary += `\n${indent}=== Project Service Performance Test Results ===\n`;
  }
  
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.count}\n`;
  summary += `${indent}Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n`;
  summary += `${indent}Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  
  return summary;
}