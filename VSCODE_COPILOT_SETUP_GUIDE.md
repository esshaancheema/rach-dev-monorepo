# Zoptal Monorepo - Complete Setup Guide for VS Code & GitHub Copilot

**A comprehensive, step-by-step guide to setting up the Zoptal AI-Accelerated Development Platform**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VS Code Setup](#vs-code-setup)
3. [System Environment Setup](#system-environment-setup)
4. [Project Installation](#project-installation)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Database Setup](#database-setup)
7. [Running the Project](#running-the-project)
8. [Complete Dependencies Reference](#complete-dependencies-reference)
9. [Troubleshooting](#troubleshooting)
10. [Development Workflow](#development-workflow)

---

## Prerequisites

### Required Software Versions

| Software | Version | Required |
|----------|---------|----------|
| **Node.js** | 18.19.0 (LTS) | ✅ Yes |
| **pnpm** | 8.15.0+ | ✅ Yes |
| **Docker Desktop** | Latest | ✅ Yes (for local dev) |
| **PostgreSQL** | 15+ | ✅ Yes |
| **Redis** | 7+ | ✅ Yes (via Docker) |
| **Git** | Latest | ✅ Yes |
| **VS Code** | Latest | ✅ Yes |

### Operating System Support

- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Windows 10/11** (with WSL2 recommended)
- ✅ **Linux** (Ubuntu 20.04+, Debian, Fedora)

---

## VS Code Setup

### Step 1: Install Visual Studio Code

1. Download VS Code from [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Install for your operating system
3. Launch VS Code

### Step 2: Install GitHub Copilot

1. Open VS Code
2. Click the **Extensions** icon (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "GitHub Copilot"
4. Click **Install** on both:
   - **GitHub Copilot** (main extension)
   - **GitHub Copilot Chat** (chat interface)
5. Sign in with your GitHub account
6. Verify your Copilot subscription is active

### Step 3: Install Essential Extensions

Install these extensions for optimal development experience:

#### Required Extensions

```bash
# Open VS Code Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
# Type: "Extensions: Install Extensions"
```

| Extension | Extension ID | Purpose |
|-----------|-------------|---------|
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **ESLint** | `dbaeumer.vscode-eslint` | Linting |
| **Prisma** | `Prisma.prisma` | Database schema support |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind autocomplete |
| **Error Lens** | `usernamehw.errorlens` | Inline error display |
| **GitLens** | `eamodio.gitlens` | Enhanced Git features |
| **Docker** | `ms-azuretools.vscode-docker` | Docker support |
| **Thunder Client** | `rangav.vscode-thunder-client` | API testing |
| **DotENV** | `mikestead.dotenv` | .env file syntax |
| **Path Intellisense** | `christian-kohler.path-intellisense` | Path autocomplete |

#### Optional but Recommended

- **GitHub Copilot Labs** (`GitHub.copilot-labs`) - Experimental features
- **REST Client** (`humao.rest-client`) - API testing in files
- **Import Cost** (`wix.vscode-import-cost`) - Display import sizes
- **Todo Tree** (`Gruntfuggly.todo-tree`) - TODO/FIXME highlighting
- **Better Comments** (`aaron-bond.better-comments`) - Comment highlighting

### Step 4: Configure VS Code Settings

Create a `.vscode/settings.json` file in your project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.eol": "\n",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.workingDirectories": [
    { "mode": "auto" }
  ],
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": false,
    "markdown": true,
    "typescript": true,
    "javascript": true,
    "typescriptreact": true,
    "javascriptreact": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "prisma.fileWatcher": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### Step 5: Install VS Code Command Line Tools

**macOS/Linux:**
```bash
# Open Command Palette (Cmd+Shift+P)
# Type: "Shell Command: Install 'code' command in PATH"
```

**Windows:**
- Automatically available after installation

---

## System Environment Setup

### Step 1: Install Node.js (using nvm - Recommended)

#### macOS/Linux:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc for zsh

# Install Node.js 18.19.0
nvm install 18.19.0

# Set as default
nvm use 18.19.0
nvm alias default 18.19.0

# Verify installation
node --version  # Should output: v18.19.0
npm --version
```

#### Windows:

```powershell
# Install nvm-windows from:
# https://github.com/coreybutler/nvm-windows/releases

# After installation:
nvm install 18.19.0
nvm use 18.19.0

# Verify
node --version
```

### Step 2: Install pnpm

```bash
# Using npm (comes with Node.js)
npm install -g pnpm@8.15.0

# Verify installation
pnpm --version  # Should output: 8.15.0

# Configure pnpm
pnpm config set store-dir ~/.pnpm-store
pnpm config set shamefully-hoist true
```

**Why pnpm?**
- ✅ Faster than npm/yarn
- ✅ Efficient disk space usage
- ✅ Strict dependency resolution
- ✅ Better monorepo support

### Step 3: Install Docker Desktop

#### macOS:

1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Install the `.dmg` file
3. Launch Docker Desktop
4. Wait for Docker to start (whale icon in menu bar)

#### Windows:

1. Enable WSL2 (Windows Subsystem for Linux)
   ```powershell
   # Run as Administrator
   wsl --install
   wsl --set-default-version 2
   ```
2. Download and install Docker Desktop
3. Enable "Use WSL 2 based engine" in settings
4. Restart your computer

#### Linux (Ubuntu/Debian):

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify
docker --version
docker compose version
```

### Step 4: Install PostgreSQL (Optional - for non-Docker setup)

#### macOS (using Homebrew):

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Verify
psql --version
```

#### Windows:

1. Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer (version 15+)
3. Remember the password you set for the postgres user
4. Add PostgreSQL to PATH

#### Linux (Ubuntu/Debian):

```bash
# Install PostgreSQL 15
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

### Step 5: Install Git (if not already installed)

#### macOS:
```bash
brew install git
```

#### Windows:
Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)

#### Linux:
```bash
sudo apt-get install git
```

---

## Project Installation

### Step 1: Clone the Repository

```bash
# Navigate to your projects directory
cd ~/Documents/GitHub  # or your preferred location

# Clone the repository
git clone https://github.com/esshaancheema/rach-dev-monorepo.git

# Navigate into the project
cd rach-dev-monorepo

# Verify you're on the main branch
git branch
```

### Step 2: Install Dependencies

```bash
# Install all workspace dependencies (this may take 5-10 minutes)
pnpm install

# Expected output:
# - Installing packages across all workspaces
# - Running postinstall scripts (Prisma generation)
# - Building shared packages
```

**What gets installed:**
- Root dependencies (Turbo, ESLint, Prettier, TypeScript)
- Frontend apps (web-main, dashboard, admin)
- Backend services (auth, AI, billing, notifications, etc.)
- Shared packages (database, UI, config, utilities)

### Step 3: Verify Installation

```bash
# Check that Turbo is working
pnpm turbo --version

# Verify workspace structure
pnpm list --depth 0

# Check for any issues
pnpm audit
```

---

## Environment Variables Configuration

### Step 1: Copy Environment File

```bash
# Copy the example environment file
cp .env.example .env.local

# Also copy for individual apps
cp apps/web-main/.env.example apps/web-main/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

### Step 2: Configure Environment Variables

Open `.env.local` in VS Code and configure the following:

#### 🔴 Critical - Must Configure

```bash
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zoptal_dev?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication Secrets (CHANGE THESE!)
NEXTAUTH_SECRET="your-super-secret-min-32-characters-long-string-here-$(openssl rand -base64 32)"
JWT_SECRET="your-jwt-secret-$(openssl rand -base64 32)"

# API URLs (for local development)
NEXT_PUBLIC_API_URL="http://localhost:4000"
AUTH_SERVICE_URL="http://localhost:4001"
PROJECT_SERVICE_URL="http://localhost:4002"
AI_SERVICE_URL="http://localhost:4003"
BILLING_SERVICE_URL="http://localhost:4004"
NOTIFICATION_SERVICE_URL="http://localhost:4005"
ANALYTICS_SERVICE_URL="http://localhost:4006"

# Environment
NODE_ENV="development"
```

#### 🟡 Important - For Full Functionality

```bash
# AI Services (get free tier API keys)
OPENAI_API_KEY=""              # https://platform.openai.com/api-keys
ANTHROPIC_API_KEY=""           # https://console.anthropic.com/
GOOGLE_AI_API_KEY=""           # https://makersuite.google.com/app/apikey

# Email Service (choose one)
SENDGRID_API_KEY=""            # https://sendgrid.com/
# OR
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# OAuth Providers (optional for development)
GOOGLE_CLIENT_ID=""            # https://console.cloud.google.com/
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""            # https://github.com/settings/developers
GITHUB_CLIENT_SECRET=""
```

#### 🟢 Optional - For Production Features

```bash
# Payment Processing
STRIPE_SECRET_KEY=""           # https://stripe.com/
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AWS Services
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
S3_BUCKET_NAME=""

# Monitoring & Analytics
SENTRY_DSN=""                  # https://sentry.io/
GOOGLE_ANALYTICS_ID=""
MIXPANEL_TOKEN=""

# Content Management
CONTENTFUL_SPACE_ID=""         # https://contentful.com/
CONTENTFUL_ACCESS_TOKEN=""
CONTENTFUL_PREVIEW_TOKEN=""
CONTENTFUL_MANAGEMENT_TOKEN=""

# SMS Notifications
TWILIO_ACCOUNT_SID=""          # https://twilio.com/
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

### Step 3: Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Complete Environment Variables Reference

<details>
<summary>Click to see all 126 environment variables</summary>

#### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `CLICKHOUSE_URL` - ClickHouse URL (for analytics)
- `CLICKHOUSE_DATABASE` - ClickHouse database name
- `CLICKHOUSE_USER` - ClickHouse username
- `CLICKHOUSE_PASSWORD` - ClickHouse password

#### Authentication & Security
- `NEXTAUTH_URL` - NextAuth callback URL
- `NEXTAUTH_SECRET` - NextAuth encryption secret (32+ chars)
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `RECAPTCHA_SITE_KEY` - reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA secret
- `SECURITY_HEADERS_REPORT_URI` - Security headers report endpoint

#### Service URLs (Development)
- `NEXT_PUBLIC_API_URL` - Main API URL
- `AUTH_SERVICE_URL` - Auth service internal URL
- `PROJECT_SERVICE_URL` - Project service URL
- `AI_SERVICE_URL` - AI service URL
- `BILLING_SERVICE_URL` - Billing service URL
- `NOTIFICATION_SERVICE_URL` - Notification service URL
- `ANALYTICS_SERVICE_URL` - Analytics service URL

#### AI Services
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `GOOGLE_AI_API_KEY` - Google AI API key
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `AZURE_OPENAI_API_KEY` - Azure OpenAI key

#### Email & SMS
- `SENDGRID_API_KEY` - SendGrid API key
- `EMAIL_FROM` - Default from email address
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

#### Payment Processing
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PRICE_API_REQUESTS` - Stripe price ID for API requests
- `STRIPE_PRICE_CODE_GENERATIONS` - Stripe price ID for code gen

#### OAuth Providers
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- `MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID
- `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth secret
- `APPLE_CLIENT_ID` - Apple OAuth client ID
- `APPLE_CLIENT_SECRET` - Apple OAuth secret

#### AWS Services
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `S3_BUCKET_NAME` - S3 bucket name
- `AWS_CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution

#### Content Management (Contentful)
- `CONTENTFUL_SPACE_ID` - Contentful space ID
- `CONTENTFUL_ACCESS_TOKEN` - Contentful delivery API token
- `CONTENTFUL_PREVIEW_TOKEN` - Contentful preview API token
- `CONTENTFUL_MANAGEMENT_TOKEN` - Contentful management token

#### Analytics & Monitoring
- `SENTRY_DSN` - Sentry DSN
- `SENTRY_PROJECT` - Sentry project name
- `SENTRY_ORG` - Sentry organization
- `DATADOG_API_KEY` - Datadog API key
- `DATADOG_APPLICATION_KEY` - Datadog app key
- `NEW_RELIC_LICENSE_KEY` - New Relic license
- `GOOGLE_ANALYTICS_ID` - Google Analytics ID
- `MIXPANEL_TOKEN` - Mixpanel token
- `AMPLITUDE_API_KEY` - Amplitude API key
- `HOTJAR_ID` - Hotjar site ID
- `VERCEL_ANALYTICS_ID` - Vercel Analytics ID

#### Feature Flags & Configuration
- `ENABLE_AI_FEATURES` - Enable AI features (true/false)
- `ENABLE_BETA_FEATURES` - Enable beta features
- `ENABLE_MOCK_DATA` - Use mock data for development
- `SEED_DATABASE` - Seed database on startup
- `AUTO_MIGRATE` - Run migrations automatically

#### Rate Limiting
- `RATE_LIMIT_WINDOW` - Rate limit window (e.g., "15m")
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

#### CDN & Storage
- `CLOUDFLARE_API_KEY` - Cloudflare API key
- `CLOUDFLARE_ZONE_ID` - Cloudflare zone ID

#### CI/CD & Infrastructure
- `GITHUB_TOKEN` - GitHub personal access token
- `VERCEL_TOKEN` - Vercel deployment token
- `DOCKER_HUB_USERNAME` - Docker Hub username
- `DOCKER_HUB_PASSWORD` - Docker Hub password
- `DOCKER_REGISTRY` - Private Docker registry URL
- `KUBERNETES_NAMESPACE` - K8s namespace
- `HELM_CHART_VERSION` - Helm chart version

#### Development Settings
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (debug/info/warn/error)
- `DEBUG_MODE` - Enable debug mode
- `MOCK_EXTERNAL_APIS` - Mock external API calls
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry

#### Push Notifications
- `VAPID_PUBLIC_KEY` - VAPID public key
- `VAPID_PRIVATE_KEY` - VAPID private key

</details>

---

## Database Setup

### Option A: Using Docker (Recommended)

```bash
# Start database services
docker compose up -d postgres redis clickhouse

# Verify services are running
docker compose ps

# Expected output:
# NAME                  STATUS
# zoptal-postgres      Up (healthy)
# zoptal-redis         Up (healthy)
# zoptal-clickhouse    Up (healthy)

# View logs
docker compose logs -f postgres
```

### Option B: Local PostgreSQL

```bash
# Create database
createdb zoptal_dev

# OR using psql
psql -U postgres
CREATE DATABASE zoptal_dev;
\q
```

### Step 2: Run Prisma Migrations

```bash
# Navigate to database package
cd packages/database

# Generate Prisma Client
pnpm db:generate

# Push schema to database (for development)
pnpm db:push

# OR run migrations (for production-like setup)
pnpm db:migrate

# Seed database with sample data (optional)
pnpm db:seed

# Open Prisma Studio to view data
pnpm db:studio
# Opens at http://localhost:5555
```

### Step 3: Verify Database Connection

```bash
# Test connection
psql -U postgres -d zoptal_dev -c "SELECT version();"

# View tables
psql -U postgres -d zoptal_dev -c "\dt"
```

---

## Running the Project

### Option 1: Run Everything with Turbo

```bash
# Start all apps and services
pnpm dev

# This will start:
# - web-main (localhost:3000)
# - dashboard (localhost:3001)
# - All backend services
```

### Option 2: Run Specific Apps

```bash
# Run only the main website
pnpm --filter web-main dev

# Run only the dashboard
pnpm --filter dashboard dev

# Run only auth service
pnpm --filter auth-service dev

# Run multiple specific apps
pnpm --filter web-main --filter dashboard dev
```

### Option 3: Using Docker Compose (Full Stack)

```bash
# Start all services (frontend + backend + databases)
docker compose up

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### Service URLs

Once running, access these services:

| Service | URL | Description |
|---------|-----|-------------|
| **Web Main** | http://localhost:3000 | Public website |
| **Dashboard** | http://localhost:3001 | User dashboard |
| **Auth Service** | http://localhost:4001 | Authentication API |
| **Project Service** | http://localhost:4002 | Project management API |
| **AI Service** | http://localhost:4003 | AI integration API |
| **Billing Service** | http://localhost:4004 | Payment processing API |
| **Notification Service** | http://localhost:4005 | Email/SMS API |
| **Analytics Service** | http://localhost:4006 | Analytics API |
| **Prisma Studio** | http://localhost:5555 | Database GUI |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Cache |
| **ClickHouse** | localhost:8123 | Analytics DB |

---

## Complete Dependencies Reference

### Frontend Dependencies (Apps)

#### Next.js & React Core
```json
{
  "next": "^14.2.3",
  "react": "^18.3.0",
  "react-dom": "^18.3.0"
}
```

#### Styling & UI
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.537.0",
  "@headlessui/react": "^1.7.0",
  "@heroicons/react": "^2.2.0"
}
```

#### Forms & Validation
```json
{
  "react-hook-form": "^7.50.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.25.76"
}
```

#### State Management
```json
{
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.83.0",
  "swr": "^2.2.0"
}
```

#### Data Fetching & API
```json
{
  "axios": "^1.6.0",
  "@prisma/client": "^6.13.0"
}
```

#### Authentication
```json
{
  "jsonwebtoken": "^9.0.2",
  "jose": "^5.2.0",
  "bcryptjs": "^2.4.3"
}
```

#### Content Management
```json
{
  "contentful": "^11.7.15",
  "contentful-management": "^11.54.4",
  "@contentful/rich-text-react-renderer": "^16.1.0"
}
```

#### Utilities
```json
{
  "date-fns": "^4.1.0",
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0",
  "react-hot-toast": "^2.4.0"
}
```

#### Code Editor
```json
{
  "@monaco-editor/react": "^4.7.0"
}
```

#### Image Optimization
```json
{
  "sharp": "^0.33.0"
}
```

#### Analytics & Monitoring
```json
{
  "@vercel/analytics": "^1.2.0",
  "@vercel/speed-insights": "^1.0.0",
  "@sentry/nextjs": "^7.100.0",
  "posthog-js": "^1.100.0",
  "web-vitals": "^5.1.0"
}
```

### Backend Dependencies (Services)

#### Server Framework
```json
{
  "fastify": "^4.25.0",
  "fastify-plugin": "^4.5.1",
  "@fastify/cors": "^9.0.0",
  "@fastify/helmet": "^11.1.0",
  "@fastify/jwt": "^8.0.0",
  "@fastify/rate-limit": "^9.1.0",
  "@fastify/swagger": "^8.12.0",
  "@fastify/swagger-ui": "^2.0.0"
}
```

#### Database & ORM
```json
{
  "@prisma/client": "^5.9.1",
  "prisma": "^5.9.1"
}
```

#### Caching
```json
{
  "ioredis": "^5.3.2"
}
```

#### Authentication & Security
```json
{
  "argon2": "^0.31.2",
  "jsonwebtoken": "^9.0.2",
  "jose": "^5.2.0",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "oidc-provider": "^9.4.1",
  "saml2-js": "^4.0.4"
}
```

#### AI Services
```json
{
  "openai": "^4.28.0",
  "@anthropic-ai/sdk": "^0.20.1",
  "@google-ai/generativelanguage": "^2.5.0",
  "google-auth-library": "^9.6.3"
}
```

#### Email & SMS
```json
{
  "@sendgrid/mail": "^8.1.0",
  "twilio": "^4.20.0"
}
```

#### Payment Processing
```json
{
  "stripe": "^14.0.0" // (implied, would be in billing-service)
}
```

#### Logging
```json
{
  "pino": "^8.17.0",
  "pino-pretty": "^10.3.1"
}
```

#### Task Scheduling
```json
{
  "node-cron": "^3.0.3",
  "cron": "^3.1.6"
}
```

#### File Processing
```json
{
  "archiver": "^6.0.1",
  "sharp": "^0.33.0"
}
```

#### OAuth & API Clients
```json
{
  "@octokit/rest": "^20.0.2",
  "googleapis": "^128.0.0"
}
```

#### Validation
```json
{
  "zod": "^3.22.0",
  "@sinclair/typebox": "^0.32.15"
}
```

### Development Dependencies

#### TypeScript
```json
{
  "typescript": "^5.4.0",
  "@types/node": "^20.11.0",
  "@types/react": "^18.2.0"
}
```

#### Build Tools
```json
{
  "turbo": "^1.13.0",
  "tsx": "^4.7.0",
  "tsup": "^8.0.2"
}
```

#### Testing
```json
{
  "vitest": "^3.2.4",
  "@vitest/ui": "^3.2.4",
  "@playwright/test": "^1.41.0",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.8.0"
}
```

#### Linting & Formatting
```json
{
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.0",
  "prettier": "^3.2.5",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
```

#### Bundle Analysis
```json
{
  "@next/bundle-analyzer": "^14.1.0"
}
```

### Workspace Packages Structure

```
packages/
├── @zoptal/database       - Prisma schemas & client
├── @zoptal/ui             - Shared React components
├── @zoptal/config         - Shared configurations
├── @zoptal/tsconfig       - TypeScript configs
├── @zoptal/eslint-config  - ESLint configs
├── @zoptal/api-client     - API client library
├── @zoptal/auth           - Auth utilities
├── @zoptal/types          - Shared TypeScript types
└── @zoptal/utils          - Shared utilities
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find and kill process using the port
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in package.json
```

#### 2. Database Connection Error

**Error:**
```
Error: Can't reach database server at localhost:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
docker compose ps
# OR
brew services list | grep postgresql

# Restart PostgreSQL
docker compose restart postgres
# OR
brew services restart postgresql@15

# Verify DATABASE_URL in .env.local
echo $DATABASE_URL
```

#### 3. Prisma Client Not Generated

**Error:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
cd packages/database
pnpm db:generate
cd ../..
pnpm install
```

#### 4. pnpm Install Fails

**Error:**
```
ERR_PNPM_NO_MATCHING_VERSION
```

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# If still failing, use --force
pnpm install --force
```

#### 5. TypeScript Errors

**Error:**
```
Cannot find module '@zoptal/database' or its type declarations
```

**Solution:**
```bash
# Build workspace packages first
pnpm turbo run build --filter=@zoptal/database
pnpm turbo run build --filter=@zoptal/*

# Restart TypeScript server in VS Code
# Command Palette -> TypeScript: Restart TS Server
```

#### 6. Docker Compose Issues

**Error:**
```
Error: service "postgres" didn't complete successfully
```

**Solution:**
```bash
# Stop all containers
docker compose down

# Remove volumes and restart
docker compose down -v
docker compose up -d

# Check logs
docker compose logs -f postgres
```

#### 7. ESLint/Prettier Conflicts

**Error:**
```
Delete `␍` prettier/prettier
```

**Solution:**
```bash
# Fix line endings (Windows)
git config --global core.autocrlf false

# Re-clone or fix files
pnpm format
```

#### 8. GitHub Copilot Not Working

**Issue:** Copilot not suggesting code

**Solution:**
1. Check Copilot status (bottom right in VS Code)
2. Sign out and sign in again
3. Verify subscription at https://github.com/settings/copilot
4. Restart VS Code
5. Check output panel: "GitHub Copilot"

#### 9. Memory Issues (Large Monorepo)

**Error:**
```
JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Add to package.json scripts
"dev": "NODE_OPTIONS='--max-old-space-size=4096' turbo run dev"
```

#### 10. Next.js Build Errors

**Error:**
```
Error: Module not found
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf apps/web-main/.next
rm -rf apps/dashboard/.next

# Clear all caches
pnpm clean

# Rebuild
pnpm build
```

### Getting Help

1. **Check the logs:**
   ```bash
   # View service logs
   docker compose logs -f

   # View specific service
   docker compose logs -f postgres
   ```

2. **Check environment variables:**
   ```bash
   # Print all env vars
   printenv | grep NEXT_PUBLIC
   ```

3. **Verify dependencies:**
   ```bash
   pnpm list --depth 0
   ```

4. **Clean installation:**
   ```bash
   # Nuclear option - full reset
   pnpm clean
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

---

## Development Workflow

### Daily Workflow

```bash
# 1. Start your day
git pull origin main

# 2. Install any new dependencies
pnpm install

# 3. Start development
pnpm dev

# 4. Make changes using VS Code + Copilot

# 5. Run type checking
pnpm type-check

# 6. Run linting
pnpm lint

# 7. Format code
pnpm format

# 8. Commit changes
git add .
git commit -m "feat: your feature description"
git push
```

### Using GitHub Copilot Effectively

#### Inline Suggestions
- Start typing and Copilot will suggest completions
- Press `Tab` to accept
- Press `Esc` to dismiss
- Press `Alt+]` / `Option+]` to see next suggestion

#### Copilot Chat
- Open with `Ctrl+Shift+I` / `Cmd+Shift+I`
- Ask questions like:
  - "How do I create a new API endpoint?"
  - "Explain this Prisma schema"
  - "Help me debug this error"
  - "Generate a React component for user profile"

#### Copilot Labs (Experimental)
- Explain code
- Translate code
- Generate tests
- Fix bugs

### Debugging in VS Code

#### Frontend (Next.js)

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm --filter web-main dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Backend (Services)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/services/auth-service",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter web-main test

# Run tests in watch mode
pnpm --filter web-main test -- --watch

# Run E2E tests
pnpm --filter web-main test:e2e

# Run with UI
pnpm --filter web-main test:ui
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter web-main build

# Analyze bundle size
pnpm --filter web-main analyze
```

---

## Additional Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Fastify**: https://www.fastify.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **pnpm**: https://pnpm.io/
- **Turbo**: https://turbo.build/repo/docs

### AI Services
- **OpenAI**: https://platform.openai.com/docs
- **Anthropic**: https://docs.anthropic.com/
- **Google AI**: https://ai.google.dev/

### Tools
- **Prisma Studio**: Visual database editor
- **Thunder Client**: API testing in VS Code
- **GitHub Copilot**: AI pair programmer

---

## Project-Specific Notes

### Monorepo Structure
This project uses a **pnpm workspace** with **Turbo** for efficient builds:
- Changes in shared packages trigger rebuilds in dependent apps
- Turbo caches build outputs for faster rebuilds
- Each package can be developed independently

### Microservices Architecture
- Each service runs on a different port
- Services communicate via REST APIs
- Redis used for caching and pub/sub
- PostgreSQL for primary data
- ClickHouse for analytics

### Environment-Specific Configs
- Development: Uses Docker Compose
- Production: Uses Kubernetes
- CI/CD: GitHub Actions workflows

---

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start development servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript checks |
| `pnpm clean` | Clean build artifacts |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Prisma Studio |

### Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + P` | Command Palette |
| `Cmd/Ctrl + Shift + I` | Copilot Chat |
| `Cmd/Ctrl + P` | Quick file open |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + J` | Toggle terminal |
| `Cmd/Ctrl + Shift + F` | Search in files |
| `Alt/Option + ]` | Next Copilot suggestion |
| `Alt/Option + [` | Previous suggestion |

---

## Support & Contributing

For issues, questions, or contributions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Submit pull requests for improvements

---

**Happy Coding! 🚀**

*Generated for the Zoptal AI-Accelerated Development Platform*
*Last Updated: 2025*
