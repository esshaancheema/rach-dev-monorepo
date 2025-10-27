# Zoptal Website Setup Instructions

## Current Status ✅
- ✅ Dev server runs successfully
- ✅ Environment variables configured
- ✅ Placeholder images and assets generated
- ⚠️ Database setup required
- ⚠️ Contentful CMS configuration needed

## Quick Start

### 1. Start the Development Server
```bash
cd apps/web-main
npm run dev
```
The server will be available at: http://localhost:3000

### 2. Database Setup

#### Option A: Using Docker (Recommended)
1. Start Docker Desktop
2. Run the database services:
```bash
docker-compose up -d postgres redis
```

#### Option B: Local PostgreSQL Installation
1. Install PostgreSQL locally
2. Create the database:
```sql
CREATE DATABASE zoptal;
```
3. Update DATABASE_URL in `.env.local` if needed

### 3. Run Database Migrations
```bash
cd packages/database
npx prisma generate
npx prisma migrate dev
```

### 4. Contentful CMS Configuration

The application currently uses mock Contentful credentials. To connect real content:

1. Create a Contentful account at https://www.contentful.com/
2. Create a new space
3. Get your API keys from Settings > API keys
4. Update these variables in `apps/web-main/.env.local`:
   - CONTENTFUL_SPACE_ID
   - CONTENTFUL_ACCESS_TOKEN
   - CONTENTFUL_PREVIEW_TOKEN
   - CONTENTFUL_MANAGEMENT_TOKEN

## Available Scripts

### Development
```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

## Project Structure

```
apps/web-main/
├── public/           # Static assets (images, icons, etc.)
├── src/
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   ├── lib/         # Utilities and libraries
│   └── styles/      # CSS files
├── .env.local       # Environment variables (not in git)
└── package.json     # Dependencies

packages/
├── database/        # Prisma schema and migrations
├── auth/           # Authentication package
└── ui/             # Shared UI components

services/           # Backend microservices
├── auth-service/
├── ai-service/
└── billing-service/
```

## Known Issues & Solutions

### Issue: Images showing 404
✅ **FIXED**: Placeholder images have been generated in `public/images/`

### Issue: Contentful content not loading
The app uses mock credentials. Real Contentful setup is optional for development.

### Issue: Database connection errors
Ensure PostgreSQL is running either via Docker or local installation.

### Issue: TypeScript errors
Run `npm run type-check` to identify and fix type issues.

## Production Deployment Checklist

- [ ] Replace all mock API keys with real ones
- [ ] Set up production database
- [ ] Configure Contentful with real content
- [ ] Set up proper authentication providers
- [ ] Configure payment processing (Stripe)
- [ ] Set up monitoring (Sentry, Analytics)
- [ ] Configure CDN for assets
- [ ] Set up email service (SendGrid/Resend)
- [ ] Review and update security settings
- [ ] Set NODE_ENV=production

## Support

For issues or questions about this setup:
1. Check the error logs in the terminal
2. Review the `.env.example` file for all required variables
3. Ensure all dependencies are installed: `npm install`
4. Clear Next.js cache if needed: `rm -rf .next`

## Next Steps

1. **Content Creation**: Add real content via Contentful CMS
2. **Styling**: Customize the design and branding
3. **Features**: Implement remaining features like contact forms
4. **Testing**: Add unit and integration tests
5. **SEO**: Optimize meta tags and structured data