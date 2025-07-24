import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
  },
};

const BASE_URL = 'https://staging.lpg-distributor.com';

export default function () {
  // Test health endpoint
  let healthResponse = http.get(`${BASE_URL}/api/health`);
  check(healthResponse, {
    'health endpoint status is 200': (r) => r.status === 200,
    'health endpoint response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test auth login page
  let loginResponse = http.get(`${BASE_URL}/auth/login`);
  check(loginResponse, {
    'login page status is 200': (r) => r.status === 200,
    'login page response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Test dashboard (should redirect to login for unauthenticated users)
  let dashboardResponse = http.get(`${BASE_URL}/dashboard`);
  check(dashboardResponse, {
    'dashboard redirects properly': (r) => r.status === 200 || r.status === 302,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance-results.json': JSON.stringify(data, null, 2),
  };
}
