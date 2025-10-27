# Zoptal Monorepo - CI/CD & DevOps Architecture Brief

## Executive Summary
**Project:** Zoptal - AI-Accelerated Development Platform  
**Architecture:** Microservices-based Monorepo  
**Date:** August 2025  
**Purpose:** Comprehensive technical brief for CI/CD implementation guidance

---

## 1. Technology Stack Overview

### Frontend Applications
- **Framework:** Next.js 14.2.3 (React 18.3.0)
- **Language:** TypeScript 5.4.0
- **Styling:** TailwindCSS 3.4.0
- **State Management:** Zustand 4.5.0, TanStack Query 5.83.0
- **UI Components:** Custom @zoptal/ui package + Framer Motion 11.0.0
- **Monitoring:** Vercel Analytics, Sentry, Web Vitals

### Backend Services (Microservices Architecture)
- **Runtime:** Node.js 18+ (with support for v20, v22)
- **Framework:** Fastify 4.25.0 (high-performance)
- **Language:** TypeScript 5.4.0
- **API Gateway:** GraphQL Gateway with Apollo
- **Authentication:** JWT-based with OAuth2.0, SAML, OIDC support

### Databases & Storage
- **Primary Database:** PostgreSQL 15 (Alpine)
- **Cache Layer:** Redis 7 (Alpine)
- **Analytics Database:** ClickHouse 23 (Alpine)
- **ORM:** Prisma 6.13.0
- **Object Storage:** AWS S3
- **CDN:** CloudFlare + AWS CloudFront

### Message Queue & Event Streaming
- **Queue Management:** Redis-based with Bull/BullMQ
- **Event Store:** Custom event-store service
- **Real-time:** WebSocket support in services

---

## 2. Complete Services & Applications Inventory

### Frontend Applications (`/apps`)
1. **web-main** - Public website (Port 3000)
2. **dashboard** - User dashboard (Port 3001)
3. **admin** - Admin panel
4. **developer-portal** - Developer documentation portal

### Backend Services (`/services`)
1. **auth-service** (Port 4001) - Authentication, SSO, MFA
2. **project-service** (Port 4002) - Project management
3. **ai-service** (Port 4003) - AI integrations (OpenAI, Anthropic, Google AI)
4. **billing-service** (Port 4004) - Stripe integration, subscriptions
5. **notification-service** (Port 4005) - Email (SendGrid), SMS (Twilio), Push
6. **analytics-service** (Port 4006) - ClickHouse integration
7. **graphql-gateway** - API gateway and federation
8. **ab-testing-service** - Feature flags and A/B testing
9. **marketplace-service** - App marketplace functionality
10. **i18n-service** - Internationalization
11. **event-store** - Event sourcing
12. **feature-flag-service** - Feature management
13. **gdpr-service** - GDPR compliance
14. **ml-pipeline** - Machine learning pipeline
15. **traffic-controller** - Load balancing and rate limiting
16. **canary-controller** - Canary deployment management

### Shared Packages (`/packages`)
- **@zoptal/ui** - Shared UI components
- **@zoptal/database** - Database schemas and Prisma client
- **@zoptal/config** - Shared configuration
- **@zoptal/auth** - Authentication utilities
- **@zoptal/api-client** - API client library
- **@zoptal/error-tracking** - Error handling
- **@zoptal/feature-flags** - Feature flag client
- **@zoptal/service-mesh** - Service mesh utilities
- **@zoptal/tsconfig** - TypeScript configuration
- **@zoptal/eslint-config** - ESLint configuration

### Libraries (`/libs`)
- **api-client** - HTTP client utilities
- **types** - Shared TypeScript types
- **utils** - Common utility functions

---

## 3. CI/CD Pipeline Architecture

### Build System
- **Monorepo Tool:** Turborepo with remote caching
- **Package Manager:** pnpm 8.15.0 (workspace support)
- **Build Optimization:** Incremental builds with dependency graph

### GitHub Actions Workflows

#### Core CI/CD Workflows
1. **ci.yml** - Continuous Integration
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit/Integration tests (Vitest, Jest)
   - Security scanning
   - Matrix testing (Node 18, 20, 22)

2. **cd.yml** - Continuous Deployment
   - Docker image building (multi-arch: linux/amd64, linux/arm64)
   - Container registry: GitHub Container Registry (ghcr.io)
   - Image signing with Cosign
   - Staging deployment (automatic on main)
   - Production deployment (manual approval)

3. **deploy-services.yml** - Microservices Deployment
   - Smart change detection
   - Blue-green deployments
   - Health checks and smoke tests
   - Automatic rollback on failure
   - Kubernetes deployment via Helm

4. **deploy-apps.yml** - Frontend Deployment
   - Vercel integration for Next.js apps
   - Preview deployments for PRs
   - Lighthouse performance audits
   - CDN cache purging
   - E2E testing post-deployment

#### Advanced Deployment Strategies
1. **blue-green-deploy.yml** - Zero-downtime deployments
2. **canary-deploy.yml** - Gradual rollout with traffic splitting
3. **auto-rollback.yml** - Automatic rollback on metrics degradation
4. **deployment-orchestrator.yml** - Complex multi-service deployments

#### Security & Compliance
1. **security.yml** - Comprehensive security scanning
   - Dependency scanning (npm audit, Snyk)
   - Static code analysis (CodeQL, Semgrep)
   - Secret scanning (TruffleHog, GitLeaks)
   - Container vulnerability scanning (Trivy, Grype)
   - License compliance checking

2. **security-scan.yml** - Scheduled security audits
3. **security-tests.yml** - Penetration testing automation

#### Performance & Monitoring
1. **performance-monitoring.yml** - Scheduled performance tests
   - Lighthouse audits (Web)
   - k6 load testing (API)
   - Real User Monitoring integration

2. **performance-tests.yml** - Comprehensive performance suite
   - Load testing
   - Stress testing
   - Spike testing
   - Endurance testing

#### Release Management
1. **release.yml** - Automated releases
   - Semantic versioning with Changesets
   - Automated changelog generation
   - Multi-registry publishing (npm, Docker Hub)
   - GitHub Releases creation

---

## 4. Infrastructure as Code (IaC)

### Terraform Configuration
- **Provider:** AWS (primary cloud provider)
- **State Management:** S3 backend with DynamoDB locking
- **Modules:**
  - VPC with multi-AZ setup
  - EKS cluster configuration
  - RDS PostgreSQL (Multi-AZ for production)
  - ElastiCache Redis cluster
  - ALB/NLB load balancers
  - Security groups and IAM roles

### Kubernetes (K8s) Configuration
- **Platform:** AWS EKS
- **Service Mesh:** Istio installation ready
- **Deployment Method:** Helm charts
- **Namespaces:**
  - production
  - staging
  - monitoring
  - service-mesh

#### K8s Resources
- **Database:** StatefulSets for PostgreSQL, Redis, ClickHouse
- **Services:** Deployments with HPA (Horizontal Pod Autoscaler)
- **Networking:** Ingress controllers, Network policies
- **Security:** RBAC, Security policies, Secrets management
- **Monitoring:** Prometheus, Grafana, Jaeger tracing
- **Logging:** ELK stack (Elasticsearch, Logstash, Kibana)

---

## 5. Docker Configuration

### Containerization Strategy
- **Multi-stage builds** for optimization
- **Base images:** Alpine Linux for minimal size
- **Layer caching** for faster builds
- **Security scanning** integrated in pipeline

### Docker Compose Environments
1. **docker-compose.yml** - Development environment
2. **docker-compose.prod.yml** - Production-like environment
3. **docker-compose.test.yml** - Integration testing

### Container Registry
- **Primary:** GitHub Container Registry (ghcr.io)
- **Backup:** Docker Hub
- **Image signing:** Cosign for supply chain security

---

## 6. Monitoring & Observability

### Application Performance Monitoring
- **Frontend:** Vercel Analytics, Web Vitals
- **Backend:** Custom metrics with Prometheus
- **Error Tracking:** Sentry (all environments)
- **Real User Monitoring:** PostHog integration

### Infrastructure Monitoring
- **Metrics:** Prometheus + Grafana dashboards
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing:** Jaeger for distributed tracing
- **Alerting:** AlertManager with Slack/PagerDuty integration

### Security Monitoring
- **Vulnerability Scanning:** Continuous with Trivy, Snyk
- **Secret Detection:** GitLeaks, TruffleHog
- **Compliance:** GDPR service for data privacy

---

## 7. Environment Configuration

### Environment Hierarchy
1. **Development** (local)
   - Docker Compose based
   - Hot reloading enabled
   - Local databases

2. **Staging**
   - AWS EKS cluster (single NAT gateway)
   - Reduced replicas
   - Full monitoring stack

3. **Production**
   - AWS EKS cluster (multi-AZ, multiple NAT gateways)
   - Auto-scaling enabled
   - Full redundancy and backup

### Configuration Management
- **Secrets:** AWS Secrets Manager / Kubernetes Secrets
- **Feature Flags:** Custom feature-flag-service
- **Environment Variables:** Per-service .env files
- **ConfigMaps:** Kubernetes ConfigMaps for non-sensitive config

---

## 8. Server & Infrastructure Requirements

### Development Environment
- **CPU:** 4+ cores recommended
- **RAM:** 16GB minimum
- **Storage:** 50GB+ SSD
- **Docker:** Latest stable version
- **Node.js:** 18.0.0+
- **pnpm:** 8.0.0+

### Staging Environment (AWS)
- **EKS Nodes:** t3.large (2 vCPU, 8GB RAM) minimum
- **RDS:** db.t3.medium (PostgreSQL)
- **ElastiCache:** cache.t3.micro (Redis)
- **Load Balancer:** Application Load Balancer

### Production Environment (AWS)
- **EKS Nodes:** t3.xlarge/c5.xlarge (4 vCPU, 16GB RAM)
- **RDS:** db.r5.xlarge (Multi-AZ, automated backups)
- **ElastiCache:** cache.r5.large (Redis cluster mode)
- **Load Balancer:** Application Load Balancer with WAF
- **Auto-scaling:** HPA and Cluster Autoscaler configured
- **Backup:** Daily automated backups, 30-day retention

---

## 9. CI/CD Pipeline Responsibilities

### What CI/CD Handles

#### Continuous Integration
- Code quality checks (linting, formatting)
- Type safety verification
- Unit and integration testing
- Security vulnerability scanning
- Docker image building
- Artifact generation

#### Continuous Deployment
- Environment-specific deployments
- Blue-green and canary deployments
- Database migrations
- Configuration updates
- Health checks and smoke tests
- Automatic rollback on failures
- CDN cache invalidation
- SSL certificate management

#### Release Management
- Version bumping (semantic versioning)
- Changelog generation
- Git tagging
- Package publishing (npm, Docker)
- GitHub Release creation
- Documentation updates

---

## 10. DevOps Responsibilities

### Infrastructure Management
- **Provisioning:** Terraform for AWS resources
- **Orchestration:** Kubernetes cluster management
- **Scaling:** Auto-scaling policies and configuration
- **Networking:** VPC, subnets, security groups
- **Storage:** S3 buckets, EBS volumes, backup strategies

### Monitoring & Alerting
- **Metrics Collection:** Prometheus configuration
- **Dashboard Creation:** Grafana dashboards
- **Alert Rules:** AlertManager configuration
- **Log Aggregation:** ELK stack management
- **Incident Response:** PagerDuty integration

### Security & Compliance
- **Access Control:** IAM roles and policies
- **Secret Management:** Rotation and encryption
- **Compliance Auditing:** GDPR, SOC2 preparations
- **Backup & Disaster Recovery:** Automated backup strategies
- **Network Security:** Firewall rules, WAF configuration

### Performance Optimization
- **Load Testing:** k6, JMeter configurations
- **CDN Configuration:** CloudFlare and CloudFront
- **Database Optimization:** Query optimization, indexing
- **Caching Strategies:** Redis configuration
- **Resource Optimization:** Right-sizing instances

---

## 11. Key Integrations & External Services

### AI/ML Services
- OpenAI API
- Anthropic Claude API
- Google AI (Gemini)
- Azure OpenAI

### Payment & Billing
- Stripe (subscriptions, payments)
- Webhook processing

### Communication
- SendGrid (transactional email)
- Twilio (SMS, voice)
- Web Push notifications

### Analytics & Tracking
- Google Analytics
- Mixpanel
- Amplitude
- Hotjar

### Content Management
- Contentful CMS

### Authentication Providers
- Google OAuth
- GitHub OAuth
- Microsoft OAuth
- Apple Sign-In
- SAML 2.0
- OpenID Connect

---

## 12. Testing Strategy

### Test Types
1. **Unit Tests:** Vitest, Jest
2. **Integration Tests:** API testing with Supertest
3. **E2E Tests:** Playwright
4. **Performance Tests:** k6, Lighthouse
5. **Security Tests:** OWASP ZAP, custom pentesting scripts
6. **Visual Regression:** Percy integration

### Test Automation
- Tests run on every PR
- Blocking tests for merge
- Nightly full test suite runs
- Performance benchmarking

---

## 13. Deployment Patterns & Strategies

### Current Implementation
1. **Blue-Green Deployments**
   - Zero-downtime deployments
   - Instant rollback capability
   - Full environment switch

2. **Canary Deployments**
   - Gradual traffic shifting (5% → 25% → 50% → 100%)
   - Metrics-based promotion
   - Automatic rollback on anomalies

3. **Rolling Updates**
   - Default for non-critical services
   - Gradual pod replacement
   - Health check validation

### Traffic Management
- **Load Balancing:** ALB with target groups
- **Service Mesh:** Istio-ready for advanced traffic management
- **Rate Limiting:** Per-service configuration
- **Circuit Breakers:** Implemented in critical services

---

## 14. Backup & Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups, point-in-time recovery
- **File Storage:** S3 versioning and replication
- **Configuration:** Git-based with version control
- **Secrets:** Encrypted backups in separate region

### Disaster Recovery
- **RPO:** 1 hour for critical data
- **RTO:** 4 hours for full service restoration
- **Multi-region:** Ready for activation (not currently active)
- **Runbooks:** Documented recovery procedures

---

## 15. Cost Optimization Measures

### Current Implementations
- **Spot Instances:** For non-critical workloads
- **Reserved Instances:** For predictable workloads
- **Auto-scaling:** Scale down during low traffic
- **Resource Tagging:** For cost allocation
- **Scheduled Scaling:** For predictable patterns

### Monitoring
- **AWS Cost Explorer** integration
- **Budget Alerts** configured
- **Resource utilization** dashboards

---

## 16. Security Best Practices

### Code Security
- **Dependency scanning** on every PR
- **Secret scanning** prevents credential leaks
- **SAST** with CodeQL and Semgrep
- **Container scanning** for vulnerabilities

### Runtime Security
- **Network policies** for pod communication
- **Security policies** for pod security standards
- **RBAC** for access control
- **Service mesh** for mTLS between services

### Compliance
- **GDPR service** for data privacy
- **Audit logging** for all critical operations
- **Data retention** policies implemented
- **Encryption** at rest and in transit

---

## 17. Documentation & Knowledge Base

### Available Documentation
- **API Documentation:** Swagger/OpenAPI specs
- **Deployment Guides:** In `.github/workflows/README.md`
- **Architecture Diagrams:** In `/docs/architecture`
- **Runbooks:** Operational procedures documented
- **Postmortems:** Incident analysis and learnings

---

## 18. Team Collaboration Tools

### Development Workflow
- **Version Control:** Git with GitHub
- **Code Review:** GitHub Pull Requests
- **Issue Tracking:** GitHub Issues with auto-labeling
- **Project Management:** GitHub Projects

### Communication
- **Alerts:** Slack webhooks for CI/CD events
- **Security Alerts:** Dedicated Slack channel
- **Incident Management:** PagerDuty integration

---

## 19. Future Considerations & Recommendations

### Short-term Improvements
1. **GitOps Implementation:** ArgoCD for declarative deployments
2. **Service Mesh Activation:** Enable Istio for advanced traffic management
3. **Multi-region Setup:** Active-active or active-passive DR
4. **FinOps Practice:** Cost optimization automation

### Long-term Vision
1. **Platform Engineering:** Internal developer platform
2. **AI-Ops:** Predictive scaling and anomaly detection
3. **Chaos Engineering:** Automated resilience testing
4. **Zero-trust Security:** Complete implementation

---

## 20. Key Metrics & SLIs/SLOs

### Service Level Indicators (SLIs)
- **Availability:** 99.9% uptime target
- **Latency:** p95 < 200ms for API calls
- **Error Rate:** < 0.1% for critical paths
- **Throughput:** 10,000 RPS capacity

### Key Performance Indicators (KPIs)
- **Deployment Frequency:** Multiple times per day
- **Lead Time:** < 1 hour from commit to production
- **MTTR:** < 30 minutes
- **Change Failure Rate:** < 5%

---

## Contact & Support

### Repository
- **GitHub:** github.com/zoptal/zoptal-monorepo

### Key Configuration Files
- **CI/CD:** `.github/workflows/`
- **Docker:** `Dockerfile` in each service
- **Kubernetes:** `k8s/` directory
- **Terraform:** `infrastructure/terraform/`
- **Package Management:** `package.json`, `pnpm-workspace.yaml`

---

## Appendix: Critical Dependencies Summary

### Core Framework Dependencies
- Next.js 14.2.3
- React 18.3.0
- TypeScript 5.4.0
- Fastify 4.25.0
- Prisma 6.13.0

### DevOps Tools
- Docker (latest stable)
- Kubernetes 1.28
- Terraform 1.5.0+
- Helm 3.x
- GitHub Actions

### Monitoring Stack
- Prometheus
- Grafana
- Jaeger
- ELK Stack
- Sentry

---

*This document provides a comprehensive overview of the Zoptal monorepo CI/CD and DevOps architecture. For specific implementation details, refer to the source code and configuration files in the repository.*