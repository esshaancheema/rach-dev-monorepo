# Zoptal Monorepo Setup Guide

## Initial Setup Commands

```bash
# Create the monorepo directory
mkdir zoptal-monorepo
cd zoptal-monorepo

# Initialize with pnpm (recommended for monorepos)
npm install -g pnpm
pnpm init

# Initialize git
git init

# Create .gitignore
touch .gitignore

# Create the directory structure
mkdir -p apps/{web-main,dashboard,admin,developer-portal}
mkdir -p services/{auth-service,project-service,ai-service,billing-service,notification-service,analytics-service}
mkdir -p packages/{ui,config,tsconfig,eslint-config,database}
mkdir -p libs/{utils,types,api-client}
mkdir -p infrastructure/{docker,k8s,terraform}
```

## Root Configuration Files

### package.json (root)
```json
{
  "name": "zoptal-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Zoptal - AI-Accelerated Development Platform",
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*",
    "libs/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "db:generate": "turbo run db:generate",
    "db:push": "turbo run db:push",
    "db:migrate": "turbo run db:migrate",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "turbo": "^1.13.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "env": [
        "NODE_ENV",
        "NEXT_PUBLIC_API_URL",
        "DATABASE_URL"
      ]
    },
    "dev": {
      "persistent": true,
      "cache": false,
      "dependsOn": ["^build"]
    },
    "test": {
      "outputs": ["coverage/**"],
      "dependsOn": ["build"],
      "env": ["NODE_ENV"]
    },
    "lint": {
      "outputs": [],
      "dependsOn": []
    },
    "type-check": {
      "outputs": [],
      "dependsOn": []
    },
    "clean": {
      "cache": false
    },
    "db:generate": {
      "cache": false,
      "outputs": ["node_modules/.prisma/**"]
    },
    "db:push": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

### .gitignore
```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
*.lcov
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.production

# Misc
.DS_Store
*.pem
.idea
.vscode

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Turbo
.turbo

# TypeScript
*.tsbuildinfo

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Database
*.db
*.sqlite
*.sqlite3

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode/*
!.vscode/extensions.json
.idea
*.swp
*.swo
*~

# Build outputs
dist
build
.cache

# Temporary files
tmp
temp
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
  - "libs/*"
```

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### .eslintrc.js
```javascript
module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `@zoptal/eslint-config`
  extends: ["@zoptal/eslint-config"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
```

### tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "isolatedModules": true
  },
  "exclude": ["node_modules"]
}
```

### .nvmrc
```
18.19.0
```

### README.md
```markdown
# Zoptal Monorepo

AI-Accelerated Development Platform that combines the Power Of Artificial Intelligence with Human Software Engineers to Deliver Production-Ready Applications at God Speed.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Docker (for local development)
- PostgreSQL 15+

### Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/zoptal/zoptal-monorepo.git
cd zoptal-monorepo
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Set up the database:
\`\`\`bash
pnpm db:push
pnpm db:generate
\`\`\`

5. Start development servers:
\`\`\`bash
pnpm dev
\`\`\`

## 📁 Project Structure

\`\`\`
zoptal-monorepo/
├── apps/
│   ├── web-main/          # Public website (Next.js 14+ SSR)
│   ├── dashboard/         # User dashboard (Next.js)
│   ├── admin/            # Admin panel (Next.js)
│   └── developer-portal/ # Developer dashboard (Next.js)
├── services/
│   ├── auth-service/     # Authentication & authorization
│   ├── project-service/  # Project management
│   ├── ai-service/       # AI integrations
│   ├── billing-service/  # Payment processing
│   └── notification-service/ # Email/SMS/Push
├── packages/
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configurations
│   ├── database/        # Database schemas & migrations
│   └── eslint-config/   # ESLint configurations
├── libs/
│   ├── utils/           # Shared utilities
│   ├── types/           # TypeScript types
│   └── api-client/      # API client library
└── infrastructure/
    ├── docker/          # Docker configurations
    ├── k8s/            # Kubernetes manifests
    └── terraform/      # Infrastructure as Code
\`\`\`

## 🛠 Available Scripts

- \`pnpm dev\` - Start all development servers
- \`pnpm build\` - Build all packages
- \`pnpm test\` - Run tests across all packages
- \`pnpm lint\` - Lint all packages
- \`pnpm type-check\` - Run TypeScript type checking
- \`pnpm clean\` - Clean all build artifacts

## 🔧 Development

### Running specific apps/services:

\`\`\`bash
# Run only the main website
pnpm --filter web-main dev

# Run only the auth service
pnpm --filter auth-service dev

# Run multiple specific packages
pnpm --filter web-main --filter dashboard dev
\`\`\`

### Adding dependencies:

\`\`\`bash
# Add to a specific workspace
pnpm add axios --filter web-main

# Add to root
pnpm add -w turbo

# Add shared dependency
pnpm add react --filter @zoptal/ui
\`\`\`

## 🚢 Deployment

Each app and service can be deployed independently using the GitHub Actions workflows in `.github/workflows/`.

## 📝 License

Copyright © 2025 Zoptal. All rights reserved.
\`\`\`

## Docker Configuration

### docker-compose.yml (for local development)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: zoptal
      POSTGRES_PASSWORD: zoptal_dev_password
      POSTGRES_DB: zoptal_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

### .env.example
```env
# Database
DATABASE_URL="postgresql://zoptal:zoptal_dev_password@localhost:5432/zoptal_dev?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-min-32-chars"
JWT_SECRET="your-jwt-secret"

# API URLs (Development)
NEXT_PUBLIC_API_URL="http://localhost:4000"
AUTH_SERVICE_URL="http://localhost:4001"
PROJECT_SERVICE_URL="http://localhost:4002"
AI_SERVICE_URL="http://localhost:4003"

# AI Services
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""

# Payment Services
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email Service
SENDGRID_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""

# AWS Services
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
S3_BUCKET_NAME=""

# Google Services
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Monitoring
SENTRY_DSN=""
DATADOG_API_KEY=""

# Feature Flags
ENABLE_AI_FEATURES="true"
ENABLE_BETA_FEATURES="false"

# Rate Limiting
RATE_LIMIT_WINDOW="15m"
RATE_LIMIT_MAX_REQUESTS="100"
```

## Next Steps

1. Run the setup commands above to create the monorepo structure
2. I'll create the first package configurations (UI, Config, Database)
3. Set up the authentication service
4. Create the main website with SEO optimization

Would you like me to continue with creating the specific package configurations and the authentication service CLAUDE.md?

