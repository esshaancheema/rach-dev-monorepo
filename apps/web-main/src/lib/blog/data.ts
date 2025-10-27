import { BlogPost, BlogCategory } from './types';

export const blogCategories: BlogCategory[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Latest insights on artificial intelligence, machine learning, and automation technologies.',
    color: 'blue',
    icon: '🤖',
    postCount: 12
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Modern web development trends, frameworks, and best practices.',
    color: 'green',
    icon: '🌐',
    postCount: 18
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, and cross-platform mobile app development insights.',
    color: 'purple',
    icon: '📱',
    postCount: 8
  },
  {
    id: 'tech-trends',
    name: 'Tech Trends',
    slug: 'tech-trends',
    description: 'Emerging technologies and industry trends shaping the future.',
    color: 'orange',
    icon: '🚀',
    postCount: 15
  },
  {
    id: 'business',
    name: 'Business & Strategy',
    slug: 'business-strategy',
    description: 'Digital transformation, business strategy, and technology adoption.',
    color: 'indigo',
    icon: '💼',
    postCount: 10
  },
  {
    id: 'tutorials',
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step guides and technical tutorials for developers.',
    color: 'teal',
    icon: '📚',
    postCount: 22
  }
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'future-of-ai-in-software-development',
    title: 'The Future of AI in Software Development: Transforming How We Code',
    excerpt: 'Explore how artificial intelligence is revolutionizing software development, from automated code generation to intelligent debugging and testing.',
    content: '', // Content would be loaded from markdown files in a real implementation
    author: {
      name: 'Sarah Chen',
      avatar: '/images/team/sarah-chen.jpg',
      bio: 'Lead AI Engineer with 8+ years of experience in machine learning and software development.',
      social: {
        twitter: 'sarahchen_ai',
        linkedin: 'sarahchen-ai',
        github: 'sarahchen-dev'
      }
    },
    category: blogCategories[0], // AI & ML
    tags: ['Artificial Intelligence', 'Software Development', 'Automation', 'Future Tech'],
    publishedAt: '2024-01-15T10:00:00Z',
    readingTime: 8,
    featuredImage: '/images/blog/ai-software-development.jpg',
    seo: {
      metaTitle: 'Future of AI in Software Development - Complete Guide 2024',
      metaDescription: 'Discover how AI is transforming software development with automated coding, intelligent debugging, and enhanced productivity. Expert insights and predictions.',
      keywords: ['AI software development', 'artificial intelligence programming', 'automated coding', 'AI tools for developers', 'future of programming']
    },
    featured: true,
    status: 'published'
  },
  {
    id: '2',
    slug: 'react-18-new-features-complete-guide',
    title: 'React 18 New Features: A Complete Developer Guide',
    excerpt: 'Deep dive into React 18\'s game-changing features including concurrent rendering, automatic batching, and the new Suspense capabilities.',
    content: '',
    author: {
      name: 'Michael Rodriguez',
      avatar: '/images/team/michael-rodriguez.jpg',
      bio: 'Senior Frontend Developer specializing in React and modern JavaScript frameworks.',
      social: {
        twitter: 'mike_codes',
        linkedin: 'michael-rodriguez-dev',
        github: 'mike-rodriguez'
      }
    },
    category: blogCategories[1], // Web Development
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development', 'React 18'],
    publishedAt: '2024-01-12T14:30:00Z',
    readingTime: 12,
    featuredImage: '/images/blog/react-18-features.jpg',
    seo: {
      metaTitle: 'React 18 New Features Guide - Concurrent Rendering & More',
      metaDescription: 'Complete guide to React 18 features: concurrent rendering, automatic batching, Suspense, and performance improvements. Code examples included.',
      keywords: ['React 18', 'React new features', 'concurrent rendering', 'React Suspense', 'React performance']
    },
    featured: true,
    status: 'published'
  },
  {
    id: '3',
    slug: 'cross-platform-mobile-development-2024',
    title: 'Cross-Platform Mobile Development in 2024: React Native vs Flutter',
    excerpt: 'Comprehensive comparison of React Native and Flutter for cross-platform mobile development, including performance, ecosystem, and use cases.',
    content: '',
    author: {
      name: 'Emily Johnson',
      avatar: '/images/team/emily-johnson.jpg',
      bio: 'Mobile Development Lead with expertise in React Native, Flutter, and native iOS/Android development.',
      social: {
        twitter: 'emily_mobile',
        linkedin: 'emily-johnson-mobile',
        github: 'emily-mobile-dev'
      }
    },
    category: blogCategories[2], // Mobile Development
    tags: ['React Native', 'Flutter', 'Cross-Platform', 'Mobile Development', 'Comparison'],
    publishedAt: '2024-01-10T09:15:00Z',
    readingTime: 10,
    featuredImage: '/images/blog/react-native-vs-flutter.jpg',
    seo: {
      metaTitle: 'React Native vs Flutter 2024 - Complete Comparison Guide',
      metaDescription: 'Detailed comparison of React Native vs Flutter for cross-platform mobile development. Performance, ecosystem, costs, and decision framework.',
      keywords: ['React Native vs Flutter', 'cross-platform mobile development', 'mobile app frameworks', 'Flutter vs React Native 2024']
    },
    featured: false,
    status: 'published'
  },
  {
    id: '4',
    slug: 'web3-blockchain-development-trends',
    title: 'Web3 and Blockchain Development: Trends Shaping the Decentralized Future',
    excerpt: 'Explore the latest trends in Web3 and blockchain development, from DeFi to NFTs and the metaverse, and how they\'re reshaping digital experiences.',
    content: '',
    author: {
      name: 'David Kim',
      avatar: '/images/team/david-kim.jpg',
      bio: 'Blockchain Developer and Web3 enthusiast with experience in smart contracts and decentralized applications.',
      social: {
        twitter: 'david_web3',
        linkedin: 'david-kim-blockchain',
        github: 'david-blockchain'
      }
    },
    category: blogCategories[3], // Tech Trends
    tags: ['Web3', 'Blockchain', 'DeFi', 'NFTs', 'Cryptocurrency', 'Decentralized'],
    publishedAt: '2024-01-08T16:45:00Z',
    readingTime: 15,
    featuredImage: '/images/blog/web3-blockchain-trends.jpg',
    seo: {
      metaTitle: 'Web3 & Blockchain Development Trends 2024 - Complete Guide',
      metaDescription: 'Latest Web3 and blockchain development trends: DeFi, NFTs, metaverse, and decentralized applications. Expert insights and future predictions.',
      keywords: ['Web3 development', 'blockchain trends', 'DeFi development', 'NFT development', 'decentralized applications']
    },
    featured: true,
    status: 'published'
  },
  {
    id: '5',
    slug: 'digital-transformation-small-business',
    title: 'Digital Transformation for Small Businesses: A Practical Roadmap',
    excerpt: 'Step-by-step guide for small businesses to embrace digital transformation, from cloud adoption to automation and customer experience enhancement.',
    content: '',
    author: {
      name: 'Lisa Zhang',
      avatar: '/images/team/lisa-zhang.jpg',
      bio: 'Business Technology Consultant helping companies navigate digital transformation and technology adoption.',
      social: {
        twitter: 'lisa_biztech',
        linkedin: 'lisa-zhang-consultant'
      }
    },
    category: blogCategories[4], // Business & Strategy
    tags: ['Digital Transformation', 'Small Business', 'Cloud Computing', 'Automation', 'Business Strategy'],
    publishedAt: '2024-01-05T11:20:00Z',
    readingTime: 7,
    featuredImage: '/images/blog/digital-transformation-small-business.jpg',
    seo: {
      metaTitle: 'Digital Transformation for Small Business - Complete Roadmap',
      metaDescription: 'Practical digital transformation guide for small businesses. Cloud adoption, automation strategies, and ROI optimization tips.',
      keywords: ['digital transformation small business', 'business automation', 'cloud adoption', 'small business technology']
    },
    featured: false,
    status: 'published'
  },
  {
    id: '6',
    slug: 'typescript-best-practices-2024',
    title: 'TypeScript Best Practices for Large-Scale Applications',
    excerpt: 'Essential TypeScript patterns, configurations, and best practices for building maintainable large-scale applications with better type safety.',
    content: '',
    author: {
      name: 'Alex Thompson',
      avatar: '/images/team/alex-thompson.jpg',
      bio: 'Senior TypeScript Developer and technical writer with expertise in large-scale application architecture.',
      social: {
        twitter: 'alex_typescript',
        linkedin: 'alex-thompson-dev',
        github: 'alex-typescript'
      }
    },
    category: blogCategories[5], // Tutorials
    tags: ['TypeScript', 'JavaScript', 'Best Practices', 'Large Scale', 'Type Safety'],
    publishedAt: '2024-01-03T13:10:00Z',
    readingTime: 11,
    featuredImage: '/images/blog/typescript-best-practices.jpg',
    seo: {
      metaTitle: 'TypeScript Best Practices 2024 - Large-Scale Applications',
      metaDescription: 'Essential TypeScript best practices for large-scale applications. Type safety, patterns, configurations, and maintainable code strategies.',
      keywords: ['TypeScript best practices', 'TypeScript large scale', 'TypeScript patterns', 'type safety', 'TypeScript configuration']
    },
    featured: false,
    status: 'published'
  }
];

export function getBlogPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
} = {}): { posts: BlogPost[]; total: number; hasMore: boolean } {
  let filteredPosts = [...blogPosts];

  // Filter by category
  if (params.category) {
    filteredPosts = filteredPosts.filter(post => 
      post.category.slug === params.category
    );
  }

  // Filter by tag
  if (params.tag) {
    filteredPosts = filteredPosts.filter(post => 
      post.tags.some(tag => tag.toLowerCase().includes(params.tag!.toLowerCase()))
    );
  }

  // Filter by featured
  if (params.featured !== undefined) {
    filteredPosts = filteredPosts.filter(post => post.featured === params.featured);
  }

  // Filter by search
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Sort by publishedAt (newest first)
  filteredPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const page = params.page || 1;
  const limit = params.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    posts: filteredPosts.slice(startIndex, endIndex),
    total: filteredPosts.length,
    hasMore: endIndex < filteredPosts.length
  };
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find(post => post.slug === slug) || null;
}

export function getRelatedPosts(post: BlogPost, limit: number = 3): BlogPost[] {
  return blogPosts
    .filter(p => p.id !== post.id && p.category.id === post.category.id)
    .slice(0, limit);
}

export function getBlogCategories(): BlogCategory[] {
  return blogCategories;
}

export function getBlogCategoryBySlug(slug: string): BlogCategory | null {
  return blogCategories.find(category => category.slug === slug) || null;
}