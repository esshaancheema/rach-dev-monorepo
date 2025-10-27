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

```bash
git clone https://github.com/esshaancheema/zoptal-monorepo.git
cd zoptal-monorepo
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Set up the database:

```bash
pnpm db:push
pnpm db:generate
```

5. Start development servers:

```bash
pnpm dev
```

## 📁 Project Structure

```
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
```

## 🛠 Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean all build artifacts

## 🔧 Development

### Running specific apps/services:

```bash
# Run only the main website
pnpm --filter web-main dev

# Run only the auth service
pnpm --filter auth-service dev

# Run multiple specific packages
pnpm --filter web-main --filter dashboard dev
```

### Adding dependencies:

```bash
# Add to a specific workspace
pnpm add axios --filter web-main

# Add to root
pnpm add -w turbo

# Add shared dependency
pnpm add react --filter @zoptal/ui
```

## 🚢 Deployment

Each app and service can be deployed independently using the GitHub Actions workflows in `.github/workflows/`.

## 📝 License

Copyright © 2025 Zoptal. All rights reserved.
