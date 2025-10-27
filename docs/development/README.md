# Development Environment Guide

This guide covers the complete development environment setup for the Zoptal platform, including automated scripts, VS Code DevContainer support, and comprehensive testing utilities.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Scripts](#development-scripts)
3. [DevContainer Setup](#devcontainer-setup)
4. [Testing Environment](#testing-environment)
5. [Database Management](#database-management)
6. [Service Management](#service-management)
7. [Troubleshooting](#troubleshooting)

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd zoptal

# Run the automated setup script
./scripts/dev-setup/setup-dev-environment.sh

# Start the development environment
./dev-start.sh
```

### Option 2: VS Code DevContainer

```bash
# Open in VS Code
code .

# When prompted, click "Reopen in Container"
# Or use Command Palette: "Remote-Containers: Reopen in Container"

# The environment will be automatically set up
```

### Option 3: Manual Setup

```bash
# Install dependencies
pnpm install

# Start infrastructure services
docker-compose -f docker-compose.dev.yml up -d

# Setup database
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate

# Start services
pnpm dev:all
```

## Development Scripts

### Main Setup Script

The primary setup script automates the entire development environment:

```bash
./scripts/dev-setup/setup-dev-environment.sh [OPTIONS]

Options:
  --skip-deps        Skip dependency installation
  --skip-db          Skip database setup
  --with-monitoring  Include monitoring services
  -h, --help         Show help message
```

**What it does:**
- Checks prerequisites (Docker, Node.js, pnpm, Git)
- Creates development environment file (`.env.dev`)
- Sets up Docker Compose configuration
- Installs project dependencies
- Initializes databases with migrations
- Creates helper scripts (`dev-start.sh`, `dev-stop.sh`, `dev-reset.sh`)
- Configures VS Code settings and extensions

### Service Management Script

Manage individual services during development:

```bash
./scripts/dev-setup/service-dev.sh [COMMAND] [SERVICE] [OPTIONS]

Commands:
  start [service]     Start a specific service
  stop [service]      Stop a specific service
  restart [service]   Restart a specific service
  logs [service]      Show logs for a service
  test [service]      Run tests for a service
  build [service]     Build a service
  clean [service]     Clean build artifacts
  migrate            Run database migrations
  seed               Seed database with test data
  status             Show status of all services
  health [service]   Check health of a service
  debug [service]    Start service in debug mode

Examples:
  ./scripts/dev-setup/service-dev.sh start auth-service
  ./scripts/dev-setup/service-dev.sh logs web-main
  ./scripts/dev-setup/service-dev.sh status
```

### Testing Environment Script

Comprehensive testing environment management:

```bash
./scripts/dev-setup/test-environment.sh [COMMAND] [OPTIONS]

Commands:
  setup       Set up test environment
  start       Start test services
  stop        Stop test services
  reset       Reset test environment
  run [type]  Run specific tests
  seed        Seed test database
  clean       Clean test artifacts
  status      Show test environment status

Test Types:
  unit        Run unit tests
  integration Run integration tests
  e2e         Run end-to-end tests
  load        Run load tests
  security    Run security tests
  all         Run all tests

Options:
  --coverage  Generate coverage reports
  --watch     Run tests in watch mode
  --debug     Run tests in debug mode

Examples:
  ./scripts/dev-setup/test-environment.sh setup
  ./scripts/dev-setup/test-environment.sh run unit --coverage
  ./scripts/dev-setup/test-environment.sh run e2e --debug
```

### Database Seeding Script

Populate databases with realistic development data:

```bash
./scripts/dev-setup/seed-data.sh [COMMAND] [OPTIONS]

Commands:
  seed        Seed development database
  reset       Reset and re-seed database
  users       Seed only user data
  projects    Seed only project data
  billing     Seed only billing data
  analytics   Seed only analytics data
  clean       Remove all seeded data

Options:
  --env [dev|test]  Target environment
  --verbose         Show detailed output
  --force           Force seed even if data exists

Examples:
  ./scripts/dev-setup/seed-data.sh seed
  ./scripts/dev-setup/seed-data.sh users --force
  ./scripts/dev-setup/seed-data.sh reset --env test
```

## DevContainer Setup

The DevContainer configuration provides a complete, consistent development environment using Docker.

### Features

- **Base Environment**: Node.js 18 with TypeScript
- **Package Manager**: pnpm with persistent cache
- **Databases**: PostgreSQL and Redis
- **Development Tools**: MailHog, MinIO, Prometheus, Grafana
- **Cloud Tools**: AWS CLI, kubectl, Helm, Terraform
- **VS Code Extensions**: Pre-configured for optimal development

### Usage

1. **Prerequisites**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - [VS Code](https://code.visualstudio.com/)
   - [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Container**
   ```bash
   code .
   # Click "Reopen in Container" when prompted
   ```

3. **Available Services**
   All services are automatically port-forwarded:
   
   | Port | Service | URL |
   |------|---------|-----|
   | 3000 | Web Main | http://localhost:3000 |
   | 3001 | Dashboard | http://localhost:3001 |
   | 3002 | Admin | http://localhost:3002 |
   | 4000-4005 | Services | http://localhost:4000-4005 |
   | 8025 | MailHog | http://localhost:8025 |
   | 9001 | MinIO | http://localhost:9001 |
   | 9090 | Prometheus | http://localhost:9090 |
   | 3003 | Grafana | http://localhost:3003 |

### Configuration Files

- **`.devcontainer/devcontainer.json`**: Main configuration
- **`.devcontainer/docker-compose.yml`**: Service definitions
- **`.devcontainer/Dockerfile`**: Custom container image
- **`.devcontainer/README.md`**: Detailed setup guide

## Testing Environment

### Test Services

Isolated testing infrastructure includes:

- **PostgreSQL Test**: Port 5433 with separate test databases
- **Redis Test**: Port 6380 for test caching
- **MinIO Test**: Ports 9010-9011 for file upload testing
- **MailHog Test**: Port 8026 for email testing

### Test Configuration

- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing across browsers
- **Artillery**: Load testing
- **Coverage**: Comprehensive code coverage reporting

### Test Database Structure

Multiple isolated databases for different test types:
- `zoptal_test`: Main test database
- `zoptal_test_unit`: Unit test isolation
- `zoptal_test_integration`: Integration test isolation
- `zoptal_test_e2e`: End-to-end test isolation

## Database Management

### Development Database

The development database (`zoptal_dev`) includes:

- **PostgreSQL Extensions**: uuid-ossp, pg_trgm, btree_gin
- **Prisma Migrations**: Automated schema management
- **Seed Data**: Realistic development data

### Migration Commands

```bash
# Generate migration
cd packages/database
pnpm prisma migrate dev --name your-migration-name

# Deploy migrations
pnpm prisma migrate deploy

# Reset database
pnpm prisma migrate reset

# Generate Prisma client
pnpm prisma generate
```

### Seed Data

Comprehensive seed data includes:

- **Users**: Admin and regular users with realistic profiles
- **Projects**: Various project types (websites, landing pages, dashboards)
- **Billing**: Subscription plans, user subscriptions, invoice history
- **Analytics**: 30 days of realistic analytics data

## Service Management

### Available Services

**Backend Services:**
- `auth-service` (Port 4000): Authentication and user management
- `project-service` (Port 4001): Project creation and management
- `ai-service` (Port 4002): AI integrations (OpenAI, Anthropic, Google)
- `billing-service` (Port 4003): Subscription and payment management
- `notification-service` (Port 4004): Email, SMS, and push notifications
- `analytics-service` (Port 4005): User tracking and metrics

**Frontend Applications:**
- `web-main` (Port 3000): Main website
- `dashboard` (Port 3001): User dashboard
- `admin` (Port 3002): Admin interface

### Service Commands

```bash
# Start all services
pnpm dev:all

# Start specific service type
pnpm dev:services  # All backend services
pnpm dev:apps      # All frontend apps

# Start individual service
pnpm dev:auth      # Auth service only
pnpm dev:web       # Web app only

# Build all packages
pnpm build:packages

# Run all tests
pnpm test:all

# Clean everything
pnpm clean
```

### Environment Configuration

Development environment variables are stored in `.env.dev`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zoptal_dev
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=dev_access_secret
JWT_REFRESH_SECRET=dev_refresh_secret

# Services
AUTH_SERVICE_URL=http://localhost:4000
PROJECT_SERVICE_URL=http://localhost:4001
# ... other service URLs

# External APIs (add your keys)
OPENAI_API_KEY=your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
SENDGRID_API_KEY=your_key_here
```

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)

# Use different ports in .env.dev
```

#### Database Connection Issues
```bash
# Check database status
docker ps | grep postgres

# View database logs
docker logs zoptal-postgres-dev

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Reset database completely
./dev-reset.sh
```

#### Service Won't Start
```bash
# Check service logs
./scripts/dev-setup/service-dev.sh logs auth-service

# Check health
./scripts/dev-setup/service-dev.sh health auth-service

# Restart service
./scripts/dev-setup/service-dev.sh restart auth-service

# Clean and rebuild
./scripts/dev-setup/service-dev.sh clean auth-service
./scripts/dev-setup/service-dev.sh build auth-service
```

#### Docker Issues
```bash
# Restart Docker Desktop
# Or use CLI:

# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all volumes
docker volume prune

# Reset development environment
./dev-reset.sh
```

#### Memory Issues
```bash
# Increase Docker memory allocation (8GB+ recommended)
# Clean up Docker resources
docker system prune -a

# Limit concurrent processes
export JEST_MAX_WORKERS=2
pnpm test --maxWorkers=2
```

### Performance Optimization

#### Docker Performance
- Use Docker Desktop with WSL2 backend (Windows)
- Allocate sufficient memory (8GB+ recommended)
- Enable BuildKit for faster builds
- Use volume mounts for better I/O performance

#### Node.js Performance
- Use pnpm for faster package installation
- Enable persistent module cache
- Use `--maxWorkers=50%` for parallel operations
- Consider using `tsx` for faster TypeScript execution

#### Database Performance
- Use connection pooling in development
- Regularly analyze query performance
- Keep test databases separate from development
- Use database indexes for frequently queried fields

### Getting Help

1. **Check Logs**: Always start by checking service logs
2. **Verify Prerequisites**: Ensure Docker, Node.js, and pnpm are correctly installed
3. **Reset Environment**: Use `./dev-reset.sh` for a clean slate
4. **Check Documentation**: Review service-specific README files
5. **Ask Team**: Post in development chat with error logs

---

For additional help and advanced configurations, see:
- [DevContainer Documentation](.devcontainer/README.md)
- [Testing Guide](../testing/README.md)
- [Deployment Guide](../deployment/README.md)
- [API Documentation](../api/README.md)