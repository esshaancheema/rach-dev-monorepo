export interface ServiceBenefit {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface ServiceFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface ServicePackage {
  name: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: {
    text: string;
    href: string;
  };
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export interface ServiceTestimonial {
  name: string;
  title: string;
  company: string;
  content: string;
  avatar: string;
  results: Array<{
    metric: string;
    value: string;
  }>;
}

export interface TechnologyStack {
  category: string;
  technologies: Array<{
    name: string;
    logo: string;
    description: string;
  }>;
}

export interface ServiceFAQItem {
  question: string;
  answer: string;
}

export interface ServicePageData {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  benefits: ServiceBenefit[];
  features: ServiceFeature[];
  packages: ServicePackage[];
  process: ProcessStep[];
  testimonials: ServiceTestimonial[];
  techStack: TechnologyStack[];
  faq: ServiceFAQItem[];
  relatedServices: string[];
}