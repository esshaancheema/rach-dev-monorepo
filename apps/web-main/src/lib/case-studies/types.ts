export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  client: {
    name: string;
    industry: string;
    size: string;
    location: string;
    logo: string;
  };
  project: {
    duration: string;
    teamSize: string;
    budget: string;
    status: 'completed' | 'ongoing' | 'maintenance';
  };
  challenge: string;
  solution: string;
  results: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  technologies: string[];
  services: string[];
  images: {
    hero: string;
    gallery: string[];
    mockups: string[];
  };
  testimonial?: {
    quote: string;
    author: string;
    title: string;
    avatar: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  featured: boolean;
  publishedAt: string;
  category: CaseStudyCategory;
}

export interface CaseStudyCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface CaseStudyFilters {
  category?: string;
  industry?: string;
  service?: string;
  technology?: string;
  featured?: boolean;
}