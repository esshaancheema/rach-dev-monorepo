import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, CodeBracketIcon, StarIcon, CalendarIcon, UserGroupIcon, GlobeAltIcon, CheckIcon, TagIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { keywordsByCategory } from '@/lib/seo/keywords';
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'Case Studies by Technology | Software Development Portfolio | Zoptal',
  description: 'Explore our case studies organized by technology stack. Real-world implementations using React, Node.js, Python, AI/ML, and cutting-edge technologies.',
  keywords: [
    ...keywordsByCategory.services,
    'technology case studies',
    'react projects',
    'nodejs development',
    'python solutions',
    'ai ml implementation',
    'cloud native applications',
    'microservices architecture',
    'technology portfolio',
    'software stack examples',
    'framework implementations',
    'tech stack case studies',
    'modern technology solutions',
    'enterprise technology',
    'scalable architectures'
  ],
  openGraph: {
    title: 'Case Studies by Technology | Software Development Portfolio | Zoptal',
    description: 'Explore our case studies organized by technology stack. Real implementations with proven results.',
    type: 'website',
    url: 'https://zoptal.com/case-studies/by-technology',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Studies by Technology | Software Development Portfolio | Zoptal',
    description: 'Explore our case studies organized by technology stack. Real implementations with proven results.',
  },
  alternates: {
    canonical: 'https://zoptal.com/case-studies/by-technology',
  },
};

const technologyCategories = [
  {
    name: 'Frontend Technologies',
    technologies: [
      {
        name: 'React.js',
        icon: '⚛️',
        projects: 45,
        description: 'Modern web applications with React and Next.js',
        featured: [
          {
            title: 'E-commerce Platform Modernization',
            client: 'Fashion Retailer',
            impact: '300% performance improvement',
            technologies: ['React', 'Next.js', 'TypeScript']
          },
          {
            title: 'Healthcare Dashboard System',
            client: 'Medical Center',
            impact: '50% faster patient data access',
            technologies: ['React', 'Redux', 'Material-UI']
          }
        ]
      },
      {
        name: 'Vue.js',
        icon: '🟢',
        projects: 28,
        description: 'Progressive web applications with Vue ecosystem',
        featured: [
          {
            title: 'Real Estate Management Platform',
            client: 'Property Company',
            impact: '40% increase in lead conversion',
            technologies: ['Vue.js', 'Nuxt.js', 'Vuetify']
          }
        ]
      },
      {
        name: 'Angular',
        icon: '🅰️',
        projects: 32,
        description: 'Enterprise-grade applications with Angular',
        featured: [
          {
            title: 'Banking Operations Portal',
            client: 'Regional Bank',
            impact: '60% reduction in processing time',
            technologies: ['Angular', 'RxJS', 'Angular Material']
          }
        ]
      }
    ]
  },
  {
    name: 'Backend Technologies',
    technologies: [
      {
        name: 'Node.js',
        icon: '🟢',
        projects: 52,
        description: 'Scalable server-side applications and APIs',
        featured: [
          {
            title: 'Trading Platform API',
            client: 'FinTech Startup',
            impact: '$500M+ daily trading volume',
            technologies: ['Node.js', 'Express', 'MongoDB']
          },
          {
            title: 'IoT Data Processing System',
            client: 'Manufacturing Company',
            impact: '1M+ devices connected',
            technologies: ['Node.js', 'Socket.io', 'Redis']
          }
        ]
      },
      {
        name: 'Python',
        icon: '🐍',
        projects: 38,
        description: 'Data-driven applications and machine learning solutions',
        featured: [
          {
            title: 'Predictive Analytics Platform',
            client: 'Insurance Company',
            impact: '25% reduction in claims fraud',
            technologies: ['Python', 'Django', 'TensorFlow']
          },
          {
            title: 'Supply Chain Optimization',
            client: 'Logistics Provider',
            impact: '30% cost reduction',
            technologies: ['Python', 'FastAPI', 'Pandas']
          }
        ]
      },
      {
        name: 'Java',
        icon: '☕',
        projects: 29,
        description: 'Enterprise applications and microservices',
        featured: [
          {
            title: 'Enterprise Resource Planning',
            client: 'Manufacturing Giant',
            impact: '50% faster operations',
            technologies: ['Java', 'Spring Boot', 'PostgreSQL']
          }
        ]
      }
    ]
  },
  {
    name: 'Cloud & DevOps',
    technologies: [
      {
        name: 'AWS',
        icon: '☁️',
        projects: 67,
        description: 'Cloud-native applications on Amazon Web Services',
        featured: [
          {
            title: 'Global Content Delivery Network',
            client: 'Media Company',
            impact: '99.99% uptime achieved',
            technologies: ['AWS', 'CloudFront', 'Lambda']
          },
          {
            title: 'Serverless E-commerce Backend',
            client: 'Online Retailer',
            impact: '80% infrastructure cost savings',
            technologies: ['AWS Lambda', 'DynamoDB', 'API Gateway']
          }
        ]
      },
      {
        name: 'Google Cloud',
        icon: '🌤️',
        projects: 31,
        description: 'Scalable solutions on Google Cloud Platform',
        featured: [
          {
            title: 'ML-Powered Recommendation Engine',
            client: 'Streaming Service',
            impact: '35% increase in user engagement',
            technologies: ['GCP', 'BigQuery', 'Cloud ML']
          }
        ]
      },
      {
        name: 'Docker & Kubernetes',
        icon: '🐳',
        projects: 44,
        description: 'Containerized applications and orchestration',
        featured: [
          {
            title: 'Microservices Architecture Migration',
            client: 'SaaS Company',
            impact: '10x deployment frequency',
            technologies: ['Docker', 'Kubernetes', 'Helm']
          }
        ]
      }
    ]
  },
  {
    name: 'AI & Machine Learning',
    technologies: [
      {
        name: 'TensorFlow',
        icon: '🧠',
        projects: 23,
        description: 'Deep learning and neural network applications',
        featured: [
          {
            title: 'Computer Vision Quality Control',
            client: 'Manufacturing Company',
            impact: '95% defect detection accuracy',
            technologies: ['TensorFlow', 'OpenCV', 'Python']
          },
          {
            title: 'Natural Language Processing Platform',
            client: 'Legal Tech Startup',
            impact: '70% faster document analysis',
            technologies: ['TensorFlow', 'BERT', 'Flask']
          }
        ]
      },
      {
        name: 'PyTorch',
        icon: '🔥',
        projects: 18,
        description: 'Research-grade machine learning models',
        featured: [
          {
            title: 'Medical Image Analysis System',
            client: 'Healthcare Provider',
            impact: '90% diagnostic accuracy',
            technologies: ['PyTorch', 'FastAPI', 'CUDA']
          }
        ]
      },
      {
        name: 'OpenAI GPT',
        icon: '🤖',
        projects: 15,
        description: 'Large language model integrations',
        featured: [
          {
            title: 'AI-Powered Customer Support',
            client: 'SaaS Platform',
            impact: '60% reduction in response time',
            technologies: ['OpenAI GPT', 'LangChain', 'Vector DB']
          }
        ]
      }
    ]
  },
  {
    name: 'Mobile Technologies',
    technologies: [
      {
        name: 'React Native',
        icon: '📱',
        projects: 26,
        description: 'Cross-platform mobile applications',
        featured: [
          {
            title: 'Fitness Tracking App',
            client: 'Health Tech Startup',
            impact: '1M+ active users',
            technologies: ['React Native', 'Redux', 'Firebase']
          }
        ]
      },
      {
        name: 'Flutter',
        icon: '🦋',
        projects: 19,
        description: 'High-performance cross-platform apps',
        featured: [
          {
            title: 'Financial Services App',
            client: 'Credit Union',
            impact: '4.8 App Store rating',
            technologies: ['Flutter', 'Dart', 'Firebase']
          }
        ]
      },
      {
        name: 'Native iOS/Android',
        icon: '📲',
        projects: 33,
        description: 'Platform-specific native applications',
        featured: [
          {
            title: 'AR Shopping Experience',
            client: 'Furniture Retailer',
            impact: '45% increase in conversions',
            technologies: ['Swift', 'Kotlin', 'ARKit', 'ARCore']
          }
        ]
      }
    ]
  },
  {
    name: 'Database Technologies',
    technologies: [
      {
        name: 'PostgreSQL',
        icon: '🐘',
        projects: 41,
        description: 'Robust relational database solutions',
        featured: [
          {
            title: 'High-Frequency Trading Database',
            client: 'Investment Firm',
            impact: 'Sub-millisecond query performance',
            technologies: ['PostgreSQL', 'TimescaleDB', 'Redis']
          }
        ]
      },
      {
        name: 'MongoDB',
        icon: '🍃',
        projects: 35,
        description: 'Flexible document-based data storage',
        featured: [
          {
            title: 'Content Management System',
            client: 'Publishing Company',
            impact: '100M+ documents managed',
            technologies: ['MongoDB', 'Mongoose', 'Node.js']
          }
        ]
      },
      {
        name: 'Redis',
        icon: '🔴',
        projects: 28,
        description: 'High-performance caching and data structures',
        featured: [
          {
            title: 'Real-time Gaming Platform',
            client: 'Gaming Studio',
            impact: '10M+ concurrent players',
            technologies: ['Redis', 'Socket.io', 'Node.js']
          }
        ]
      }
    ]
  }
];

export default function CaseStudiesByTechnologyPage() {
  const serviceSchema = generateServiceSchema({
    name: 'Technology-Focused Case Studies',
    description: 'Software development case studies organized by technology stack, showcasing real-world implementations and results.',
    provider: {
      name: 'Zoptal',
      url: 'https://zoptal.com'
    },
    areaServed: 'Global',
    serviceType: 'Technology Portfolio',
    url: 'https://zoptal.com/case-studies/by-technology',
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    items: [
      { name: 'Home', url: 'https://zoptal.com' },
      { name: 'Case Studies', url: 'https://zoptal.com/case-studies' },
      { name: 'By Technology', url: 'https://zoptal.com/case-studies/by-technology' },
    ]
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li>
                <Link href="/case-studies" className="text-gray-500 hover:text-gray-700">
                  Case Studies
                </Link>
              </li>
              <li>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </li>
              <li className="text-gray-900 font-medium">
                By Technology
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Case Studies by Technology
            </h1>
            <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Explore our portfolio organized by technology stack. Real-world implementations with proven results across modern frameworks and platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 text-center"
              >
                Discuss Your Tech Stack
              </Link>
              <Link
                href="/case-studies"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-300 text-center"
              >
                All Case Studies
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-green-200 mb-2">50+</div>
              <div className="text-white font-semibold mb-1">Technologies Used</div>
              <div className="text-green-200 text-sm">Modern tech stack</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-green-200 mb-2">400+</div>
              <div className="text-white font-semibold mb-1">Projects Delivered</div>
              <div className="text-green-200 text-sm">Technology implementations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold text-green-200 mb-2">99.5%</div>
              <div className="text-white font-semibold mb-1">Success Rate</div>
              <div className="text-green-200 text-sm">Project delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Categories */}
      {technologyCategories.map((category, categoryIndex) => (
        <section key={category.name} className={`py-20 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {category.name}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real-world implementations and success stories using cutting-edge {category.name.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {category.technologies.map((tech) => (
                <div key={tech.name} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{tech.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{tech.name}</h3>
                      <p className="text-gray-600 text-sm">{tech.projects} projects completed</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{tech.description}</p>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Featured Projects:</h4>
                    {tech.featured.map((project, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h5 className="font-semibold text-gray-900 text-sm mb-1">{project.title}</h5>
                        <p className="text-gray-600 text-xs mb-2">{project.client}</p>
                        <div className="flex items-center mb-2">
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-green-600 font-semibold text-xs">{project.impact}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((techName, techIndex) => (
                            <span key={techIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {techName}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 mt-6">
                    <Link
                      href={`/case-studies?technology=${tech.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
                    >
                      View All {tech.name} Projects
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Technology Trends */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Emerging Technology Trends
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We stay ahead of the curve, implementing cutting-edge technologies in real-world projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                trend: 'AI/ML Integration',
                growth: '+250%',
                description: 'Machine learning implementations in business applications',
                projects: 45
              },
              {
                trend: 'Edge Computing',
                growth: '+180%',
                description: 'Low-latency processing at the network edge',
                projects: 23
              },
              {
                trend: 'Serverless Architecture',
                growth: '+200%',
                description: 'Cost-effective, scalable cloud-native solutions',
                projects: 67
              },
              {
                trend: 'Web3 & Blockchain',
                growth: '+300%',
                description: 'Decentralized applications and smart contracts',
                projects: 18
              }
            ].map((trend, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-200 mb-2">{trend.growth}</div>
                <h3 className="text-lg font-semibold mb-2">{trend.trend}</h3>
                <p className="text-blue-100 text-sm mb-3">{trend.description}</p>
                <div className="text-blue-200 text-sm">{trend.projects} projects</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Technology Selection Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How we choose the right technology stack for each project based on specific requirements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CodeBracketIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements Analysis</h3>
              <p className="text-gray-600">
                We analyze performance needs, scalability requirements, team expertise, and long-term maintenance considerations.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Evaluation</h3>
              <p className="text-gray-600">
                We evaluate technologies based on community support, ecosystem maturity, security, and alignment with project goals.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Implementation Excellence</h3>
              <p className="text-gray-600">
                We implement best practices, ensure code quality, and optimize for performance across the chosen technology stack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Build with Modern Technologies?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Let's discuss your technology requirements and create a solution using the best tools for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 flex items-center justify-center"
            >
              <CodeBracketIcon className="w-5 h-5 mr-2" />
              Start Your Project
            </Link>
            <Link
              href="/services"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-300"
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}