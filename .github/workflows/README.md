# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Zoptal project. These workflows provide comprehensive automation for testing, building, deploying, and maintaining the codebase.

## Workflows Overview

### 1. CI Workflow (`ci.yml`)
**Triggers**: Push to main/develop, Pull requests
**Purpose**: Continuous integration checks

**Jobs**:
- **Lint**: Code style and quality checks
- **Type Check**: TypeScript type validation
- **Test**: Unit and integration tests across Node.js versions (18, 20, 22)
- **Build**: Build all applications and services
- **Security Scan**: Dependency and vulnerability scanning
- **Docker Build**: Test Docker image builds

**Key Features**:
- Matrix strategy for multiple Node.js versions
- Parallel job execution for speed
- Artifact uploads for build outputs
- Comprehensive test coverage reporting

### 2. Deploy Services (`deploy-services.yml`)
**Triggers**: Push to main (services changed), Manual dispatch
**Purpose**: Deploy microservices to AWS EKS

**Jobs**:
- **Detect Changes**: Intelligently detect which services need deployment
- **Build and Push**: Build Docker images and push to ECR
- **Deploy**: Deploy to Kubernetes using Helm
- **Rollback**: Automatic rollback on deployment failure

**Key Features**:
- Smart change detection
- Blue-green deployments
- Health checks and smoke tests
- Automatic rollback on failure
- Multi-environment support (staging/production)

### 3. Deploy Apps (`deploy-apps.yml`)
**Triggers**: Push to main (apps changed), Pull requests
**Purpose**: Deploy Next.js applications to Vercel

**Jobs**:
- **Preview Deployments**: Create preview deployments for PRs
- **Production Deployments**: Deploy to production on main branch
- **Lighthouse Checks**: Performance and quality audits

**Key Features**:
- Preview deployments for all PRs
- Automatic production deployments
- Performance monitoring with Lighthouse
- CDN cache purging
- E2E testing on deployments

### 4. Release (`release.yml`)
**Triggers**: Push to main, Manual dispatch
**Purpose**: Automated releases and changelog generation

**Jobs**:
- **Version Check**: Detect version changes using Changesets
- **Create Release**: Generate GitHub releases with changelogs
- **Publish Packages**: Publish to npm and GitHub Packages
- **Docker Release**: Build and push versioned Docker images
- **Update Documentation**: Automated documentation updates

**Key Features**:
- Semantic versioning with Changesets
- Automated changelog generation
- Multi-registry package publishing
- Docker image versioning
- Documentation synchronization

### 5. Security (`security.yml`)
**Triggers**: Push, Pull requests, Weekly schedule, Manual dispatch
**Purpose**: Comprehensive security scanning

**Jobs**:
- **Dependency Scan**: npm audit, Snyk scanning
- **CodeQL Analysis**: Static code analysis
- **Secret Scanning**: TruffleHog, GitLeaks
- **Container Scan**: Trivy, Grype vulnerability scanning
- **SAST Scan**: Semgrep, ESLint security rules
- **License Check**: License compliance verification

**Key Features**:
- Multiple security tools integration
- Automated vulnerability reporting
- License compliance checking
- Container security scanning
- Weekly scheduled scans

### 6. Issue Management (`issue-management.yml`)
**Triggers**: Issue events, Weekly schedule
**Purpose**: Automated issue triage and management

**Jobs**:
- **Auto-triage**: Automatic labeling based on content
- **Assign Reviewers**: Component-based reviewer assignment
- **Stale Issues**: Mark and close inactive issues
- **Issue Metrics**: Track and report issue statistics

**Key Features**:
- Intelligent issue labeling
- Automatic reviewer assignment
- Stale issue management
- Metrics tracking

## Required Secrets

### AWS Configuration
```
AWS_ACCOUNT_ID - Your AWS account ID
AWS_DEPLOY_ROLE_ARN - IAM role for deployments
```

### Vercel Configuration
```
VERCEL_TOKEN - Vercel API token
VERCEL_ORG_ID - Vercel organization ID
VERCEL_PROJECT_ID_WEB - Project ID for web-main
VERCEL_PROJECT_ID_DASHBOARD - Project ID for dashboard
VERCEL_PROJECT_ID_ADMIN - Project ID for admin
VERCEL_PROJECT_ID_DEVELOPER - Project ID for developer-portal
```

### Security Tools
```
SNYK_TOKEN - Snyk API token
CODECOV_TOKEN - Codecov upload token
GITLEAKS_LICENSE - GitLeaks license key (if using pro)
```

### Publishing
```
NPM_TOKEN - npm registry token
DOCKER_USERNAME - Docker Hub username
DOCKER_PASSWORD - Docker Hub password
```

### Notifications
```
SLACK_WEBHOOK - Slack webhook URL for notifications
SLACK_SECURITY_WEBHOOK - Slack webhook for security alerts
```

### CDN and External Services
```
CLOUDFLARE_ZONE_ID - Cloudflare zone ID
CLOUDFLARE_API_TOKEN - Cloudflare API token
PRODUCTION_API_URL - Production API URL
PRODUCTION_APP_URL - Production app URL
```

## Environment Variables

### Turbo Configuration
```
TURBO_TOKEN - Vercel Turbo token for remote caching
TURBO_TEAM - Turbo team identifier
```

## Workflow Dependencies

### Prerequisites
1. **Node.js**: All workflows use Node.js 20 as the primary version
2. **npm**: Package manager for dependency installation
3. **Docker**: Required for container builds and deployments
4. **Kubernetes**: EKS cluster must be configured for service deployments
5. **Helm**: Used for Kubernetes deployments

### Package Scripts Required
Ensure your `package.json` includes these scripts:
```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage",
    "test:e2e": "playwright test",
    "test:e2e:production": "playwright test --config=playwright.prod.config.js",
    "build": "turbo run build",
    "build:packages": "turbo run build --filter='./packages/*'",
    "version": "changeset version",
    "release": "changeset publish",
    "docs:generate": "typedoc"
  }
}
```

## Directory Structure Requirements

The workflows assume this project structure:
```
├── .github/
│   └── workflows/
├── apps/
│   ├── web-main/
│   ├── dashboard/
│   ├── admin/
│   └── developer-portal/
├── services/
│   ├── auth-service/
│   ├── project-service/
│   ├── ai-service/
│   ├── notification-service/
│   ├── analytics-service/
│   └── payment-service/
├── packages/
├── k8s/
│   └── helm/
│       └── services/
└── docs/
```

## Customization

### Modifying Service Lists
To add or remove services, update the matrix strategy in:
- `ci.yml` (build job)
- `deploy-services.yml` (build-and-push, deploy jobs)
- `release.yml` (docker-release job)
- `security.yml` (container-scan job)

### Adding New Apps
To add new applications, update:
- `ci.yml` (build job matrix)
- `deploy-apps.yml` (detect-changes logic and environment variables)

### Changing Deployment Targets
- **Services**: Modify EKS cluster configuration in `deploy-services.yml`
- **Apps**: Update Vercel configuration or switch to AWS/other providers

### Security Tool Configuration
Each security tool can be configured with additional parameters:
- **Snyk**: Modify severity thresholds
- **Trivy**: Adjust vulnerability levels
- **CodeQL**: Add custom queries
- **Semgrep**: Configure rulesets

## Monitoring and Alerts

### Slack Notifications
Workflows send notifications to Slack for:
- Deployment successes/failures
- Security vulnerabilities
- Release completions

### GitHub Integration
- Pull request comments for previews and security scans
- GitHub Releases for version management
- Issue auto-labeling and assignment

### Metrics Collection
- Test coverage reports via Codecov
- Performance metrics via Lighthouse
- Security scan results via SARIF uploads

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify package.json scripts exist
   - Review dependency installation logs

2. **Deployment Failures**
   - Verify AWS credentials and permissions
   - Check Kubernetes cluster connectivity
   - Review Helm chart configurations

3. **Security Scan Failures**
   - Update vulnerable dependencies
   - Review and fix security issues
   - Check token permissions

4. **Release Failures**
   - Verify Changesets configuration
   - Check npm/GitHub token permissions
   - Review package.json version consistency

### Debug Mode
Enable debug logging by adding this to workflow files:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

## Contributing

When modifying workflows:

1. Test changes in a fork first
2. Use workflow_dispatch for manual testing
3. Review security implications
4. Update documentation
5. Follow the existing patterns and conventions

## Support

For issues with these workflows:
1. Check the GitHub Actions logs
2. Review the troubleshooting section
3. Create an issue with the `devops` label
4. Tag the DevOps team for urgent issues