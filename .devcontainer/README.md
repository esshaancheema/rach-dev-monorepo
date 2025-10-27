# Development Container Configuration

This directory contains the configuration for VS Code Dev Containers, providing a complete, consistent development environment for the Zoptal platform.

## What's Included

### Base Environment
- **Node.js 18** with TypeScript support
- **pnpm** package manager
- **Docker-in-Docker** for container operations
- **PostgreSQL and Redis** databases
- **Development tools** (MailHog, MinIO, Prometheus, Grafana)

### Development Tools
- **AWS CLI** for cloud operations
- **kubectl** and **Helm** for Kubernetes management
- **Terraform** for infrastructure as code
- **GitHub CLI** for repository operations
- **VS Code extensions** for enhanced development experience

### Pre-configured Services
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Caching and sessions
- **MailHog** (port 8025) - Email testing
- **MinIO** (port 9001) - S3-compatible storage
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3003) - Monitoring dashboards

## Quick Start

1. **Install Prerequisites**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - [VS Code](https://code.visualstudio.com/)
   - [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in Container**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd zoptal
   
   # Open in VS Code
   code .
   
   # VS Code will prompt to reopen in container
   # OR use Command Palette: "Remote-Containers: Reopen in Container"
   ```

3. **Wait for Setup**
   - Initial setup takes 5-10 minutes
   - Dependencies are automatically installed
   - Development environment is configured

4. **Start Development**
   ```bash
   # All dependencies are already installed
   # Start the development environment
   ./dev-start.sh
   ```

## Container Features

### Persistent Storage
- **Node modules**: Cached in Docker volume for faster rebuilds
- **pnpm store**: Shared package cache across container rebuilds
- **Database data**: PostgreSQL and Redis data persists across restarts

### Port Forwarding
All development ports are automatically forwarded:

| Port | Service | Description |
|------|---------|-------------|
| 3000 | Web Main | Main website |
| 3001 | Dashboard | User dashboard |
| 3002 | Admin | Admin interface |
| 4000-4005 | Services | Microservices |
| 5432 | PostgreSQL | Database |
| 6379 | Redis | Cache |
| 8025 | MailHog | Email testing |
| 9000/9001 | MinIO | Object storage |
| 9090 | Prometheus | Metrics |
| 3003 | Grafana | Monitoring |

### VS Code Extensions
Pre-installed extensions include:
- **Prettier** and **ESLint** for code formatting
- **TypeScript** and **Prisma** support
- **Docker** and **Kubernetes** tools
- **AWS** and **Terraform** extensions
- **GitHub Copilot** (if available)

## Container Commands

### Available Scripts
```bash
# Start all services
./dev-start.sh

# Stop all services  
./dev-stop.sh

# Reset environment (removes data)
./dev-reset.sh

# Run tests
pnpm test:all

# Build packages
pnpm build:packages
```

### Shell Aliases
Pre-configured aliases for faster development:
```bash
ll      # ls -la
k       # kubectl
tf      # terraform  
dc      # docker-compose
pn      # pnpm
```

### Database Access
```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/zoptal_dev

# Connect to Redis
redis-cli -h localhost -p 6379

# Run database migrations
cd packages/database
pnpm prisma migrate dev
```

## Customization

### Environment Variables
Create `.env.dev` in the workspace root with your API keys:
```bash
# API Keys (required for full functionality)
OPENAI_API_KEY=your_key_here
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=your_key_here
```

### Additional Extensions
Add to `.devcontainer/devcontainer.json`:
```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "your.extension.id"
      ]
    }
  }
}
```

### Container Modifications
Edit `.devcontainer/Dockerfile` to add tools:
```dockerfile
RUN apt-get update && apt-get install -y \
    your-package-here \
    && rm -rf /var/lib/apt/lists/*
```

## Troubleshooting

### Container Won't Start
1. Check Docker Desktop is running
2. Verify sufficient disk space (>10GB recommended)
3. Try rebuilding: "Remote-Containers: Rebuild Container"

### Port Conflicts
If ports are already in use:
1. Stop conflicting services on host
2. Or modify ports in `devcontainer.json`

### Slow Performance
1. Increase Docker memory allocation (8GB+ recommended)
2. Enable Docker BuildKit
3. Use WSL2 backend on Windows

### Database Connection Issues
```bash
# Check database status
docker-compose -f .devcontainer/docker-compose.yml ps

# View database logs
docker-compose -f .devcontainer/docker-compose.yml logs postgres

# Restart databases
docker-compose -f .devcontainer/docker-compose.yml restart postgres redis
```

### Permission Issues
```bash
# Fix ownership (run in container terminal)
sudo chown -R node:node /workspace
```

## Alternative Setup Methods

### Using Docker Compose Only
```bash
# Start services without VS Code
docker-compose -f .devcontainer/docker-compose.yml up -d

# Install dependencies locally
pnpm install
./scripts/dev-setup/setup-dev-environment.sh
```

### Local Development
```bash
# Install dependencies locally
pnpm install

# Start databases with Docker
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run setup script
./scripts/dev-setup/setup-dev-environment.sh --skip-deps
```

## Best Practices

### Resource Management
- Close unused terminals and processes
- Stop services when not needed: `./dev-stop.sh`
- Regularly prune Docker: `docker system prune`

### Development Workflow
1. Create feature branch
2. Make changes in container
3. Test with `pnpm test:all`
4. Commit and push
5. Create pull request

### Data Management
- Use `./dev-reset.sh` to start fresh
- Back up important data before resets
- Use database seeds for consistent test data

## Support

For issues with the development container:
1. Check [troubleshooting section](#troubleshooting)
2. Review container logs
3. Ask in team chat or create issue

---

Happy coding! 🚀