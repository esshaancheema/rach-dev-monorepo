#!/bin/bash
# seed-data.sh - Development data seeding script

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

# Show help
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  seed        Seed development database with sample data"
    echo "  reset       Reset and re-seed database"
    echo "  users       Seed only user data"
    echo "  projects    Seed only project data"
    echo "  billing     Seed only billing data"
    echo "  analytics   Seed only analytics data"
    echo "  all         Seed all data types (default)"
    echo "  clean       Remove all seeded data"
    echo ""
    echo "Options:"
    echo "  --env [dev|test]  Target environment (default: dev)"
    echo "  --verbose         Show detailed output"
    echo "  --force           Force seed even if data exists"
    echo ""
    echo "Examples:"
    echo "  $0 seed"
    echo "  $0 users --force"
    echo "  $0 reset --env test"
}

# Create seed data files
create_seed_files() {
    log_info "Creating seed data files..."
    
    mkdir -p "${PROJECT_ROOT}/packages/database/seeds"
    
    # Main seed script
    cat > "${PROJECT_ROOT}/packages/database/seeds/seed.ts" << 'EOF'
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedProjects } from './projects';
import { seedBilling } from './billing';
import { seedAnalytics } from './analytics';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed in order of dependencies
    await seedUsers(prisma);
    await seedProjects(prisma);
    await seedBilling(prisma);
    await seedAnalytics(prisma);
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
    
    # Users seed data
    cat > "${PROJECT_ROOT}/packages/database/seeds/users.ts" << 'EOF'
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 Seeding users...');
  
  const password = await bcrypt.hash('password123', 12);
  
  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@zoptal.com' },
    update: {},
    create: {
      email: 'admin@zoptal.com',
      name: 'Admin User',
      password,
      emailVerified: true,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Platform administrator with full access to all features.',
      company: 'Zoptal Inc.',
      location: 'San Francisco, CA',
      website: 'https://zoptal.com',
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        language: 'en'
      }
    }
  });
  
  // Regular users
  const users = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer passionate about creating amazing web experiences.',
      company: 'TechCorp Inc.',
      location: 'New York, NY',
      website: 'https://johndoe.dev'
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
      bio: 'UI/UX designer focused on user-centered design and accessibility.',
      company: 'Design Studio',
      location: 'Los Angeles, CA',
      website: 'https://janesmith.design'
    },
    {
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1500648668408-7a8c9ae5a06e?w=150&h=150&fit=crop&crop=face',
      bio: 'Product manager with 10+ years of experience in tech startups.',
      company: 'StartupHub',
      location: 'Austin, TX'
    },
    {
      email: 'sarah.wilson@example.com',
      name: 'Sarah Wilson',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Marketing specialist helping businesses grow their online presence.',
      company: 'GrowthAgency',
      location: 'Seattle, WA',
      website: 'https://sarahwilson.marketing'
    },
    {
      email: 'premium@example.com',
      name: 'Premium User',
      role: Role.USER,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Power user testing all premium features.',
      company: 'Premium Corp'
    }
  ];
  
  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password,
        emailVerified: true,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            marketing: true
          },
          language: 'en'
        }
      }
    });
  }
  
  console.log(`✅ Created ${users.length + 1} users`);
}
EOF
    
    # Projects seed data
    cat > "${PROJECT_ROOT}/packages/database/seeds/projects.ts" << 'EOF'
import { PrismaClient, ProjectType, ProjectStatus } from '@prisma/client';

export async function seedProjects(prisma: PrismaClient) {
  console.log('📁 Seeding projects...');
  
  // Get users for project ownership
  const users = await prisma.user.findMany({
    where: { role: 'USER' }
  });
  
  if (users.length === 0) {
    console.log('⚠️  No users found, skipping project seeding');
    return;
  }
  
  const projects = [
    {
      name: 'Modern Portfolio Website',
      description: 'A stunning portfolio website showcasing creative work with smooth animations and responsive design.',
      type: ProjectType.WEBSITE,
      status: ProjectStatus.PUBLISHED,
      thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf3d?w=800&h=600&fit=crop',
      settings: {
        theme: 'modern',
        colorScheme: 'blue',
        layout: 'grid',
        animations: true,
        seo: {
          title: 'John Doe - Creative Developer',
          description: 'Portfolio of John Doe, a creative developer specializing in modern web experiences.',
          keywords: ['portfolio', 'developer', 'creative', 'web design']
        },
        analytics: {
          googleAnalytics: 'GA-XXXXX-X',
          enabled: true
        }
      },
      userId: users[0].id
    },
    {
      name: 'Restaurant Landing Page',
      description: 'Elegant landing page for a fine dining restaurant with online reservation system.',
      type: ProjectType.LANDING_PAGE,
      status: ProjectStatus.PUBLISHED,
      thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      settings: {
        theme: 'elegant',
        colorScheme: 'warm',
        layout: 'single-page',
        features: {
          reservations: true,
          menu: true,
          gallery: true,
          contact: true
        }
      },
      userId: users[1].id
    },
    {
      name: 'SaaS Product Dashboard',
      description: 'Comprehensive admin dashboard for a SaaS application with analytics and user management.',
      type: ProjectType.DASHBOARD,
      status: ProjectStatus.ACTIVE,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      settings: {
        theme: 'professional',
        colorScheme: 'dark',
        layout: 'sidebar',
        features: {
          analytics: true,
          userManagement: true,
          billing: true,
          notifications: true
        }
      },
      userId: users[0].id
    },
    {
      name: 'E-commerce Store',
      description: 'Full-featured online store with product catalog, shopping cart, and payment integration.',
      type: ProjectType.ECOMMERCE,
      status: ProjectStatus.DEVELOPMENT,
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      settings: {
        theme: 'clean',
        colorScheme: 'minimal',
        layout: 'catalog',
        features: {
          products: true,
          cart: true,
          payments: true,
          inventory: true,
          reviews: true
        },
        integrations: {
          stripe: true,
          paypal: false,
          shipping: ['fedex', 'ups']
        }
      },
      userId: users[2].id
    },
    {
      name: 'Corporate Website',
      description: 'Professional corporate website with company information, services, and contact forms.',
      type: ProjectType.WEBSITE,
      status: ProjectStatus.PUBLISHED,
      thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      settings: {
        theme: 'corporate',
        colorScheme: 'blue',
        layout: 'multi-page',
        features: {
          about: true,
          services: true,
          team: true,
          contact: true,
          blog: true
        }
      },
      userId: users[3].id
    },
    {
      name: 'Blog Platform',
      description: 'Personal blog platform with content management and social sharing capabilities.',
      type: ProjectType.BLOG,
      status: ProjectStatus.ACTIVE,
      thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68e2c51521?w=800&h=600&fit=crop',
      settings: {
        theme: 'minimal',
        colorScheme: 'neutral',
        layout: 'blog',
        features: {
          comments: true,
          tags: true,
          search: true,
          rss: true,
          social: true
        }
      },
      userId: users[1].id
    }
  ];
  
  for (const projectData of projects) {
    await prisma.project.upsert({
      where: { 
        name_userId: {
          name: projectData.name,
          userId: projectData.userId
        }
      },
      update: {},
      create: {
        ...projectData,
        slug: projectData.name.toLowerCase().replace(/\s+/g, '-'),
        metadata: {
          createdWith: 'Zoptal',
          version: '1.0.0',
          lastModified: new Date().toISOString()
        }
      }
    });
  }
  
  console.log(`✅ Created ${projects.length} projects`);
}
EOF
    
    # Billing seed data
    cat > "${PROJECT_ROOT}/packages/database/seeds/billing.ts" << 'EOF'
import { PrismaClient, SubscriptionStatus, PlanType } from '@prisma/client';

export async function seedBilling(prisma: PrismaClient) {
  console.log('💳 Seeding billing data...');
  
  // Get users for subscriptions
  const users = await prisma.user.findMany({
    where: { role: 'USER' }
  });
  
  if (users.length === 0) {
    console.log('⚠️  No users found, skipping billing seeding');
    return;
  }
  
  // Create subscription plans
  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      interval: 'MONTHLY' as const,
      features: {
        projects: 3,
        storage: '1GB',
        bandwidth: '10GB',
        customDomain: false,
        analytics: false,
        support: 'community'
      },
      limits: {
        projects: 3,
        storage: 1024 * 1024 * 1024, // 1GB in bytes
        bandwidth: 10 * 1024 * 1024 * 1024, // 10GB in bytes
        apiCalls: 1000
      }
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Great for small projects',
      price: 990, // $9.90 in cents
      interval: 'MONTHLY' as const,
      features: {
        projects: 10,
        storage: '10GB',
        bandwidth: '100GB',
        customDomain: true,
        analytics: true,
        support: 'email'
      },
      limits: {
        projects: 10,
        storage: 10 * 1024 * 1024 * 1024, // 10GB
        bandwidth: 100 * 1024 * 1024 * 1024, // 100GB
        apiCalls: 10000
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Perfect for growing businesses',
      price: 2990, // $29.90 in cents
      interval: 'MONTHLY' as const,
      features: {
        projects: 50,
        storage: '100GB',
        bandwidth: '1TB',
        customDomain: true,
        analytics: true,
        support: 'priority'
      },
      limits: {
        projects: 50,
        storage: 100 * 1024 * 1024 * 1024, // 100GB
        bandwidth: 1024 * 1024 * 1024 * 1024, // 1TB
        apiCalls: 100000
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 9990, // $99.90 in cents
      interval: 'MONTHLY' as const,
      features: {
        projects: 999,
        storage: 'Unlimited',
        bandwidth: 'Unlimited',
        customDomain: true,
        analytics: true,
        support: 'dedicated'
      },
      limits: {
        projects: 999,
        storage: -1, // Unlimited
        bandwidth: -1, // Unlimited
        apiCalls: -1 // Unlimited
      }
    }
  ];
  
  for (const planData of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: planData.id },
      update: {},
      create: planData
    });
  }
  
  // Create subscriptions for users
  const subscriptions = [
    {
      userId: users[0].id,
      planId: 'free',
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    {
      userId: users[1].id,
      planId: 'starter',
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: 'sub_1234567890',
      stripeCustomerId: 'cus_1234567890',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      userId: users[2].id,
      planId: 'professional',
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: 'sub_0987654321',
      stripeCustomerId: 'cus_0987654321',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  ];
  
  for (const subData of subscriptions) {
    await prisma.subscription.upsert({
      where: { userId: subData.userId },
      update: {},
      create: subData
    });
  }
  
  // Create some billing history
  const invoices = [
    {
      userId: users[1].id,
      subscriptionId: users[1].id, // This would be the actual subscription ID
      amount: 990,
      currency: 'USD',
      status: 'PAID' as const,
      stripeInvoiceId: 'in_1234567890',
      description: 'Starter Plan - Monthly',
      paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      metadata: {
        period: '2024-01-01 to 2024-02-01',
        plan: 'starter'
      }
    },
    {
      userId: users[2].id,
      subscriptionId: users[2].id,
      amount: 2990,
      currency: 'USD',
      status: 'PAID' as const,
      stripeInvoiceId: 'in_0987654321',
      description: 'Professional Plan - Monthly',
      paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      metadata: {
        period: '2024-01-15 to 2024-02-15',
        plan: 'professional'
      }
    }
  ];
  
  for (const invoiceData of invoices) {
    await prisma.invoice.create({
      data: invoiceData
    });
  }
  
  console.log(`✅ Created ${plans.length} plans, ${subscriptions.length} subscriptions, and ${invoices.length} invoices`);
}
EOF
    
    # Analytics seed data
    cat > "${PROJECT_ROOT}/packages/database/seeds/analytics.ts" << 'EOF'
import { PrismaClient } from '@prisma/client';

export async function seedAnalytics(prisma: PrismaClient) {
  console.log('📊 Seeding analytics data...');
  
  // Get projects for analytics
  const projects = await prisma.project.findMany({
    include: { user: true }
  });
  
  if (projects.length === 0) {
    console.log('⚠️  No projects found, skipping analytics seeding');
    return;
  }
  
  // Generate analytics data for the last 30 days
  const events = [];
  const pageViews = [];
  const sessions = [];
  
  for (const project of projects) {
    // Generate events for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dailyEvents = Math.floor(Math.random() * 100) + 10; // 10-110 events per day
      
      for (let j = 0; j < dailyEvents; j++) {
        const eventTypes = ['page_view', 'button_click', 'form_submit', 'download', 'contact'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        events.push({
          projectId: project.id,
          type: eventType,
          data: {
            page: eventType === 'page_view' ? ['/', '/about', '/contact', '/services'][Math.floor(Math.random() * 4)] : undefined,
            element: eventType === 'button_click' ? 'cta-button' : undefined,
            form: eventType === 'form_submit' ? 'contact-form' : undefined
          },
          metadata: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            referrer: Math.random() > 0.5 ? 'https://google.com' : 'https://twitter.com'
          },
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        });
      }
      
      // Generate page views
      const dailyPageViews = Math.floor(Math.random() * 50) + 5;
      pageViews.push({
        projectId: project.id,
        path: '/',
        views: dailyPageViews,
        uniqueViews: Math.floor(dailyPageViews * 0.8),
        bounceRate: Math.random() * 0.5 + 0.2, // 20-70%
        avgTimeOnPage: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
        date: date
      });
      
      // Generate sessions
      const dailySessions = Math.floor(Math.random() * 30) + 5;
      sessions.push({
        projectId: project.id,
        sessions: dailySessions,
        avgDuration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
        bounceRate: Math.random() * 0.5 + 0.2,
        date: date
      });
    }
  }
  
  // Batch insert events (in chunks to avoid memory issues)
  const chunkSize = 1000;
  for (let i = 0; i < events.length; i += chunkSize) {
    const chunk = events.slice(i, i + chunkSize);
    await prisma.analyticsEvent.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }
  
  // Insert page views
  for (const pageView of pageViews) {
    await prisma.pageView.upsert({
      where: {
        projectId_path_date: {
          projectId: pageView.projectId,
          path: pageView.path,
          date: pageView.date
        }
      },
      update: {},
      create: pageView
    });
  }
  
  // Insert sessions
  for (const session of sessions) {
    await prisma.sessionMetrics.upsert({
      where: {
        projectId_date: {
          projectId: session.projectId,
          date: session.date
        }
      },
      update: {},
      create: session
    });
  }
  
  console.log(`✅ Created ${events.length} events, ${pageViews.length} page view records, and ${sessions.length} session records`);
}
EOF
    
    log_success "Seed data files created"
}

# Run database seeding
seed_database() {
    local env="${1:-dev}"
    local data_type="${2:-all}"
    local force="${3:-false}"
    
    log_info "Seeding $data_type data for $env environment..."
    
    # Set database URL based on environment
    local db_url
    if [[ "$env" == "test" ]]; then
        db_url="postgresql://postgres:postgres@localhost:5433/zoptal_test"
    else
        db_url="postgresql://postgres:postgres@localhost:5432/zoptal_dev"
    fi
    
    export DATABASE_URL="$db_url"
    
    cd "${PROJECT_ROOT}/packages/database"
    
    # Check if data already exists (unless force is true)
    if [[ "$force" != "true" ]]; then
        local user_count=$(pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" | tail -n 1 | tr -d ' ')
        if [[ "$user_count" -gt 1 ]]; then
            log_warning "Database already contains data. Use --force to override."
            return 0
        fi
    fi
    
    # Create seed files if they don't exist
    if [[ ! -f "seeds/seed.ts" ]]; then
        create_seed_files
    fi
    
    # Run specific seeding based on data type
    case "$data_type" in
        "users")
            log_info "Seeding users only..."
            pnpm tsx seeds/users.ts
            ;;
        "projects")
            log_info "Seeding projects only..."
            pnpm tsx seeds/projects.ts
            ;;
        "billing")
            log_info "Seeding billing data only..."
            pnpm tsx seeds/billing.ts
            ;;
        "analytics")
            log_info "Seeding analytics data only..."
            pnpm tsx seeds/analytics.ts
            ;;
        "all"|"seed")
            log_info "Seeding all data..."
            pnpm tsx seeds/seed.ts
            ;;
        *)
            log_error "Unknown data type: $data_type"
            return 1
            ;;
    esac
    
    log_success "Database seeding completed for $data_type"
}

# Reset and re-seed database
reset_database() {
    local env="${1:-dev}"
    
    log_info "Resetting and re-seeding database for $env environment..."
    
    # Set database URL based on environment
    local db_url
    if [[ "$env" == "test" ]]; then
        db_url="postgresql://postgres:postgres@localhost:5433/zoptal_test"
    else
        db_url="postgresql://postgres:postgres@localhost:5432/zoptal_dev"
    fi
    
    export DATABASE_URL="$db_url"
    
    cd "${PROJECT_ROOT}/packages/database"
    
    # Reset database
    pnpm prisma migrate reset --force --skip-seed
    
    # Re-seed with sample data
    seed_database "$env" "all" "true"
    
    log_success "Database reset and re-seeded"
}

# Clean all seeded data
clean_database() {
    local env="${1:-dev}"
    
    log_info "Cleaning seeded data from $env environment..."
    
    # Set database URL based on environment
    local db_url
    if [[ "$env" == "test" ]]; then
        db_url="postgresql://postgres:postgres@localhost:5433/zoptal_test"
    else
        db_url="postgresql://postgres:postgres@localhost:5432/zoptal_dev"
    fi
    
    export DATABASE_URL="$db_url"
    
    cd "${PROJECT_ROOT}/packages/database"
    
    # Delete data in reverse dependency order
    pnpm prisma db execute --stdin <<< "
    DELETE FROM \"AnalyticsEvent\";
    DELETE FROM \"PageView\";
    DELETE FROM \"SessionMetrics\";
    DELETE FROM \"Invoice\";
    DELETE FROM \"Subscription\";
    DELETE FROM \"SubscriptionPlan\";
    DELETE FROM \"Project\";
    DELETE FROM \"User\" WHERE email NOT LIKE '%@zoptal.com';
    "
    
    log_success "Seeded data cleaned"
}

# Main execution
main() {
    local env="dev"
    local verbose=false
    local force=false
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                env="$2"
                shift 2
                ;;
            --verbose)
                verbose=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                break
                ;;
        esac
    done
    
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    local data_type="${2:-all}"
    
    # Enable verbose output if requested
    if [[ "$verbose" == "true" ]]; then
        set -x
    fi
    
    case "$command" in
        "seed")
            seed_database "$env" "$data_type" "$force"
            ;;
        "reset")
            reset_database "$env"
            ;;
        "users"|"projects"|"billing"|"analytics")
            seed_database "$env" "$command" "$force"
            ;;
        "all")
            seed_database "$env" "all" "$force"
            ;;
        "clean")
            clean_database "$env"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_error "Operation interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"