'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Technology {
  id: string;
  name: string;
  category: 'ai' | 'frontend' | 'backend' | 'database' | 'cloud' | 'mobile' | 'devops';
  logo: string;
  description: string;
  useCases: string[];
  popularity: number; // 1-100
  website?: string;
  featured?: boolean;
}

interface TechStack {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  useCase: string;
  icon: string;
}

interface PoweredBySectionProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'grid' | 'carousel' | 'categories' | 'stacks';
  showCategories?: boolean;
  showUseCases?: boolean;
  maxTechnologies?: number;
  className?: string;
}

const TECH_CATEGORIES = [
  { id: 'all', label: 'All Technologies', icon: '🚀', color: 'bg-gray-100' },
  { id: 'ai', label: 'AI & Machine Learning', icon: '🤖', color: 'bg-purple-100' },
  { id: 'frontend', label: 'Frontend', icon: '💻', color: 'bg-blue-100' },
  { id: 'backend', label: 'Backend', icon: '⚙️', color: 'bg-green-100' },
  { id: 'database', label: 'Databases', icon: '🗄️', color: 'bg-yellow-100' },
  { id: 'cloud', label: 'Cloud & Infrastructure', icon: '☁️', color: 'bg-indigo-100' },
  { id: 'mobile', label: 'Mobile Development', icon: '📱', color: 'bg-pink-100' },
  { id: 'devops', label: 'DevOps & Tools', icon: '🔧', color: 'bg-orange-100' },
];

const TECHNOLOGIES: Technology[] = [
  // AI & Machine Learning
  {
    id: 'openai',
    name: 'OpenAI GPT',
    category: 'ai',
    logo: '/tech/openai.svg',
    description: 'Advanced language models for natural language processing and generation',
    useCases: ['Chatbots', 'Content Generation', 'Code Assistance', 'Data Analysis'],
    popularity: 95,
    website: 'https://openai.com',
    featured: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'ai',
    logo: '/tech/anthropic.svg',
    description: 'Constitutional AI for safe and helpful AI applications',
    useCases: ['Advanced Reasoning', 'Research Assistance', 'Content Creation'],
    popularity: 90,
    website: 'https://anthropic.com',
    featured: true,
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    category: 'ai',
    logo: '/tech/tensorflow.svg',
    description: 'Open-source machine learning framework for training and deployment',
    useCases: ['Deep Learning', 'Computer Vision', 'Predictive Analytics'],
    popularity: 85,
    website: 'https://tensorflow.org',
  },
  {
    id: 'pytorch',
    name: 'PyTorch',
    category: 'ai',
    logo: '/tech/pytorch.svg',
    description: 'Dynamic neural networks and machine learning research platform',
    useCases: ['Research', 'Prototyping', 'Neural Networks'],
    popularity: 82,
    website: 'https://pytorch.org',
  },

  // Frontend Technologies
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    logo: '/tech/react.svg',
    description: 'Popular JavaScript library for building user interfaces',
    useCases: ['Web Applications', 'Single Page Apps', 'Component Libraries'],
    popularity: 95,
    website: 'https://react.dev',
    featured: true,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    logo: '/tech/nextjs.svg',
    description: 'Full-stack React framework with server-side rendering and API routes',
    useCases: ['Full-stack Apps', 'SEO Optimization', 'Static Sites'],
    popularity: 90,
    website: 'https://nextjs.org',
    featured: true,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'frontend',
    logo: '/tech/typescript.svg',
    description: 'Typed superset of JavaScript for better development experience',
    useCases: ['Type Safety', 'Large Applications', 'Team Collaboration'],
    popularity: 88,
    website: 'https://typescriptlang.org',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    logo: '/tech/tailwind.svg',
    description: 'Utility-first CSS framework for rapid UI development',
    useCases: ['Responsive Design', 'Custom UI', 'Design Systems'],
    popularity: 85,
    website: 'https://tailwindcss.com',
  },

  // Backend Technologies
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    logo: '/tech/nodejs.svg',
    description: 'JavaScript runtime for scalable server-side applications',
    useCases: ['API Development', 'Real-time Apps', 'Microservices'],
    popularity: 92,
    website: 'https://nodejs.org',
    featured: true,
  },
  {
    id: 'python',
    name: 'Python',
    category: 'backend',
    logo: '/tech/python.svg',
    description: 'Versatile programming language for web development and AI',
    useCases: ['AI/ML', 'Web APIs', 'Data Processing', 'Automation'],
    popularity: 90,
    website: 'https://python.org',
    featured: true,
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'backend',
    logo: '/tech/fastapi.svg',
    description: 'Modern, fast web framework for building APIs with Python',
    useCases: ['REST APIs', 'Async Processing', 'Documentation'],
    popularity: 85,
    website: 'https://fastapi.tiangolo.com',
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    category: 'backend',
    logo: '/tech/graphql.svg',
    description: 'Query language and runtime for APIs with flexible data fetching',
    useCases: ['API Design', 'Data Aggregation', 'Real-time Updates'],
    popularity: 78,
    website: 'https://graphql.org',
  },

  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    logo: '/tech/postgresql.svg',
    description: 'Advanced open-source relational database with JSON support',
    useCases: ['ACID Transactions', 'Complex Queries', 'Data Integrity'],
    popularity: 88,
    website: 'https://postgresql.org',
    featured: true,
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    logo: '/tech/mongodb.svg',
    description: 'Document-oriented NoSQL database for flexible data models',
    useCases: ['Flexible Schema', 'Rapid Development', 'Scalability'],
    popularity: 82,
    website: 'https://mongodb.com',
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    logo: '/tech/redis.svg',
    description: 'In-memory data structure store for caching and real-time applications',
    useCases: ['Caching', 'Session Storage', 'Real-time Analytics'],
    popularity: 85,
    website: 'https://redis.io',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'database',
    logo: '/tech/supabase.svg',
    description: 'Open-source Firebase alternative with PostgreSQL backend',
    useCases: ['Backend as a Service', 'Real-time Features', 'Authentication'],
    popularity: 80,
    website: 'https://supabase.com',
  },

  // Cloud & Infrastructure
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'cloud',
    logo: '/tech/aws.svg',
    description: 'Comprehensive cloud computing platform with global infrastructure',
    useCases: ['Scalable Hosting', 'AI Services', 'Data Storage'],
    popularity: 95,
    website: 'https://aws.amazon.com',
    featured: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'cloud',
    logo: '/tech/vercel.svg',
    description: 'Platform for frontend frameworks with global edge network',
    useCases: ['Next.js Hosting', 'Static Sites', 'Serverless Functions'],
    popularity: 85,
    website: 'https://vercel.com',
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'cloud',
    logo: '/tech/docker.svg',
    description: 'Containerization platform for consistent deployment environments',
    useCases: ['Container Deployment', 'Development Environment', 'Microservices'],
    popularity: 88,
    website: 'https://docker.com',
  },

  // Mobile Development
  {
    id: 'react-native',
    name: 'React Native',
    category: 'mobile',
    logo: '/tech/react-native.svg',
    description: 'Cross-platform mobile development using React components',
    useCases: ['iOS Apps', 'Android Apps', 'Cross-platform Development'],
    popularity: 85,
    website: 'https://reactnative.dev',
    featured: true,
  },
  {
    id: 'flutter',
    name: 'Flutter',
    category: 'mobile',
    logo: '/tech/flutter.svg',
    description: 'Google\'s UI toolkit for building beautiful, natively compiled applications',
    useCases: ['Mobile Apps', 'Web Apps', 'Desktop Apps'],
    popularity: 80,
    website: 'https://flutter.dev',
  },
  {
    id: 'expo',
    name: 'Expo',
    category: 'mobile',
    logo: '/tech/expo.svg',
    description: 'Platform and set of tools for universal React applications',
    useCases: ['Rapid Prototyping', 'Over-the-air Updates', 'Native Features'],
    popularity: 75,
    website: 'https://expo.dev',
  },
];

const TECH_STACKS: TechStack[] = [
  {
    id: 'full-stack-web',
    name: 'Full-Stack Web Application',
    description: 'Complete web application with modern frontend, robust backend, and scalable database',
    technologies: ['nextjs', 'typescript', 'nodejs', 'postgresql', 'aws'],
    useCase: 'SaaS platforms, enterprise applications, e-commerce sites',
    icon: '🌐',
  },
  {
    id: 'ai-powered-app',
    name: 'AI-Powered Application',
    description: 'Intelligent applications with machine learning and natural language processing',
    technologies: ['openai', 'python', 'fastapi', 'postgresql', 'aws'],
    useCase: 'Chatbots, content generation, data analysis, automation',
    icon: '🤖',
  },
  {
    id: 'mobile-app',
    name: 'Cross-Platform Mobile App',
    description: 'Native mobile experience for iOS and Android with shared codebase',
    technologies: ['react-native', 'expo', 'typescript', 'supabase', 'vercel'],
    useCase: 'Consumer apps, business tools, social platforms',
    icon: '📱',
  },
  {
    id: 'real-time-platform',
    name: 'Real-Time Platform',
    description: 'High-performance applications with live updates and real-time features',
    technologies: ['react', 'nodejs', 'redis', 'mongodb', 'docker'],
    useCase: 'Chat applications, collaboration tools, live dashboards',
    icon: '⚡',
  },
];

function TechnologyCard({ tech, variant = 'default', showUseCases = true }: {
  tech: Technology;
  variant?: 'default' | 'compact' | 'featured';
  showUseCases?: boolean;
}) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm">
          <Image
            src={tech.logo}
            alt={tech.name}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{tech.name}</h4>
          <p className="text-xs text-gray-600 line-clamp-1">{tech.description}</p>
        </div>
        {tech.featured && (
          <Badge variant="primary" size="sm">Featured</Badge>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="primary">Featured</Badge>
          <Badge variant="outline">{TECH_CATEGORIES.find(cat => cat.id === tech.category)?.label}</Badge>
        </div>
        
        <div className="w-16 h-16 bg-white rounded-xl p-3 flex items-center justify-center shadow-md mb-4">
          <Image
            src={tech.logo}
            alt={tech.name}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        
        <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
        <p className="text-gray-600 mb-4">{tech.description}</p>
        
        {showUseCases && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Use Cases:</h4>
            <div className="flex flex-wrap gap-1">
              {tech.useCases.map((useCase, index) => (
                <Badge key={index} variant="outline" size="sm">{useCase}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Popularity:</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${tech.popularity}%` }}
              />
            </div>
            <span className="text-sm font-medium">{tech.popularity}%</span>
          </div>
          {tech.website && (
            <a href={tech.website} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </a>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow group">
      <div className="w-12 h-12 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-shadow">
        <Image
          src={tech.logo}
          alt={tech.name}
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      
      <h3 className="font-semibold mb-2">{tech.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tech.description}</p>
      
      {showUseCases && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tech.useCases.slice(0, 2).map((useCase, index) => (
            <Badge key={index} variant="outline" size="sm">{useCase}</Badge>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${tech.popularity}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{tech.popularity}%</span>
        </div>
        {tech.featured && (
          <Badge variant="success" size="sm">⭐</Badge>
        )}
      </div>
    </Card>
  );
}

function TechStackCard({ stack }: { stack: TechStack }) {
  const stackTechnologies = TECHNOLOGIES.filter(tech => 
    stack.technologies.includes(tech.id)
  );

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
          {stack.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold">{stack.name}</h3>
          <p className="text-sm text-gray-600">{stack.description}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Technologies:</h4>
        <div className="flex flex-wrap gap-2">
          {stackTechnologies.map((tech) => (
            <div key={tech.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <Image
                src={tech.logo}
                alt={tech.name}
                width={16}
                height={16}
                className="object-contain"
              />
              <span className="text-xs font-medium">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <strong>Perfect for:</strong> {stack.useCase}
      </div>
    </Card>
  );
}

export function PoweredBySection({
  title = 'Powered by Modern Technology',
  subtitle = 'We use the latest and most reliable technologies to build scalable, performant, and secure applications.',
  variant = 'default',
  showCategories = true,
  showUseCases = true,
  maxTechnologies,
  className,
}: PoweredBySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  const filteredTechnologies = selectedCategory === 'all' 
    ? TECHNOLOGIES 
    : TECHNOLOGIES.filter(tech => tech.category === selectedCategory);

  const displayTechnologies = maxTechnologies 
    ? filteredTechnologies.slice(0, maxTechnologies)
    : filteredTechnologies;

  const featuredTechnologies = TECHNOLOGIES.filter(tech => tech.featured);

  // Auto-rotate carousel
  useEffect(() => {
    if (variant === 'carousel') {
      const interval = setInterval(() => {
        setCurrentSlide(current => 
          current >= Math.ceil(displayTechnologies.length / 6) - 1 ? 0 : current + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [variant, displayTechnologies.length]);

  if (variant === 'stacks') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {TECH_STACKS.map((stack) => (
                <TechStackCard key={stack.id} stack={stack} />
              ))}
            </div>
            
            <div className="text-center bg-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Need a Custom Stack?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We can recommend and implement the perfect technology combination for your specific requirements and constraints.
              </p>
              <Button size="lg">
                Get Technology Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'carousel') {
    const slidesCount = Math.ceil(displayTechnologies.length / 6);
    
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: slidesCount }).map((__, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {displayTechnologies
                        .slice(slideIndex * 6, (slideIndex + 1) * 6)
                        .map((tech) => (
                          <TechnologyCard
                            key={tech.id}
                            tech={tech}
                            variant="compact"
                            showUseCases={false}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: slidesCount }).map((__, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'categories') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TECH_CATEGORIES.slice(1).map((category) => {
                const categoryTechs = TECHNOLOGIES.filter(tech => tech.category === category.id);
                return (
                  <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className={cn('w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4', category.color)}>
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{category.label}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {categoryTechs.length} technologies available
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {categoryTechs.slice(0, 6).map((tech) => (
                        <div key={tech.id} className="w-8 h-8 bg-white rounded p-1 shadow-sm">
                          <Image
                            src={tech.logo}
                            alt={tech.name}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>
          
          {showCategories && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {TECH_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>
          )}
          
          {/* Featured Technologies */}
          {selectedCategory === 'all' && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">Featured Technologies</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTechnologies.map((tech) => (
                  <TechnologyCard
                    key={tech.id}
                    tech={tech}
                    variant="featured"
                    showUseCases={showUseCases}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* All Technologies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayTechnologies
              .filter(tech => selectedCategory === 'all' ? !tech.featured : true)
              .map((tech) => (
                <TechnologyCard
                  key={tech.id}
                  tech={tech}
                  showUseCases={showUseCases}
                />
              ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Build with Modern Tech?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our experts will help you choose the right technology stack for your project and implement it with best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Start Your Project
              </Button>
              <Button size="lg" variant="outline">
                Technology Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}