#!/bin/bash
# setup-dev-environment.sh - One-click development environment setup for Zoptal

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
DEV_ENV_FILE="${PROJECT_ROOT}/.env.dev"
DOCKER_COMPOSE_DEV="${PROJECT_ROOT}/docker-compose.dev.yml"

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

# Banner
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "    Zoptal Development Environment Setup"
    echo "=================================================="
    echo -e "${NC}"
    echo "This script will set up your complete development environment."
    echo "Please ensure you have the following prerequisites:"
    echo "  - Docker and Docker Compose"
    echo "  - Node.js 18+ and pnpm"
    echo "  - Git"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -lt "18" ]; then
            log_error "Node.js version 18+ required. Current version: $NODE_VERSION"
            missing_deps+=("node (>=18)")
        fi
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm not found. Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing prerequisites: ${missing_deps[*]}"
        echo ""
        echo "Please install the missing dependencies and run this script again."
        echo ""
        echo "Installation guides:"
        echo "  Docker: https://docs.docker.com/get-docker/"
        echo "  Node.js: https://nodejs.org/"
        echo "  Git: https://git-scm.com/downloads"
        exit 1
    fi
    
    log_success "All prerequisites found!"
}

# Setup development environment file
setup_env_file() {
    log_info "Setting up development environment file..."
    
    if [ -f "$DEV_ENV_FILE" ]; then
        log_warning "Development .env file already exists. Backing up..."
        cp "$DEV_ENV_FILE" "${DEV_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    cat > "$DEV_ENV_FILE" << 'EOF'
# Zoptal Development Environment Configuration
# This file contains development-specific environment variables

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zoptal_dev
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_ACCESS_SECRET=dev_access_secret_key_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_change_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Configuration
API_PORT=4000
AUTH_SERVICE_URL=http://localhost:4000
PROJECT_SERVICE_URL=http://localhost:4001
AI_SERVICE_URL=http://localhost:4002
BILLING_SERVICE_URL=http://localhost:4003
NOTIFICATION_SERVICE_URL=http://localhost:4004
ANALYTICS_SERVICE_URL=http://localhost:4005

# Frontend Configuration
WEB_MAIN_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002

# External Service Configuration (Development)
# Note: Use test/sandbox credentials for development
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

SENDGRID_API_KEY=your_sendgrid_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# OAuth Configuration (Development)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Development Tools
LOG_LEVEL=debug
ENABLE_CORS=true
ENABLE_SWAGGER=true
DISABLE_RATE_LIMITING=true

# Testing Configuration
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zoptal_test
SKIP_AUTH_IN_TESTS=true

# Feature Flags (Development)
ENABLE_NEW_FEATURES=true
DEBUG_MODE=true
EOF
    
    log_success "Development environment file created at $DEV_ENV_FILE"
    log_warning "Please update the API keys and secrets in $DEV_ENV_FILE"
}

# Create Docker Compose development configuration
setup_docker_compose() {
    log_info "Creating Docker Compose development configuration..."
    
    cat > "$DOCKER_COMPOSE_DEV" << 'EOF'
version: '3.8'

services:
  # Database Services
  postgres:
    image: postgres:15-alpine
    container_name: zoptal-postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_DB: zoptal_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/dev-setup/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: zoptal-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Development Tools
  mailhog:
    image: mailhog/mailhog:latest
    container_name: zoptal-mailhog-dev
    restart: unless-stopped
    ports:
      - "1025:1025"  # SMTP server
      - "8025:8025"  # Web UI
    
  minio:
    image: quay.io/minio/minio:latest
    container_name: zoptal-minio-dev
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # Monitoring (Optional for development)
  prometheus:
    image: prom/prometheus:latest
    container_name: zoptal-prometheus-dev
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./scripts/dev-setup/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    profiles:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: zoptal-grafana-dev
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    ports:
      - "3003:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    profiles:
      - monitoring

  # Test Database
  postgres-test:
    image: postgres:15-alpine
    container_name: zoptal-postgres-test
    restart: unless-stopped
    environment:
      POSTGRES_DB: zoptal_test
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    profiles:
      - testing

volumes:
  postgres_data:
  postgres_test_data:
  redis_data:
  minio_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: zoptal-dev-network
EOF
    
    log_success "Docker Compose development configuration created"
}

# Create database initialization script
create_db_init_script() {
    log_info "Creating database initialization script..."
    
    mkdir -p "${SCRIPT_DIR}"
    
    cat > "${SCRIPT_DIR}/init-db.sql" << 'EOF'
-- Initialize Zoptal development database

-- Create test database
CREATE DATABASE zoptal_test;

-- Create extensions
\c zoptal_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

\c zoptal_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Switch back to main dev database
\c zoptal_dev;

-- Create initial tables will be handled by Prisma migrations
-- This script just sets up the basic database structure
EOF
    
    log_success "Database initialization script created"
}

# Create Prometheus configuration for development
create_prometheus_config() {
    log_info "Creating Prometheus configuration for development..."
    
    cat > "${SCRIPT_DIR}/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'auth-service'
    static_configs:
      - targets: ['host.docker.internal:4000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'project-service'
    static_configs:
      - targets: ['host.docker.internal:4001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'ai-service'
    static_configs:
      - targets: ['host.docker.internal:4002']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'billing-service'
    static_configs:
      - targets: ['host.docker.internal:4003']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'notification-service'
    static_configs:
      - targets: ['host.docker.internal:4004']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'analytics-service'
    static_configs:
      - targets: ['host.docker.internal:4005']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF
    
    log_success "Prometheus configuration created"
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Install root dependencies
    log_info "Installing root dependencies..."
    pnpm install
    
    # Build shared packages
    log_info "Building shared packages..."
    pnpm build:packages
    
    log_success "Dependencies installed and packages built"
}

# Setup databases
setup_databases() {
    log_info "Setting up databases..."
    
    # Start database services
    log_info "Starting database services..."
    cd "$PROJECT_ROOT"
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    
    # Wait for databases to be ready
    log_info "Waiting for databases to be ready..."
    sleep 10
    
    # Check PostgreSQL connection
    local retries=30
    while ! docker exec zoptal-postgres-dev pg_isready -U postgres &>/dev/null; do
        retries=$((retries - 1))
        if [ $retries -eq 0 ]; then
            log_error "PostgreSQL failed to start"
            exit 1
        fi
        log_info "Waiting for PostgreSQL... ($retries retries left)"
        sleep 2
    done
    
    # Check Redis connection
    retries=30
    while ! docker exec zoptal-redis-dev redis-cli ping &>/dev/null; do
        retries=$((retries - 1))
        if [ $retries -eq 0 ]; then
            log_error "Redis failed to start"
            exit 1
        fi
        log_info "Waiting for Redis... ($retries retries left)"
        sleep 2
    done
    
    log_success "Databases are ready!"
    
    # Run Prisma migrations
    log_info "Running database migrations..."
    cd "${PROJECT_ROOT}/packages/database"
    pnpm prisma migrate dev --name init
    pnpm prisma generate
    
    # Seed database (if seed script exists)
    if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
        log_info "Seeding database with initial data..."
        pnpm prisma db seed
    fi
    
    log_success "Database setup completed"
}

# Create development scripts
create_dev_scripts() {
    log_info "Creating development helper scripts..."
    
    # Create start script
    cat > "${PROJECT_ROOT}/dev-start.sh" << 'EOF'
#!/bin/bash
# Start all development services

echo "🚀 Starting Zoptal development environment..."

# Start infrastructure services
echo "📦 Starting infrastructure services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait a moment for services to start
sleep 5

# Start all application services in parallel
echo "🔧 Starting application services..."
pnpm run dev:all

echo "✅ Development environment started!"
echo ""
echo "🌐 Available services:"
echo "  Web Main:          http://localhost:3000"
echo "  Dashboard:         http://localhost:3001"
echo "  Admin:             http://localhost:3002"
echo "  Auth Service:      http://localhost:4000"
echo "  Project Service:   http://localhost:4001"
echo "  AI Service:        http://localhost:4002"
echo "  Billing Service:   http://localhost:4003"
echo "  Notification Svc:  http://localhost:4004"
echo "  Analytics Service: http://localhost:4005"
echo ""
echo "🛠️  Development tools:"
echo "  MailHog:           http://localhost:8025"
echo "  MinIO:             http://localhost:9001"
echo "  Prometheus:        http://localhost:9090"
echo "  Grafana:           http://localhost:3003"
EOF
    
    chmod +x "${PROJECT_ROOT}/dev-start.sh"
    
    # Create stop script
    cat > "${PROJECT_ROOT}/dev-stop.sh" << 'EOF'
#!/bin/bash
# Stop all development services

echo "🛑 Stopping Zoptal development environment..."

# Stop Docker services
docker-compose -f docker-compose.dev.yml down

# Kill any remaining Node.js processes (be careful with this)
# pkill -f "node.*zoptal" || true

echo "✅ Development environment stopped!"
EOF
    
    chmod +x "${PROJECT_ROOT}/dev-stop.sh"
    
    # Create reset script
    cat > "${PROJECT_ROOT}/dev-reset.sh" << 'EOF'
#!/bin/bash
# Reset development environment (removes all data)

echo "🔄 Resetting Zoptal development environment..."
echo "⚠️  This will remove all development data!"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop services
    docker-compose -f docker-compose.dev.yml down -v
    
    # Remove Docker volumes
    docker volume rm $(docker volume ls -q | grep zoptal) 2>/dev/null || true
    
    # Reset database
    cd packages/database
    pnpm prisma migrate reset --force
    pnpm prisma db seed
    
    echo "✅ Development environment reset complete!"
else
    echo "❌ Reset cancelled"
fi
EOF
    
    chmod +x "${PROJECT_ROOT}/dev-reset.sh"
    
    log_success "Development scripts created"
}

# Update package.json scripts
update_package_scripts() {
    log_info "Updating package.json development scripts..."
    
    cd "$PROJECT_ROOT"
    
    # Add development scripts to package.json
    # This would typically be done manually or with a tool like jq
    log_info "Please add the following scripts to your root package.json:"
    echo ""
    echo "  \"scripts\": {"
    echo "    \"dev:all\": \"concurrently \\\"pnpm dev:services\\\" \\\"pnpm dev:apps\\\"\","
    echo "    \"dev:services\": \"concurrently \\\"pnpm dev:auth\\\" \\\"pnpm dev:project\\\" \\\"pnpm dev:ai\\\" \\\"pnpm dev:billing\\\" \\\"pnpm dev:notification\\\" \\\"pnpm dev:analytics\\\"\","
    echo "    \"dev:apps\": \"concurrently \\\"pnpm dev:web\\\" \\\"pnpm dev:admin\\\"\","
    echo "    \"dev:auth\": \"pnpm --filter auth-service dev\","
    echo "    \"dev:project\": \"pnpm --filter project-service dev\","
    echo "    \"dev:ai\": \"pnpm --filter ai-service dev\","
    echo "    \"dev:billing\": \"pnpm --filter billing-service dev\","
    echo "    \"dev:notification\": \"pnpm --filter notification-service dev\","
    echo "    \"dev:analytics\": \"pnpm --filter analytics-service dev\","
    echo "    \"dev:web\": \"pnpm --filter web-main dev\","
    echo "    \"dev:admin\": \"pnpm --filter admin dev\","
    echo "    \"test:all\": \"pnpm -r test\","
    echo "    \"build:packages\": \"pnpm --filter './packages/*' build\","
    echo "    \"clean\": \"pnpm -r clean && rm -rf node_modules\""
    echo "  }"
    echo ""
    
    # Install concurrently if not present
    if ! pnpm list concurrently &>/dev/null; then
        log_info "Installing concurrently for parallel script execution..."
        pnpm add -D concurrently
    fi
    
    log_success "Package scripts information provided"
}

# Create VS Code configuration
setup_vscode() {
    log_info "Setting up VS Code configuration..."
    
    mkdir -p "${PROJECT_ROOT}/.vscode"
    
    # VS Code settings
    cat > "${PROJECT_ROOT}/.vscode/settings.json" << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/coverage": true
  },
  "eslint.workingDirectories": [
    "services/auth-service",
    "services/project-service",
    "services/ai-service",
    "services/billing-service",
    "services/notification-service",
    "services/analytics-service",
    "apps/web-main",
    "apps/admin",
    "packages/ui",
    "packages/database",
    "packages/auth"
  ]
}
EOF
    
    # VS Code extensions
    cat > "${PROJECT_ROOT}/.vscode/extensions.json" << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers",
    "ms-vscode.vscode-docker",
    "github.vscode-pull-request-github",
    "ms-vscode.vscode-test-runner"
  ]
}
EOF
    
    # VS Code launch configuration
    cat > "${PROJECT_ROOT}/.vscode/launch.json" << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/services/auth-service/src/index.ts",
      "outFiles": ["${workspaceFolder}/services/auth-service/dist/**/*.js"],
      "envFile": "${workspaceFolder}/.env.dev",
      "runtimeArgs": ["-r", "ts-node/register"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Project Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/services/project-service/src/index.ts",
      "outFiles": ["${workspaceFolder}/services/project-service/dist/**/*.js"],
      "envFile": "${workspaceFolder}/.env.dev",
      "runtimeArgs": ["-r", "ts-node/register"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Run Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--detectOpenHandles"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
EOF
    
    # VS Code tasks
    cat > "${PROJECT_ROOT}/.vscode/tasks.json" << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Environment",
      "type": "shell",
      "command": "./dev-start.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Stop Dev Environment",
      "type": "shell",
      "command": "./dev-stop.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Build All Packages",
      "type": "shell",
      "command": "pnpm",
      "args": ["build:packages"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "Run All Tests",
      "type": "shell",
      "command": "pnpm",
      "args": ["test:all"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    }
  ]
}
EOF
    
    log_success "VS Code configuration created"
}

# Health check function
run_health_checks() {
    log_info "Running development environment health checks..."
    
    local services=("postgres:5432" "redis:6379")
    local urls=()
    
    # Check if services will be running
    if pnpm list --filter auth-service &>/dev/null; then
        urls+=("http://localhost:4000/health")
    fi
    if pnpm list --filter project-service &>/dev/null; then
        urls+=("http://localhost:4001/health")
    fi
    
    # Check database connections
    for service in "${services[@]}"; do
        local host=$(echo $service | cut -d':' -f1)
        local port=$(echo $service | cut -d':' -f2)
        
        if nc -z localhost $port 2>/dev/null; then
            log_success "$host is running on port $port"
        else
            log_warning "$host is not running on port $port"
        fi
    done
    
    # Note: We can't check HTTP services yet as they're not running
    log_info "HTTP service health checks will be available after starting the services"
    
    log_success "Health checks completed"
}

# Print completion message
print_completion_message() {
    echo ""
    echo -e "${GREEN}=================================================="
    echo "    🎉 Development Environment Setup Complete!"
    echo -e "==================================================${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Update API keys in .env.dev:"
    echo "   - Add your OpenAI, Stripe, SendGrid, and other service keys"
    echo ""
    echo "2. Start the development environment:"
    echo "   ./dev-start.sh"
    echo ""
    echo "3. Access your services:"
    echo "   - Web App:       http://localhost:3000"
    echo "   - Dashboard:     http://localhost:3001"
    echo "   - Admin:         http://localhost:3002"
    echo "   - Auth API:      http://localhost:4000"
    echo "   - MailHog:       http://localhost:8025"
    echo ""
    echo "4. Available commands:"
    echo "   ./dev-start.sh   - Start all services"
    echo "   ./dev-stop.sh    - Stop all services"
    echo "   ./dev-reset.sh   - Reset environment (removes data)"
    echo ""
    echo "5. VS Code:"
    echo "   - Open this folder in VS Code"
    echo "   - Install recommended extensions"
    echo "   - Use Ctrl+Shift+P -> 'Tasks: Run Task' for quick actions"
    echo ""
    echo -e "${BLUE}Happy coding! 🚀${NC}"
    echo ""
}

# Main execution
main() {
    print_banner
    
    # Parse command line arguments
    local skip_deps=false
    local skip_db=false
    local monitoring=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                skip_deps=true
                shift
                ;;
            --skip-db)
                skip_db=true
                shift
                ;;
            --with-monitoring)
                monitoring=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-deps        Skip dependency installation"
                echo "  --skip-db          Skip database setup"
                echo "  --with-monitoring  Include monitoring services"
                echo "  -h, --help         Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run setup steps
    check_prerequisites
    setup_env_file
    setup_docker_compose
    create_db_init_script
    create_prometheus_config
    
    if [ "$skip_deps" = false ]; then
        install_dependencies
    else
        log_warning "Skipping dependency installation"
    fi
    
    if [ "$skip_db" = false ]; then
        setup_databases
    else
        log_warning "Skipping database setup"
    fi
    
    create_dev_scripts
    update_package_scripts
    setup_vscode
    run_health_checks
    print_completion_message
    
    log_success "Development environment setup completed successfully!"
}

# Handle script interruption
trap 'log_error "Setup interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"