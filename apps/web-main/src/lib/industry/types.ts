export interface IndustryData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  challenges: string[];
  solutions: Array<{
    name: string;
    description: string;
    benefits: string[];
    technologies: string[];
  }>;
  caseStudies: Array<{
    title: string;
    company: string;
    challenge: string;
    solution: string;
    results: string[];
    testimonial?: {
      quote: string;
      author: string;
      position: string;
    };
  }>;
  compliance: Array<{
    standard: string;
    description: string;
  }>;
  trends: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface IndustryPageData extends IndustryData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  services: {
    title: string;
    description: string;
    featured: Array<{
      name: string;
      description: string;
      icon: string;
      features: string[];
      pricing: {
        starting: string;
        typical: string;
      };
    }>;
  };
  whyChooseUs: {
    title: string;
    reasons: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  cta: {
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
  };
}