import { HelpCategory, HelpArticle, FAQ } from './types';

export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Everything you need to know to begin your project with Zoptal',
    icon: '🚀',
    color: 'bg-green-500',
    order: 1,
    articleCount: 8
  },
  {
    id: 'development-process',
    slug: 'development-process',
    name: 'Development Process',
    description: 'Understanding our methodology, timelines, and workflows',
    icon: '⚙️',
    color: 'bg-blue-500',
    order: 2,
    articleCount: 12
  },
  {
    id: 'pricing-billing',
    slug: 'pricing-billing',
    name: 'Pricing & Billing',
    description: 'Pricing models, payment terms, and billing information',
    icon: '💰',
    color: 'bg-yellow-500',
    order: 3,
    articleCount: 6
  },
  {
    id: 'technical-support',
    slug: 'technical-support',
    name: 'Technical Support',
    description: 'Technical documentation, troubleshooting, and maintenance',
    icon: '🔧',
    color: 'bg-red-500',
    order: 4,
    articleCount: 15
  },
  {
    id: 'project-management',
    slug: 'project-management',
    name: 'Project Management',
    description: 'Communication, collaboration, and project delivery',
    icon: '📋',
    color: 'bg-purple-500',
    order: 5,
    articleCount: 10
  },
  {
    id: 'account-management',
    slug: 'account-management',
    name: 'Account Management',
    description: 'Managing your account, team access, and settings',
    icon: '👥',
    color: 'bg-indigo-500',
    order: 6,
    articleCount: 7
  }
];

export const helpArticles: HelpArticle[] = [
  {
    id: 'how-to-get-started',
    slug: 'how-to-get-started',
    title: 'How to Get Started with Your Software Development Project',
    excerpt: 'A comprehensive guide to starting your software development journey with Zoptal, from initial consultation to project kickoff.',
    content: `# How to Get Started with Your Software Development Project

Starting a software development project can seem overwhelming, but with the right approach, it becomes a smooth and exciting journey. This guide will walk you through every step of getting started with Zoptal.

## 1. Initial Consultation

Your journey begins with a **free consultation** where we:

### Discovery Session
- Understand your business goals and challenges
- Discuss your vision and requirements
- Identify target users and use cases
- Review any existing systems or constraints

### Technical Assessment
- Evaluate your current technology stack
- Identify integration requirements
- Assess scalability needs
- Determine security and compliance requirements

### Timeline & Budget Discussion
- Establish realistic project timelines
- Discuss budget parameters
- Identify key milestones and deliverables
- Plan resource allocation

## 2. Project Proposal

After our consultation, you'll receive a detailed proposal including:

### Scope of Work
- Detailed feature specifications
- Technical architecture overview
- User experience wireframes
- Integration requirements

### Timeline & Milestones
- Phase-by-phase delivery schedule
- Key milestone dates
- Testing and review periods
- Launch timeline

### Investment & Terms
- Transparent pricing breakdown
- Payment schedule
- Terms and conditions
- Support and maintenance options

## 3. Project Kickoff

Once you approve the proposal, we'll schedule a kickoff meeting to:

### Team Introductions
- Meet your dedicated development team
- Understand roles and responsibilities
- Establish communication protocols
- Set up project management tools

### Requirements Finalization
- Deep dive into technical specifications
- Finalize user stories and acceptance criteria
- Confirm design preferences
- Establish testing requirements

### Setup & Access
- Provide access to project management tools
- Set up communication channels (Slack, email)
- Configure development environments
- Establish version control and documentation

## 4. What to Expect Next

### Week 1-2: Planning & Design
- Detailed technical architecture
- UI/UX design mockups
- Database schema design
- API specifications

### Week 3+: Development Begins
- Regular sprint demos (every 2 weeks)
- Continuous communication and updates
- Iterative feedback and improvements
- Transparent progress tracking

## 5. How to Prepare

### Before Our Consultation
- [ ] Gather any existing documentation
- [ ] Prepare a list of your requirements
- [ ] Identify key stakeholders
- [ ] Consider your budget range
- [ ] Think about your ideal timeline

### Information to Collect
- Business goals and objectives
- Target user demographics
- Existing systems and integrations
- Compliance requirements
- Performance expectations

## Need Help Getting Started?

Our team is here to guide you through every step. Don't hesitate to reach out with questions or concerns.

**Contact Options:**
- 📧 Email: hello@zoptal.com
- 📞 Phone: +1 (555) 123-4567
- 💬 Live Chat: Available on our website
- 📅 Schedule a call: [Book a consultation](https://zoptal.com/contact)

Ready to transform your ideas into reality? Let's get started!`,
    categoryId: 'getting-started',
    tags: ['consultation', 'project kickoff', 'planning', 'requirements'],
    author: {
      name: 'Sarah Johnson',
      avatar: '/images/team/sarah.jpg',
      role: 'Project Manager'
    },
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    featured: true,
    difficulty: 'beginner',
    estimatedReadTime: '8 min',
    views: 2847,
    helpful: 156,
    notHelpful: 12,
    relatedArticles: ['choosing-the-right-technology', 'project-planning-guide', 'understanding-development-process'],
    seo: {
      title: 'How to Get Started with Software Development | Zoptal Help Center',
      description: 'Complete guide to starting your software development project with Zoptal. Learn about consultation, planning, and kickoff process.',
      keywords: ['software development', 'getting started', 'project planning', 'consultation', 'kickoff']
    }
  },
  {
    id: 'understanding-development-process',
    slug: 'understanding-development-process',
    title: 'Understanding Our Development Process',
    excerpt: 'Learn about our agile development methodology, sprint cycles, and how we ensure quality delivery throughout your project.',
    content: `# Understanding Our Development Process

At Zoptal, we follow a proven agile development methodology that ensures high-quality deliveries, transparent communication, and flexibility to adapt to changing requirements.

## Our Agile Methodology

### Sprint-Based Development
We organize work into **2-week sprints**, allowing for:
- Regular delivery of working features
- Continuous feedback and iteration
- Flexibility to adjust priorities
- Transparent progress tracking

### Scrum Framework
Our process includes:
- **Sprint Planning** - Define work for the upcoming sprint
- **Daily Standups** - Quick team sync meetings
- **Sprint Reviews** - Demo completed features
- **Retrospectives** - Continuous process improvement

## Development Phases

### Phase 1: Discovery & Planning (1-2 weeks)
- Requirements gathering and analysis
- Technical architecture design
- User experience planning
- Risk assessment and mitigation

### Phase 2: Design & Prototyping (2-3 weeks)
- UI/UX design creation
- Interactive prototypes
- User testing and feedback
- Design system establishment

### Phase 3: Development (4-16+ weeks)
- Feature development in 2-week sprints
- Continuous integration and deployment
- Regular testing and quality assurance
- Client demos and feedback sessions

### Phase 4: Testing & Launch (1-2 weeks)
- Comprehensive testing (unit, integration, UAT)
- Performance optimization
- Security audits
- Production deployment

### Phase 5: Support & Maintenance (Ongoing)
- Bug fixes and issues resolution
- Performance monitoring
- Feature enhancements
- Regular security updates

## Quality Assurance

### Code Quality
- Peer code reviews for all changes
- Automated testing (unit, integration, e2e)
- Code quality tools and linting
- Documentation requirements

### Testing Strategy
- **Unit Tests** - Individual component testing
- **Integration Tests** - System interaction testing
- **End-to-End Tests** - Full user flow testing
- **Performance Tests** - Load and stress testing
- **Security Tests** - Vulnerability scanning

## Communication & Transparency

### Regular Updates
- Weekly progress reports
- Sprint demo sessions
- Monthly stakeholder meetings
- Real-time project dashboard access

### Tools We Use
- **Project Management** - Jira, Asana, or Linear
- **Communication** - Slack, Microsoft Teams
- **Documentation** - Confluence, Notion
- **Code Repository** - GitHub, GitLab, or Bitbucket

## Your Role in the Process

### As a Client, You'll:
- Participate in sprint planning sessions
- Provide feedback during demo sessions
- Review and approve major deliverables
- Test features in staging environments
- Communicate requirements changes promptly

### What We Need From You:
- Timely feedback on deliverables
- Access to necessary systems and data
- Availability for key meetings and decisions
- Clear communication of business priorities

## Handling Changes

### Change Management Process
1. **Change Request** - Document the requested change
2. **Impact Assessment** - Evaluate time, cost, and scope impact
3. **Approval Process** - Client approval for significant changes
4. **Implementation** - Incorporate approved changes into sprints

### Types of Changes
- **Minor Changes** - Small adjustments within current sprint
- **Major Changes** - Significant scope or feature changes
- **Emergency Changes** - Critical bug fixes or security issues

## Success Metrics

We track project success through:
- **Velocity** - Team delivery speed
- **Quality** - Bug rates and code coverage
- **Client Satisfaction** - Regular feedback scores
- **Timeline Adherence** - Milestone achievement
- **Budget Performance** - Cost vs. estimate tracking

## Questions About Our Process?

Understanding our development process helps ensure project success. If you have questions about any aspect of our methodology, don't hesitate to ask.

**Get in Touch:**
- 📧 Email: development@zoptal.com
- 📞 Phone: +1 (555) 123-4567
- 💬 Live Chat: Available during business hours`,
    categoryId: 'development-process',
    tags: ['agile', 'scrum', 'methodology', 'sprints', 'quality assurance'],
    author: {
      name: 'David Chen',
      avatar: '/images/team/david.jpg',
      role: 'Lead Developer'
    },
    publishedAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:45:00Z',
    featured: true,
    difficulty: 'intermediate',
    estimatedReadTime: '12 min',
    views: 1923,
    helpful: 142,
    notHelpful: 8,
    relatedArticles: ['project-planning-guide', 'quality-assurance-process', 'communication-best-practices'],
    seo: {
      title: 'Software Development Process | Agile Methodology | Zoptal',
      description: 'Learn about Zoptal\'s agile development process, sprint cycles, quality assurance, and how we deliver successful software projects.',
      keywords: ['agile development', 'scrum methodology', 'software development process', 'sprint planning', 'quality assurance']
    }
  },
  {
    id: 'pricing-models-explained',
    slug: 'pricing-models-explained',
    title: 'Pricing Models Explained',
    excerpt: 'Understand our different pricing models - fixed price, time & materials, and dedicated team - to choose what works best for your project.',
    content: `# Pricing Models Explained

Choosing the right pricing model is crucial for project success. At Zoptal, we offer flexible pricing options to match different project types, requirements, and business needs.

## Fixed Price Model

### Best For:
- Well-defined projects with clear requirements
- Fixed scope and timeline projects
- Clients who prefer predictable costs
- Compliance or regulatory projects

### How It Works:
- Detailed requirements analysis upfront
- Fixed scope, timeline, and price
- Structured milestone payments
- Change requests handled separately

### Benefits:
✅ **Predictable Budget** - Know exact costs upfront
✅ **Clear Scope** - Well-defined deliverables
✅ **Risk Management** - We assume delivery risk
✅ **Easy Planning** - Fixed timeline and milestones

### Considerations:
⚠️ **Limited Flexibility** - Changes may incur additional costs
⚠️ **Detailed Planning Required** - Extensive upfront requirements gathering
⚠️ **Change Management** - Formal process for scope changes

### Pricing Range:
- **Small Projects**: $5,000 - $25,000
- **Medium Projects**: $25,000 - $100,000
- **Large Projects**: $100,000 - $500,000+

## Time & Materials Model

### Best For:
- Projects with evolving requirements
- Research and development projects
- Long-term partnerships
- Complex or innovative solutions

### How It Works:
- Hourly or daily rates for team members
- Monthly invoicing based on actual time
- Flexible scope and timeline
- Regular reporting and transparency

### Benefits:
✅ **Maximum Flexibility** - Adapt to changing requirements
✅ **Faster Start** - Begin with minimal upfront planning
✅ **Optimized Resources** - Scale team up or down as needed
✅ **Continuous Improvement** - Iterate based on learnings

### Considerations:
⚠️ **Variable Costs** - Total cost depends on actual time spent
⚠️ **Budget Management** - Requires ongoing cost monitoring
⚠️ **Scope Creep** - Need discipline to manage scope

### Hourly Rates:
- **Junior Developer**: $75 - $100/hour
- **Senior Developer**: $100 - $150/hour
- **Lead Developer**: $150 - $200/hour
- **Technical Architect**: $200 - $250/hour
- **UI/UX Designer**: $90 - $130/hour
- **Project Manager**: $80 - $120/hour

## Dedicated Team Model

### Best For:
- Long-term projects (6+ months)
- Product development
- Ongoing maintenance and enhancement
- Companies needing extended team augmentation

### How It Works:
- Dedicated team members assigned exclusively
- Monthly retainer for team availability
- Direct team integration with your processes
- Long-term partnership approach

### Benefits:
✅ **Team Continuity** - Same team throughout project
✅ **Deep Understanding** - Team learns your business intimately
✅ **Cost Effective** - Lower rates for long-term commitment
✅ **Full Control** - Direct team management and direction

### Considerations:
⚠️ **Long-term Commitment** - Typically 6+ month contracts
⚠️ **Team Management** - Requires active team leadership
⚠️ **Minimum Team Size** - Usually 3+ team members

### Monthly Team Costs:
- **Small Team** (3-4 people): $25,000 - $35,000/month
- **Medium Team** (5-7 people): $40,000 - $60,000/month
- **Large Team** (8+ people): $65,000 - $100,000+/month

## Hybrid Models

### Fixed Price + T&M
- Core features at fixed price
- Additional features on T&M basis
- Best of both worlds approach

### Phased Fixed Price
- Multiple fixed-price phases
- Flexibility between phases
- Reduced risk for both parties

## Choosing the Right Model

### Consider These Factors:

**Project Clarity**
- Clear requirements → Fixed Price
- Evolving requirements → Time & Materials
- Long-term vision → Dedicated Team

**Budget Preferences**
- Fixed budget → Fixed Price
- Flexible budget → Time & Materials
- Ongoing investment → Dedicated Team

**Timeline**
- Fixed deadline → Fixed Price
- Flexible timeline → Time & Materials
- Ongoing development → Dedicated Team

**Risk Tolerance**
- Low risk tolerance → Fixed Price
- Medium risk tolerance → Time & Materials
- High collaboration → Dedicated Team

## Payment Terms

### Standard Terms:
- **Fixed Price**: 30% upfront, 40% at milestones, 30% on completion
- **Time & Materials**: Monthly invoicing, Net 15 terms
- **Dedicated Team**: Monthly advance payment

### Payment Methods:
- Bank transfer (ACH/Wire)
- Credit card (with processing fee)
- Invoice financing options available

## Frequently Asked Questions

**Q: Can we switch pricing models during the project?**
A: Yes, we can transition between models at natural breakpoints with proper agreement.

**Q: Are there any hidden costs?**
A: No, we provide transparent pricing with all costs outlined upfront.

**Q: Do you offer discounts for long-term projects?**
A: Yes, we offer volume discounts for projects over $100,000 and long-term partnerships.

**Q: What happens if the project takes longer than estimated?**
A: In Fixed Price model, we absorb overruns. In T&M model, you only pay for actual time spent.

## Get a Custom Quote

Every project is unique. Contact us for a personalized pricing proposal:

📧 **Email**: pricing@zoptal.com
📞 **Phone**: +1 (555) 123-4567
📅 **Schedule**: [Book a consultation](https://zoptal.com/contact)

Our pricing specialists will help you choose the best model for your specific needs and provide detailed cost estimates.`,
    categoryId: 'pricing-billing',
    tags: ['pricing', 'fixed price', 'time and materials', 'dedicated team', 'billing'],
    author: {
      name: 'Michael Rodriguez',
      avatar: '/images/team/michael.jpg',
      role: 'Business Development Manager'
    },
    publishedAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
    featured: true,
    difficulty: 'beginner',
    estimatedReadTime: '10 min',
    views: 3421,
    helpful: 198,
    notHelpful: 15,
    relatedArticles: ['payment-terms-conditions', 'project-budgeting-guide', 'cost-estimation-process'],
    seo: {
      title: 'Software Development Pricing Models | Fixed Price vs Time & Materials | Zoptal',
      description: 'Compare different software development pricing models: fixed price, time & materials, and dedicated team. Choose the best option for your project.',
      keywords: ['software development pricing', 'fixed price model', 'time and materials', 'dedicated team', 'development costs']
    }
  }
];

export const faqs: FAQ[] = [
  {
    id: 'how-long-does-development-take',
    question: 'How long does software development typically take?',
    answer: 'Development timelines vary based on project complexity:\n\n• Simple websites/apps: 4-8 weeks\n• Business applications: 8-16 weeks\n• Complex platforms: 16-32 weeks\n• Enterprise solutions: 6-12+ months\n\nWe provide detailed timeline estimates during our initial consultation based on your specific requirements.',
    categoryId: 'getting-started',
    tags: ['timeline', 'development time', 'project duration'],
    helpful: 89,
    notHelpful: 3,
    featured: true,
    order: 1,
    relatedArticles: ['understanding-development-process', 'project-planning-guide'],
    lastUpdated: '2024-01-20T12:00:00Z'
  },
  {
    id: 'what-technologies-do-you-use',
    question: 'What technologies and programming languages do you use?',
    answer: 'We work with modern, industry-standard technologies:\n\n**Frontend:** React, Vue.js, Angular, Next.js, TypeScript\n**Backend:** Node.js, Python, Java, C#, PHP, Go\n**Mobile:** React Native, Flutter, Swift, Kotlin\n**Databases:** PostgreSQL, MongoDB, MySQL, Redis\n**Cloud:** AWS, Azure, Google Cloud, Docker, Kubernetes\n**AI/ML:** TensorFlow, PyTorch, OpenAI, Hugging Face\n\nWe choose the best technology stack based on your project requirements, scalability needs, and business goals.',
    categoryId: 'technical-support',
    tags: ['technology stack', 'programming languages', 'frameworks'],
    helpful: 156,
    notHelpful: 8,
    featured: true,
    order: 2,
    relatedArticles: ['choosing-the-right-technology', 'technical-architecture-guide'],
    lastUpdated: '2024-01-18T16:30:00Z'
  },
  {
    id: 'how-much-does-development-cost',
    question: 'How much does software development cost?',
    answer: 'Our pricing depends on project scope, complexity, and chosen model:\n\n**Web Development:** $5,000 - $50,000+\n**Mobile Apps:** $15,000 - $100,000+\n**AI Solutions:** $25,000 - $200,000+\n**Custom Software:** $20,000 - $500,000+\n\nWe offer three pricing models:\n• Fixed Price - For well-defined projects\n• Time & Materials - For flexible, evolving projects\n• Dedicated Team - For long-term partnerships\n\nContact us for a personalized quote based on your specific requirements.',
    categoryId: 'pricing-billing',
    tags: ['pricing', 'cost', 'budget', 'estimates'],
    helpful: 234,
    notHelpful: 12,
    featured: true,
    order: 3,
    relatedArticles: ['pricing-models-explained', 'cost-estimation-process', 'payment-terms-conditions'],
    lastUpdated: '2024-01-22T09:45:00Z'
  },
  {
    id: 'do-you-provide-ongoing-support',
    question: 'Do you provide ongoing support and maintenance?',
    answer: 'Yes! We offer comprehensive post-launch support:\n\n**Included in all projects:**\n• 30-day bug fix warranty\n• Basic technical support\n• Documentation and training\n\n**Optional maintenance plans:**\n• Monthly maintenance retainers\n• 24/7 monitoring and support\n• Regular updates and security patches\n• Feature enhancements and improvements\n• Performance optimization\n\nWe believe in long-term partnerships and are committed to your project\'s continued success.',
    categoryId: 'technical-support',
    tags: ['support', 'maintenance', 'warranty', 'post-launch'],
    helpful: 167,
    notHelpful: 5,
    featured: true,
    order: 4,
    relatedArticles: ['maintenance-plans', 'support-process', 'warranty-terms'],
    lastUpdated: '2024-01-19T14:20:00Z'
  },
  {
    id: 'how-do-we-communicate-during-project',
    question: 'How do we communicate and track progress during the project?',
    answer: 'We prioritize transparent communication throughout your project:\n\n**Communication Channels:**\n• Dedicated Slack channel or Microsoft Teams\n• Weekly progress calls\n• Bi-weekly sprint demos\n• Monthly stakeholder meetings\n\n**Project Tracking:**\n• Real-time project dashboard access\n• Jira/Asana for task management\n• GitHub/GitLab for code repository\n• Shared documentation space\n\n**Regular Updates:**\n• Daily development updates\n• Weekly progress reports\n• Sprint completion summaries\n• Milestone achievement notifications\n\nYou\'ll always know exactly where your project stands.',
    categoryId: 'project-management',
    tags: ['communication', 'project tracking', 'updates', 'transparency'],
    helpful: 143,
    notHelpful: 7,
    featured: true,
    order: 5,
    relatedArticles: ['communication-best-practices', 'project-management-tools', 'client-collaboration'],
    lastUpdated: '2024-01-21T11:10:00Z'
  }
];

// Helper functions
export function getHelpCategoryBySlug(slug: string): HelpCategory | undefined {
  return helpCategories.find(category => category.slug === slug);
}

export function getHelpArticleBySlug(slug: string): HelpArticle | undefined {
  return helpArticles.find(article => article.slug === slug);
}

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return helpArticles.filter(article => article.categoryId === categoryId);
}

export function getFeaturedArticles(): HelpArticle[] {
  return helpArticles.filter(article => article.featured);
}

export function getFAQsByCategory(categoryId: string): FAQ[] {
  return faqs.filter(faq => faq.categoryId === categoryId);
}

export function getFeaturedFAQs(): FAQ[] {
  return faqs.filter(faq => faq.featured).sort((a, b) => a.order - b.order);
}

export function searchHelpContent(query: string): any[] {
  const searchTerms = query.toLowerCase().split(' ');
  const results: any[] = [];

  // Search articles
  helpArticles.forEach(article => {
    let relevanceScore = 0;
    const matchedTerms: string[] = [];

    searchTerms.forEach(term => {
      if (article.title.toLowerCase().includes(term)) {
        relevanceScore += 10;
        matchedTerms.push(term);
      }
      if (article.excerpt.toLowerCase().includes(term)) {
        relevanceScore += 5;
        matchedTerms.push(term);
      }
      if (article.content.toLowerCase().includes(term)) {
        relevanceScore += 3;
        matchedTerms.push(term);
      }
      if (article.tags.some(tag => tag.toLowerCase().includes(term))) {
        relevanceScore += 7;
        matchedTerms.push(term);
      }
    });

    if (relevanceScore > 0) {
      const category = helpCategories.find(cat => cat.id === article.categoryId);
      results.push({
        type: 'article',
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        url: `/help/articles/${article.slug}`,
        category: category?.name || 'Unknown',
        relevanceScore,
        matchedTerms: [...new Set(matchedTerms)]
      });
    }
  });

  // Search FAQs
  faqs.forEach(faq => {
    let relevanceScore = 0;
    const matchedTerms: string[] = [];

    searchTerms.forEach(term => {
      if (faq.question.toLowerCase().includes(term)) {
        relevanceScore += 10;
        matchedTerms.push(term);
      }
      if (faq.answer.toLowerCase().includes(term)) {
        relevanceScore += 5;
        matchedTerms.push(term);
      }
      if (faq.tags.some(tag => tag.toLowerCase().includes(term))) {
        relevanceScore += 7;
        matchedTerms.push(term);
      }
    });

    if (relevanceScore > 0) {
      const category = helpCategories.find(cat => cat.id === faq.categoryId);
      results.push({
        type: 'faq',
        id: faq.id,
        title: faq.question,
        excerpt: faq.answer.substring(0, 150) + '...',
        url: `/help/faq#${faq.id}`,
        category: category?.name || 'Unknown',
        relevanceScore,
        matchedTerms: [...new Set(matchedTerms)]
      });
    }
  });

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}