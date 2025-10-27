# Zoptal Shared Packages Setup

## Package 1: @zoptal/ui (Shared UI Components)

### packages/ui/package.json
```json
{
  "name": "@zoptal/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "license": "MIT",
  "files": [
    "dist/**"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint . --max-warnings 0",
    "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@zoptal/eslint-config": "workspace:*",
    "@zoptal/tsconfig": "workspace:*",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.57.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0"
  },
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.300.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### packages/ui/tsup.config.ts
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
```

### packages/ui/src/index.ts
```typescript
// Base components
export * from './components/button';
export * from './components/card';
export * from './components/input';
export * from './components/label';
export * from './components/textarea';
export * from './components/select';
export * from './components/dialog';
export * from './components/alert';
export * from './components/toast';
export * from './components/tooltip';
export * from './components/dropdown-menu';
export * from './components/separator';
export * from './components/tabs';
export * from './components/badge';
export * from './components/skeleton';
export * from './components/spinner';

// Complex components
export * from './components/header';
export * from './components/footer';
export * from './components/hero-section';
export * from './components/trust-indicators';
export * from './components/testimonial-card';
export * from './components/pricing-card';
export * from './components/feature-card';

// Hooks
export * from './hooks/use-toast';
export * from './hooks/use-media-query';
export * from './hooks/use-debounce';
export * from './hooks/use-local-storage';

// Utils
export * from './lib/utils';
```

### packages/ui/src/components/button.tsx
```typescript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### packages/ui/src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}
```

## Package 2: @zoptal/database (Prisma Schema & Models)

### packages/database/package.json
```json
{
  "name": "@zoptal/database",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist/**",
    "prisma/**"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "clean": "rm -rf .turbo && rm -rf node_modules && rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^5.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@zoptal/tsconfig": "workspace:*",
    "prisma": "^5.9.0",
    "tsup": "^8.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

### packages/database/prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  phone             String?
  phoneVerified     DateTime?
  password          String?
  image             String?
  role              UserRole  @default(USER)
  status            UserStatus @default(ACTIVE)
  
  // Profile
  company           String?
  industry          String?
  country           String?
  city              String?
  timezone          String?
  language          String    @default("en")
  
  // Subscription
  subscriptionTier  SubscriptionTier @default(FREE)
  subscriptionEnd   DateTime?
  aiCredits         Int       @default(3)
  
  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  projects          Project[]
  aiAgents          AIAgent[]
  consultations     Consultation[]
  notifications     Notification[]
  activities        Activity[]
  payments          Payment[]
  teamMembers       TeamMember[]
  
  @@index([email])
  @@index([role])
  @@index([subscriptionTier])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

// Projects
model Project {
  id              String   @id @default(cuid())
  name            String
  description     String?
  type            ProjectType
  status          ProjectStatus @default(PLANNING)
  visibility      Visibility @default(PRIVATE)
  
  // Technical Details
  framework       String?
  deploymentUrl   String?
  githubUrl       String?
  
  // AI Integration
  aiModel         String?
  promptCount     Int      @default(0)
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deployedAt      DateTime?
  
  // Relations
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  files           ProjectFile[]
  deployments     Deployment[]
  collaborators   ProjectCollaborator[]
  aiConversations AIConversation[]
  
  @@index([userId])
  @@index([status])
  @@index([type])
}

// AI Agents
model AIAgent {
  id              String   @id @default(cuid())
  name            String
  description     String?
  type            AIAgentType
  status          AIAgentStatus @default(ACTIVE)
  
  // Configuration
  model           String
  systemPrompt    String?
  temperature     Float    @default(0.7)
  maxTokens       Int      @default(1000)
  
  // Usage
  totalRequests   Int      @default(0)
  totalTokens     Int      @default(0)
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  conversations   AIConversation[]
  
  @@index([userId])
  @@index([type])
}

// Enums
enum UserRole {
  USER
  DEVELOPER
  ADMIN
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum SubscriptionTier {
  FREE
  STARTER
  PRO
  MAX
  ENTERPRISE
}

enum ProjectType {
  WEB_APP
  MOBILE_APP
  SAAS
  MICRO_SAAS
  AI_AGENT
  ENTERPRISE
  ECOMMERCE
  MARKETPLACE
}

enum ProjectStatus {
  PLANNING
  DEVELOPMENT
  TESTING
  REVIEW
  DEPLOYED
  ARCHIVED
}

enum Visibility {
  PUBLIC
  PRIVATE
  TEAM
}

enum AIAgentType {
  CHATBOT
  CODE_ASSISTANT
  CONTENT_GENERATOR
  DATA_ANALYZER
  CUSTOM
}

enum AIAgentStatus {
  ACTIVE
  INACTIVE
  TRAINING
  ERROR
}
```

### packages/database/src/index.ts
```typescript
export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';

// Re-export useful types
export type {
  User,
  Project,
  AIAgent,
  Consultation,
  Payment,
} from '@prisma/client';
```

## Package 3: @zoptal/config (Shared Configurations)

### packages/config/package.json
```json
{
  "name": "@zoptal/config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "files": [
    "eslint-preset.js",
    "tailwind.config.js",
    "constants.js"
  ]
}
```

### packages/config/eslint-preset.js
```javascript
module.exports = {
  extends: [
    'next',
    'turbo',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
};
```

### packages/config/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### packages/config/constants.js
```javascript
module.exports = {
  // API Endpoints
  API_ENDPOINTS: {
    AUTH_SERVICE: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    PROJECT_SERVICE: process.env.PROJECT_SERVICE_URL || 'http://localhost:4002',
    AI_SERVICE: process.env.AI_SERVICE_URL || 'http://localhost:4003',
    BILLING_SERVICE: process.env.BILLING_SERVICE_URL || 'http://localhost:4004',
    NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005',
  },

  // SEO Keywords
  SEO_KEYWORDS: [
    'Custom Software Development Company',
    'Mobile Application Development Company',
    'AI-Agents Development Company',
    'Micro SaaS Application Development Company',
    'SAAS Applications Development Company',
    'Enterprise Application Development Company',
  ],

  // Supported Locations
  LOCATIONS: [
    { country: 'usa', city: 'new-york', region: 'NY' },
    { country: 'usa', city: 'texas', region: 'TX' },
    { country: 'usa', city: 'san-diego', region: 'CA' },
    { country: 'uae', city: 'dubai', region: 'Dubai' },
    { country: 'uk', city: 'london', region: 'England' },
    { country: 'germany', city: 'berlin', region: 'Berlin' },
    { country: 'singapore', city: 'singapore', region: 'Singapore' },
    { country: 'india', city: 'mumbai', region: 'Maharashtra' },
  ],
  
  // Supported Locations
LOCATIONS: [
  // USA
  { country: 'usa', city: 'new-york', region: 'NY' },
  { country: 'usa', city: 'san-francisco', region: 'CA' },
  { country: 'usa', city: 'los-angeles', region: 'CA' },
  { country: 'usa', city: 'austin', region: 'TX' },
  { country: 'usa', city: 'chicago', region: 'IL' },
  { country: 'usa', city: 'texas', region: 'TX' },
  { country: 'usa', city: 'san-diego', region: 'CA' },
  // UK
  { country: 'uk', city: 'london', region: 'England' },
  { country: 'uk', city: 'manchester', region: 'England' },
  { country: 'uk', city: 'birmingham', region: 'England' },
  // Austria
  { country: 'austria', city: 'vienna', region: 'Vienna' },
  { country: 'austria', city: 'graz', region: 'Styria' },
  // Germany
  { country: 'germany', city: 'berlin', region: 'Berlin' },
  { country: 'germany', city: 'munich', region: 'Bavaria' },
  { country: 'germany', city: 'hamburg', region: 'Hamburg' },
  // France
  { country: 'france', city: 'paris', region: 'Île-de-France' },
  { country: 'france', city: 'lyon', region: 'Auvergne-Rhône-Alpes' },
  { country: 'france', city: 'marseille', region: 'Provence-Alpes-Côte d\'Azur' },
  // Australia
  { country: 'australia', city: 'sydney', region: 'NSW' },
  { country: 'australia', city: 'melbourne', region: 'VIC' },
  { country: 'australia', city: 'brisbane', region: 'QLD' },
  { country: 'australia', city: 'perth', region: 'WA' },
  // UAE
  { country: 'uae', city: 'dubai', region: 'Dubai' },
  { country: 'uae', city: 'abu-dhabi', region: 'Abu Dhabi' },
  // Saudi Arabia
  { country: 'saudi-arabia', city: 'riyadh', region: 'Riyadh' },
  { country: 'saudi-arabia', city: 'jeddah', region: 'Makkah' },
  { country: 'saudi-arabia', city: 'dammam', region: 'Eastern Province' },
  // Israel
  { country: 'israel', city: 'tel-aviv', region: 'Tel Aviv District' },
  { country: 'israel', city: 'jerusalem', region: 'Jerusalem District' },
  // Singapore
  { country: 'singapore', city: 'singapore', region: 'Singapore' },
  // India
  { country: 'india', city: 'mumbai', region: 'Maharashtra' },
  { country: 'india', city: 'bangalore', region: 'Karnataka' },
  { country: 'india', city: 'delhi', region: 'Delhi' },
  { country: 'india', city: 'hyderabad', region: 'Telangana' },
  // Japan
  { country: 'japan', city: 'tokyo', region: 'Tokyo' },
  { country: 'japan', city: 'osaka', region: 'Osaka' },
  { country: 'japan', city: 'yokohama', region: 'Kanagawa' },
  // Canada
  { country: 'canada', city: 'toronto', region: 'ON' },
  { country: 'canada', city: 'vancouver', region: 'BC' },
  { country: 'canada', city: 'montreal', region: 'QC' }
],

  // Services
  SERVICES: [
    { name: 'Custom Software Development', slug: 'custom-software-development' },
    { name: 'Mobile App Development', slug: 'mobile-app-development' },
    { name: 'AI Agents Development', slug: 'ai-agents-development' },
    { name: 'SaaS Development', slug: 'saas-development' },
    { name: 'Enterprise Solutions', slug: 'enterprise-solutions' },
  ],

  // Ready-Built Solutions
  
  READY_BUILT_SOLUTIONS: [
    { id: "ecommerce", name: "E-Commerce", category: "marketplace" },
    { id: "marketplace", name: "Marketplace", category: "marketplace" },
    { id: "hyper_local_delivery", name: "Hyper-Local Delivery", category: "logistics" },
    { id: "taxi", name: "Taxi Cab Service", category: "transportation" },
    { id: "m_health", name: "M-Health", category: "healthcare" },
    { id: "food_delivery", name: "Food Delivery", category: "marketplace" },
    { id: "b2b_ecommerce", name: "B2B E-Commerce Solution", category: "marketplace" },
    { id: "drop_shipping", name: "Drop-Shipping Solution", category: "marketplace" },
    { id: "custom_event_management", name: "Custom Event Management", category: "services" },
    { id: "dating_app", name: "Dating App", category: "social" },
    { id: "social_media_app", name: "Social Media App", category: "social" },
    { id: "home_services", name: "Home Services Solution", category: "services" },
    { id: "movers_packers", name: "Movers and Packers Solution", category: "logistics" },
    { id: "hotel_booking", name: "Hotel Booking Solution", category: "travel" },
    { id: "financial_services", name: "Financial Services", category: "finance" },
    { id: "blockchain_solutions", name: "Block-Chain Solutions for Smart Contracts, IPO, Trading Platform, and Coin Releases", category: "blockchain" },
    { id: "new_delivery_solution", name: "New Delivery Solution", category: "logistics" },
    { id: "fantasy_sports", name: "Fantasy Sports Solution", category: "entertainment" },
    { id: "professional_services", name: "Professional Services Solution", category: "services" },
    { id: "fitness_app", name: "Fitness App", category: "healthcare" },
    { id: "real_estate", name: "Real-Estate Application", category: "real-estate" },
    { id: "parking_app", name: "Parking Application Solution", category: "transportation" },
    { id: "glamping_app", name: "Glamping App", category: "travel" },
    { id: "transportation_freight", name: "Transportation and Freight Management Solution", category: "logistics" },
    { id: "instant_grocery_delivery", name: "Instant Grocery Delivery Solution", category: "marketplace" },
    { id: "auto_mobile_solution", name: "Auto-Mobile Solution", category: "automobile" },
    { id: "on_demand_vehicle_washing", name: "On-Demand Vehicle Washing Solution", category: "services" },
    { id: "on_demand_tele_medicine", name: "On-Demand Tele-Medicine Solution", category: "healthcare" },
    { id: "hr_management", name: "HR Management Solution", category: "enterprise" },
    { id: "books_management", name: "Books Management Solution", category: "education" },
    { id: "employee_management", name: "Employee Management Solution", category: "enterprise" },
    { id: "company_management", name: "Company Management Solution", category: "enterprise" }
  ]

  // Feature Flags
  FEATURE_FLAGS: {
    AI_BUILDER: true,
    REAL_TIME_COLLAB: true,
    ENTERPRISE_FEATURES: false,
    BETA_FEATURES: false,
  },
};
```

## Package 4: @zoptal/tsconfig (TypeScript Configurations)

### packages/tsconfig/package.json
```json
{
  "name": "@zoptal/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": [
    "base.json",
    "nextjs.json",
    "react-library.json",
    "node.json"
  ]
}
```

### packages/tsconfig/base.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true
  },
  "exclude": ["node_modules"]
}
```

### packages/tsconfig/nextjs.json
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Package 5: @zoptal/eslint-config

### packages/eslint-config/package.json
```json
{
  "name": "@zoptal/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint-config-next": "^14.1.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-config-turbo": "^1.12.0",
    "eslint-plugin-react": "^7.33.2"
  }
}
```

### packages/eslint-config/index.js
```javascript
module.exports = {
  extends: [
    'turbo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.turbo/',
    'coverage/',
    '.next/',
    'build/',
  ],
};
```

Now run these commands to set up the packages:

```bash
# Install dependencies for each package
cd packages/ui && pnpm install && cd ../..
cd packages/database && pnpm install && cd ../..
cd packages/config && pnpm install && cd ../..
cd packages/tsconfig && pnpm install && cd ../..
cd packages/eslint-config && pnpm install && cd ../..

# Generate Prisma client
cd packages/database && pnpm db:generate && cd ../..

# Build all packages
pnpm build
```

These shared packages provide:
1. **@zoptal/ui** - Reusable UI components with accessibility and animations
2. **@zoptal/database** - Centralized database schema and models
3. **@zoptal/config** - Shared configurations and constants
4. **@zoptal/tsconfig** - TypeScript configurations for different package types
5. **@zoptal/eslint-config** - Consistent linting rules across the monorepo

Next, would you like me to create the authentication service CLAUDE.md?
