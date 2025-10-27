#!/bin/bash
# test-environment.sh - Automated testing environment setup

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Test configuration
TEST_DB_NAME="zoptal_test"
TEST_DB_PORT="5433"
TEST_REDIS_PORT="6380"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup       Set up test environment"
    echo "  start       Start test services"
    echo "  stop        Stop test services"
    echo "  reset       Reset test environment (clears data)"
    echo "  run [type]  Run specific tests"
    echo "  seed        Seed test database with fixtures"
    echo "  clean       Clean test artifacts"
    echo "  status      Show test environment status"
    echo ""
    echo "Test Types:"
    echo "  unit        Run unit tests"
    echo "  integration Run integration tests"
    echo "  e2e         Run end-to-end tests"
    echo "  load        Run load tests"
    echo "  security    Run security tests"
    echo "  all         Run all tests"
    echo ""
    echo "Options:"
    echo "  --coverage  Generate coverage reports"
    echo "  --watch     Run tests in watch mode"
    echo "  --debug     Run tests in debug mode"
    echo "  --parallel  Run tests in parallel"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 run unit --coverage"
    echo "  $0 run e2e --debug"
    echo "  $0 reset"
}

# Setup test environment
setup_test_environment() {
    log_info "Setting up test environment..."
    
    # Create test Docker Compose configuration
    create_test_docker_compose
    
    # Start test services
    start_test_services
    
    # Setup test database
    setup_test_database
    
    # Create test fixtures
    create_test_fixtures
    
    # Create test configuration files
    create_test_configs
    
    log_success "Test environment setup completed!"
}

# Create test Docker Compose configuration
create_test_docker_compose() {
    log_info "Creating test Docker Compose configuration..."
    
    cat > "${PROJECT_ROOT}/docker-compose.test.yml" << 'EOF'
version: '3.8'

services:
  # Test PostgreSQL
  postgres-test:
    image: postgres:15-alpine
    container_name: zoptal-postgres-test
    restart: unless-stopped
    environment:
      POSTGRES_DB: zoptal_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
      - ./scripts/dev-setup/init-test-db.sql:/docker-entrypoint-initdb.d/init-test-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10

  # Test Redis
  redis-test:
    image: redis:7-alpine
    container_name: zoptal-redis-test
    restart: unless-stopped
    ports:
      - "6380:6379"
    volumes:
      - redis_test_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  # MinIO for testing file uploads
  minio-test:
    image: quay.io/minio/minio:latest
    container_name: zoptal-minio-test
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: testuser
      MINIO_ROOT_PASSWORD: testpass123
    ports:
      - "9010:9000"
      - "9011:9001"
    volumes:
      - minio_test_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Test mail server
  mailhog-test:
    image: mailhog/mailhog:latest
    container_name: zoptal-mailhog-test
    restart: unless-stopped
    ports:
      - "1026:1025"  # SMTP
      - "8026:8025"  # Web UI

volumes:
  postgres_test_data:
  redis_test_data:
  minio_test_data:

networks:
  default:
    name: zoptal-test-network
EOF
    
    log_success "Test Docker Compose configuration created"
}

# Create test database initialization script
create_test_db_init() {
    log_info "Creating test database initialization script..."
    
    cat > "${SCRIPT_DIR}/init-test-db.sql" << 'EOF'
-- Initialize test databases

-- Create additional test databases for isolation
CREATE DATABASE zoptal_test_unit;
CREATE DATABASE zoptal_test_integration;
CREATE DATABASE zoptal_test_e2e;

-- Create extensions for all test databases
\c zoptal_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c zoptal_test_unit;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c zoptal_test_integration;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c zoptal_test_e2e;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
EOF
    
    log_success "Test database initialization script created"
}

# Start test services
start_test_services() {
    log_info "Starting test services..."
    
    cd "$PROJECT_ROOT"
    
    # Create test database init script if it doesn't exist
    if [[ ! -f "${SCRIPT_DIR}/init-test-db.sql" ]]; then
        create_test_db_init
    fi
    
    # Start test services
    docker-compose -f docker-compose.test.yml up -d
    
    # Wait for services to be ready
    log_info "Waiting for test services to be ready..."
    
    local retries=30
    while ! docker exec zoptal-postgres-test pg_isready -U postgres &>/dev/null; do
        retries=$((retries - 1))
        if [ $retries -eq 0 ]; then
            log_error "Test PostgreSQL failed to start"
            exit 1
        fi
        log_info "Waiting for test PostgreSQL... ($retries retries left)"
        sleep 2
    done
    
    retries=30
    while ! docker exec zoptal-redis-test redis-cli ping &>/dev/null; do
        retries=$((retries - 1))
        if [ $retries -eq 0 ]; then
            log_error "Test Redis failed to start"
            exit 1
        fi
        log_info "Waiting for test Redis... ($retries retries left)"
        sleep 2
    done
    
    log_success "Test services are ready!"
}

# Stop test services
stop_test_services() {
    log_info "Stopping test services..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.test.yml down
    
    log_success "Test services stopped"
}

# Setup test database
setup_test_database() {
    log_info "Setting up test database..."
    
    cd "${PROJECT_ROOT}/packages/database"
    
    # Set test environment
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/zoptal_test"
    
    # Run migrations
    pnpm prisma migrate deploy
    
    # Generate Prisma client
    pnpm prisma generate
    
    log_success "Test database setup completed"
}

# Create test fixtures
create_test_fixtures() {
    log_info "Creating test fixtures..."
    
    mkdir -p "${PROJECT_ROOT}/tests/fixtures"
    
    # User fixtures
    cat > "${PROJECT_ROOT}/tests/fixtures/users.json" << 'EOF'
{
  "testUser": {
    "email": "test@example.com",
    "name": "Test User",
    "password": "hashedpassword123",
    "emailVerified": true,
    "role": "USER"
  },
  "adminUser": {
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "hashedpassword123",
    "emailVerified": true,
    "role": "ADMIN"
  },
  "premiumUser": {
    "email": "premium@example.com",
    "name": "Premium User",
    "password": "hashedpassword123",
    "emailVerified": true,
    "role": "USER",
    "subscription": {
      "plan": "PREMIUM",
      "status": "ACTIVE"
    }
  }
}
EOF
    
    # Project fixtures
    cat > "${PROJECT_ROOT}/tests/fixtures/projects.json" << 'EOF'
{
  "sampleProject": {
    "name": "Sample Project",
    "description": "A sample project for testing",
    "type": "WEBSITE",
    "status": "ACTIVE",
    "settings": {
      "theme": "modern",
      "analytics": true
    }
  },
  "draftProject": {
    "name": "Draft Project",
    "description": "A draft project",
    "type": "LANDING_PAGE",
    "status": "DRAFT"
  }
}
EOF
    
    # API responses fixtures
    cat > "${PROJECT_ROOT}/tests/fixtures/api-responses.json" << 'EOF'
{
  "authSuccess": {
    "user": {
      "id": "test-user-id",
      "email": "test@example.com",
      "name": "Test User"
    },
    "tokens": {
      "access": "mock-access-token",
      "refresh": "mock-refresh-token"
    }
  },
  "authError": {
    "error": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "projectsList": {
    "projects": [
      {
        "id": "project-1",
        "name": "Test Project 1",
        "status": "ACTIVE"
      },
      {
        "id": "project-2",
        "name": "Test Project 2",
        "status": "DRAFT"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
EOF
    
    log_success "Test fixtures created"
}

# Create test configuration files
create_test_configs() {
    log_info "Creating test configuration files..."
    
    # Jest configuration
    cat > "${PROJECT_ROOT}/jest.config.js" << 'EOF'
const path = require('path');

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: path.resolve(__dirname),
  
  // Test file patterns
  testMatch: [
    '<rootDir>/services/**/__tests__/**/*.test.{js,ts}',
    '<rootDir>/apps/**/__tests__/**/*.test.{js,ts}',
    '<rootDir>/packages/**/__tests__/**/*.test.{js,ts}',
    '<rootDir>/tests/**/*.test.{js,ts}'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js'
  ],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Coverage
  collectCoverageFrom: [
    'services/**/*.{js,ts}',
    'apps/**/*.{js,ts}',
    'packages/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**'
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Parallel execution
  maxWorkers: '50%',
  
  // Verbose output
  verbose: true
};
EOF
    
    # Playwright configuration for E2E tests
    cat > "${PROJECT_ROOT}/playwright.config.ts" << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report.json' }]
  ],
  
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure'
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Run your local dev server before starting the tests
  webServer: {
    command: 'pnpm dev:web',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
    
    # Artillery configuration for load testing
    cat > "${PROJECT_ROOT}/artillery.yml" << 'EOF'
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 1
      name: Warm up
    - duration: 120
      arrivalRate: 5
      rampTo: 50
      name: Ramp up load
    - duration: 600
      arrivalRate: 50
      name: Sustained load
  payload:
    path: './tests/fixtures/load-test-data.csv'
    fields:
      - 'email'
      - 'password'

scenarios:
  - name: 'Authentication Flow'
    weight: 70
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: '{{ email }}'
            password: '{{ password }}'
          capture:
            - json: '$.tokens.access'
              as: 'accessToken'
      - get:
          url: '/api/auth/me'
          headers:
            Authorization: 'Bearer {{ accessToken }}'

  - name: 'Project Operations'
    weight: 30
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
          capture:
            - json: '$.tokens.access'
              as: 'accessToken'
      - get:
          url: '/api/projects'
          headers:
            Authorization: 'Bearer {{ accessToken }}'
      - post:
          url: '/api/projects'
          headers:
            Authorization: 'Bearer {{ accessToken }}'
          json:
            name: 'Load Test Project'
            type: 'WEBSITE'
EOF
    
    # Create Jest setup file
    mkdir -p "${PROJECT_ROOT}/tests/setup"
    cat > "${PROJECT_ROOT}/tests/setup/jest.setup.js" << 'EOF'
// Global test setup
const { execSync } = require('child_process');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/zoptal_test';
process.env.REDIS_URL = 'redis://localhost:6380';
process.env.JWT_ACCESS_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DISABLE_RATE_LIMITING = 'true';
process.env.SKIP_AUTH_IN_TESTS = 'true';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  // Clear test database before running tests
  try {
    execSync('cd packages/database && pnpm prisma migrate reset --force --skip-seed', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
  } catch (error) {
    console.warn('Failed to reset test database:', error.message);
  }
});

// Setup after each test
afterEach(async () => {
  // Clear Redis cache
  const Redis = require('ioredis');
  const redis = new Redis(process.env.REDIS_URL);
  await redis.flushall();
  await redis.quit();
});

// Global teardown
afterAll(async () => {
  // Close any open connections
  await new Promise(resolve => setTimeout(resolve, 500));
});
EOF
    
    log_success "Test configuration files created"
}

# Reset test environment
reset_test_environment() {
    log_info "Resetting test environment..."
    
    # Stop services
    stop_test_services
    
    # Remove Docker volumes
    docker volume rm $(docker volume ls -q | grep test) 2>/dev/null || true
    
    # Clear test artifacts
    rm -rf "${PROJECT_ROOT}/coverage"
    rm -rf "${PROJECT_ROOT}/test-results"
    rm -rf "${PROJECT_ROOT}/playwright-report"
    rm -rf "${PROJECT_ROOT}/playwright-report.json"
    
    # Start services again
    start_test_services
    
    # Setup database
    setup_test_database
    
    log_success "Test environment reset completed"
}

# Run tests
run_tests() {
    local test_type="$1"
    shift
    local options=("$@")
    
    log_info "Running $test_type tests..."
    
    case "$test_type" in
        "unit")
            run_unit_tests "${options[@]}"
            ;;
        "integration")
            run_integration_tests "${options[@]}"
            ;;
        "e2e")
            run_e2e_tests "${options[@]}"
            ;;
        "load")
            run_load_tests "${options[@]}"
            ;;
        "security")
            run_security_tests "${options[@]}"
            ;;
        "all")
            run_all_tests "${options[@]}"
            ;;
        *)
            log_error "Unknown test type: $test_type"
            show_help
            exit 1
            ;;
    esac
}

# Run unit tests
run_unit_tests() {
    local options=("$@")
    
    cd "$PROJECT_ROOT"
    
    local jest_args=()
    
    # Parse options
    for option in "${options[@]}"; do
        case "$option" in
            "--coverage")
                jest_args+=("--coverage")
                ;;
            "--watch")
                jest_args+=("--watch")
                ;;
            "--debug")
                jest_args+=("--runInBand" "--verbose")
                ;;
            "--parallel")
                jest_args+=("--maxWorkers=50%")
                ;;
        esac
    done
    
    # Run unit tests
    pnpm test "${jest_args[@]}" --testPathPattern="unit"
}

# Run integration tests
run_integration_tests() {
    local options=("$@")
    
    # Ensure test services are running
    if ! docker ps | grep -q zoptal-postgres-test; then
        log_info "Starting test services for integration tests..."
        start_test_services
    fi
    
    cd "$PROJECT_ROOT"
    
    local jest_args=()
    
    # Parse options
    for option in "${options[@]}"; do
        case "$option" in
            "--coverage")
                jest_args+=("--coverage")
                ;;
            "--debug")
                jest_args+=("--runInBand" "--verbose")
                ;;
        esac
    done
    
    # Set integration test environment
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/zoptal_test_integration"
    
    # Run integration tests
    pnpm test "${jest_args[@]}" --testPathPattern="integration"
}

# Run E2E tests
run_e2e_tests() {
    local options=("$@")
    
    cd "$PROJECT_ROOT"
    
    local playwright_args=()
    
    # Parse options
    for option in "${options[@]}"; do
        case "$option" in
            "--debug")
                playwright_args+=("--debug")
                ;;
            "--headed")
                playwright_args+=("--headed")
                ;;
        esac
    done
    
    # Install Playwright browsers if needed
    if ! command -v playwright >/dev/null 2>&1; then
        log_info "Installing Playwright..."
        pnpm exec playwright install
    fi
    
    # Run E2E tests
    pnpm exec playwright test "${playwright_args[@]}"
}

# Run load tests
run_load_tests() {
    local options=("$@")
    
    cd "$PROJECT_ROOT"
    
    # Install Artillery if needed
    if ! command -v artillery >/dev/null 2>&1; then
        log_info "Installing Artillery..."
        npm install -g artillery
    fi
    
    # Create load test data
    cat > "${PROJECT_ROOT}/tests/fixtures/load-test-data.csv" << 'EOF'
email,password
test1@example.com,password123
test2@example.com,password123
test3@example.com,password123
test4@example.com,password123
test5@example.com,password123
EOF
    
    # Run load tests
    artillery run artillery.yml
}

# Run security tests
run_security_tests() {
    log_info "Running security tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run npm audit
    log_info "Checking for vulnerable dependencies..."
    pnpm audit --audit-level moderate
    
    # Run Snyk tests if available
    if command -v snyk >/dev/null 2>&1; then
        log_info "Running Snyk security tests..."
        snyk test
    fi
    
    # Run custom security tests
    if [[ -d "tests/security" ]]; then
        pnpm test --testPathPattern="security"
    fi
    
    log_success "Security tests completed"
}

# Run all tests
run_all_tests() {
    local options=("$@")
    
    log_info "Running all tests..."
    
    # Run tests in sequence
    run_unit_tests "${options[@]}"
    run_integration_tests "${options[@]}"
    run_security_tests
    
    # Run E2E tests only if not in watch mode
    if [[ ! " ${options[@]} " =~ " --watch " ]]; then
        run_e2e_tests "${options[@]}"
    fi
    
    log_success "All tests completed!"
}

# Seed test database
seed_test_database() {
    log_info "Seeding test database..."
    
    cd "${PROJECT_ROOT}/packages/database"
    
    # Set test environment
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/zoptal_test"
    
    # Create and run seed script
    cat > "seed-test.ts" << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test database...');
  
  // Create test users
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LXWaBZyA8F.ZXE8FS', // password123
      emailVerified: true,
      role: 'USER'
    }
  });
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LXWaBZyA8F.ZXE8FS', // password123
      emailVerified: true,
      role: 'ADMIN'
    }
  });
  
  // Create test projects
  await prisma.project.upsert({
    where: { id: 'test-project-1' },
    update: {},
    create: {
      id: 'test-project-1',
      name: 'Test Project 1',
      description: 'A sample project for testing',
      type: 'WEBSITE',
      status: 'ACTIVE',
      userId: testUser.id,
      settings: {
        theme: 'modern',
        analytics: true
      }
    }
  });
  
  console.log('Test database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
    
    # Run seed script
    pnpm tsx seed-test.ts
    
    # Clean up
    rm seed-test.ts
    
    log_success "Test database seeded"
}

# Clean test artifacts
clean_test_artifacts() {
    log_info "Cleaning test artifacts..."
    
    cd "$PROJECT_ROOT"
    
    # Remove test reports and coverage
    rm -rf coverage/
    rm -rf test-results/
    rm -rf playwright-report/
    rm -rf playwright-report.json
    rm -rf .nyc_output/
    
    # Remove test logs
    find . -name "*.test.log" -delete
    find . -name "jest-results.json" -delete
    
    log_success "Test artifacts cleaned"
}

# Show test environment status
show_test_status() {
    log_info "Test Environment Status:"
    echo ""
    
    # Check test services
    if docker ps | grep -q zoptal-postgres-test; then
        echo -e "  ${GREEN}●${NC} Test PostgreSQL - Running (port 5433)"
    else
        echo -e "  ${RED}●${NC} Test PostgreSQL - Stopped"
    fi
    
    if docker ps | grep -q zoptal-redis-test; then
        echo -e "  ${GREEN}●${NC} Test Redis - Running (port 6380)"
    else
        echo -e "  ${RED}●${NC} Test Redis - Stopped"
    fi
    
    if docker ps | grep -q zoptal-minio-test; then
        echo -e "  ${GREEN}●${NC} Test MinIO - Running (port 9010-9011)"
    else
        echo -e "  ${RED}●${NC} Test MinIO - Stopped"
    fi
    
    if docker ps | grep -q zoptal-mailhog-test; then
        echo -e "  ${GREEN}●${NC} Test MailHog - Running (port 8026)"
    else
        echo -e "  ${RED}●${NC} Test MailHog - Stopped"
    fi
    
    echo ""
    
    # Check test tools
    if command -v jest >/dev/null 2>&1; then
        echo -e "  ${GREEN}●${NC} Jest - Available"
    else
        echo -e "  ${RED}●${NC} Jest - Not installed"
    fi
    
    if command -v playwright >/dev/null 2>&1; then
        echo -e "  ${GREEN}●${NC} Playwright - Available"
    else
        echo -e "  ${RED}●${NC} Playwright - Not installed"
    fi
    
    if command -v artillery >/dev/null 2>&1; then
        echo -e "  ${GREEN}●${NC} Artillery - Available"
    else
        echo -e "  ${YELLOW}●${NC} Artillery - Not installed (optional)"
    fi
    
    echo ""
}

# Main execution
main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    shift
    
    case "$command" in
        "setup")
            setup_test_environment
            ;;
        "start")
            start_test_services
            ;;
        "stop")
            stop_test_services
            ;;
        "reset")
            reset_test_environment
            ;;
        "run")
            if [[ $# -lt 1 ]]; then
                log_error "Test type required"
                show_help
                exit 1
            fi
            run_tests "$@"
            ;;
        "seed")
            seed_test_database
            ;;
        "clean")
            clean_test_artifacts
            ;;
        "status")
            show_test_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_error "Operation interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"