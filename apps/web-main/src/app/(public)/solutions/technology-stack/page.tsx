import { Metadata } from 'next';
import { MotionDiv } from '@/components/motion/MotionPrimitives';
import { 
  CodeBracketIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  BoltIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ServerIcon,
  CubeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { SEOHead, StructuredData } from '@/components/seo';

export const metadata: Metadata = {
  title: 'Technology Stack | AI-Powered Development Platform | Zoptal',
  description: 'Explore our cutting-edge technology stack powering AI-accelerated development. From frontend frameworks to AI/ML models, cloud infrastructure, and security solutions.',
  keywords: [
    'technology stack',
    'development technologies',
    'AI development stack',
    'modern tech stack',
    'cloud infrastructure',
    'frontend frameworks',
    'backend technologies',
    'AI/ML stack'
  ]
};

const techCategories = [
  {
    id: 'frontend',
    title: 'Frontend Technologies',
    description: 'Modern UI frameworks and libraries for exceptional user experiences',
    icon: GlobeAltIcon,
    color: 'from-blue-500 to-cyan-500',
    technologies: [
      {
        name: 'React',
        description: 'Component-based UI library',
        version: '18.3+',
        logo: '⚛️',
        features: ['Server Components', 'Hooks', 'Concurrent Features', 'Suspense'],
        useCases: ['Web Applications', 'Dashboard UIs', 'Interactive Components']
      },
      {
        name: 'Next.js',
        description: 'Full-stack React framework',
        version: '14.2+',
        logo: '▲',
        features: ['App Router', 'SSR/SSG', 'API Routes', 'Middleware'],
        useCases: ['Web Applications', 'E-commerce', 'Marketing Sites']
      },
      {
        name: 'Vue.js',
        description: 'Progressive JavaScript framework',
        version: '3.4+',
        logo: '🖖',
        features: ['Composition API', 'Reactivity', 'Single File Components', 'Teleport'],
        useCases: ['SPAs', 'Progressive Enhancement', 'Component Libraries']
      },
      {
        name: 'Angular',
        description: 'Enterprise-grade framework',
        version: '17+',
        logo: '🅰️',
        features: ['TypeScript', 'Dependency Injection', 'RxJS', 'CLI'],
        useCases: ['Enterprise Apps', 'Large-scale Applications', 'Complex UIs']
      }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    description: 'Cross-platform and native mobile development solutions',
    icon: DevicePhoneMobileIcon,
    color: 'from-purple-500 to-pink-500',
    technologies: [
      {
        name: 'React Native',
        description: 'Cross-platform mobile framework',
        version: '0.73+',
        logo: '📱',
        features: ['Native Modules', 'Hot Reload', 'Platform APIs', 'CodePush'],
        useCases: ['iOS/Android Apps', 'Cross-platform', 'Rapid Prototyping']
      },
      {
        name: 'Flutter',
        description: 'Google\'s UI toolkit',
        version: '3.16+',
        logo: '🐦',
        features: ['Hot Reload', 'Widget System', 'Dart Language', 'Material Design'],
        useCases: ['Cross-platform Apps', 'High-performance UIs', 'Custom Designs']
      },
      {
        name: 'Swift',
        description: 'Native iOS development',
        version: '5.9+',
        logo: '🦉',
        features: ['SwiftUI', 'Combine', 'Memory Safety', 'Performance'],
        useCases: ['Native iOS Apps', 'System Integration', 'Performance-critical']
      },
      {
        name: 'Kotlin',
        description: 'Modern Android development',
        version: '1.9+',
        logo: '🏗️',
        features: ['Jetpack Compose', 'Coroutines', 'Null Safety', 'Interoperability'],
        useCases: ['Native Android Apps', 'Enterprise Apps', 'Performance Apps']
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend & APIs',
    description: 'Scalable server-side technologies and API frameworks',
    icon: ServerIcon,
    color: 'from-green-500 to-emerald-500',
    technologies: [
      {
        name: 'Node.js',
        description: 'JavaScript runtime environment',
        version: '20.x LTS',
        logo: '🟢',
        features: ['Event Loop', 'NPM Ecosystem', 'V8 Engine', 'Streams'],
        useCases: ['APIs', 'Real-time Apps', 'Microservices', 'Full-stack Apps']
      },
      {
        name: 'Python',
        description: 'Versatile programming language',
        version: '3.12+',
        logo: '🐍',
        features: ['Django/FastAPI', 'Data Science', 'AI/ML Libraries', 'Asyncio'],
        useCases: ['AI/ML', 'Data Processing', 'Web APIs', 'Automation']
      },
      {
        name: 'Go',
        description: 'High-performance language',
        version: '1.21+',
        logo: '🐹',
        features: ['Concurrency', 'Static Typing', 'Fast Compilation', 'Small Binaries'],
        useCases: ['Microservices', 'System Programming', 'Cloud Native', 'CLI Tools']
      },
      {
        name: 'Rust',
        description: 'Memory-safe systems language',
        version: '1.75+',
        logo: '🦀',
        features: ['Memory Safety', 'Zero-cost Abstractions', 'Concurrency', 'Performance'],
        useCases: ['System Programming', 'WebAssembly', 'Blockchain', 'CLI Tools']
      }
    ]
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Cutting-edge AI/ML frameworks and model serving platforms',
    icon: CpuChipIcon,
    color: 'from-orange-500 to-red-500',
    technologies: [
      {
        name: 'PyTorch',
        description: 'Deep learning framework',
        version: '2.1+',
        logo: '🔥',
        features: ['Dynamic Graphs', 'GPU Acceleration', 'TorchScript', 'Distributed Training'],
        useCases: ['Deep Learning', 'Computer Vision', 'NLP', 'Research']
      },
      {
        name: 'TensorFlow',
        description: 'ML platform by Google',
        version: '2.15+',
        logo: '🧠',
        features: ['Keras API', 'TensorBoard', 'TF Serving', 'Mobile/Edge Deployment'],
        useCases: ['Production ML', 'Mobile ML', 'Large-scale Training', 'MLOps']
      },
      {
        name: 'OpenAI GPT',
        description: 'Large language models',
        version: 'GPT-4+',
        logo: '🤖',
        features: ['Text Generation', 'Code Generation', 'Reasoning', 'Multimodal'],
        useCases: ['Chatbots', 'Content Generation', 'Code Assistance', 'Analysis']
      },
      {
        name: 'Hugging Face',
        description: 'Transformers library',
        version: '4.36+',
        logo: '🤗',
        features: ['Pre-trained Models', 'Tokenizers', 'Datasets', 'Model Hub'],
        useCases: ['NLP Tasks', 'Model Fine-tuning', 'Text Processing', 'Sentiment Analysis']
      }
    ]
  },
  {
    id: 'cloud',
    title: 'Cloud & Infrastructure',
    description: 'Modern cloud platforms and infrastructure as code solutions',
    icon: CloudIcon,
    color: 'from-indigo-500 to-purple-500',
    technologies: [
      {
        name: 'AWS',
        description: 'Amazon Web Services',
        version: 'Latest',
        logo: '☁️',
        features: ['EC2', 'Lambda', 'RDS', 'S3', 'CloudFormation', 'EKS'],
        useCases: ['Scalable Apps', 'Serverless', 'Data Storage', 'Container Orchestration']
      },
      {
        name: 'Vercel',
        description: 'Frontend deployment platform',
        version: 'Latest',
        logo: '▲',
        features: ['Edge Network', 'Serverless Functions', 'Preview Deployments', 'Analytics'],
        useCases: ['Frontend Apps', 'JAMstack', 'Next.js Apps', 'Static Sites']
      },
      {
        name: 'Docker',
        description: 'Containerization platform',
        version: '24.x+',
        logo: '🐳',
        features: ['Containers', 'Images', 'Docker Compose', 'Multi-stage Builds'],
        useCases: ['Development', 'Deployment', 'Microservices', 'CI/CD']
      },
      {
        name: 'Kubernetes',
        description: 'Container orchestration',
        version: '1.29+',
        logo: '⚓',
        features: ['Pod Management', 'Service Discovery', 'Auto-scaling', 'Rolling Updates'],
        useCases: ['Container Orchestration', 'Microservices', 'Auto-scaling', 'Production Deployment']
      }
    ]
  },
  {
    id: 'database',
    title: 'Databases & Storage',
    description: 'Modern database solutions for different data models and use cases',
    icon: CubeIcon,
    color: 'from-teal-500 to-blue-500',
    technologies: [
      {
        name: 'PostgreSQL',
        description: 'Advanced relational database',
        version: '16+',
        logo: '🐘',
        features: ['ACID Compliance', 'JSON Support', 'Full-text Search', 'Extensions'],
        useCases: ['Transactional Apps', 'Analytics', 'Geospatial Data', 'Time Series']
      },
      {
        name: 'MongoDB',
        description: 'Document-oriented database',
        version: '7.0+',
        logo: '📄',
        features: ['Document Store', 'Aggregation Pipeline', 'Sharding', 'Replica Sets'],
        useCases: ['Content Management', 'Product Catalogs', 'IoT Data', 'Real-time Analytics']
      },
      {
        name: 'Redis',
        description: 'In-memory data structure store',
        version: '7.2+',
        logo: '🔴',
        features: ['Caching', 'Pub/Sub', 'Streams', 'Modules'],
        useCases: ['Caching', 'Session Storage', 'Real-time Analytics', 'Message Queues']
      },
      {
        name: 'Supabase',
        description: 'Open-source Firebase alternative',
        version: 'Latest',
        logo: '⚡',
        features: ['Postgres', 'Auth', 'Real-time', 'Storage', 'Edge Functions'],
        useCases: ['Rapid Development', 'Real-time Apps', 'Authentication', 'File Storage']
      }
    ]
  }
];

const integrationPartners = [
  { name: 'GitHub', logo: '🐙', category: 'Version Control' },
  { name: 'Figma', logo: '🎨', category: 'Design' },
  { name: 'Slack', logo: '💬', category: 'Communication' },
  { name: 'Jira', logo: '📋', category: 'Project Management' },
  { name: 'Stripe', logo: '💳', category: 'Payments' },
  { name: 'Sentry', logo: '🚨', category: 'Error Monitoring' },
  { name: 'Datadog', logo: '📊', category: 'Monitoring' },
  { name: 'Auth0', logo: '🔐', category: 'Authentication' }
];

export default function TechnologyStackPage() {
  return (
    <>
      <SEOHead
        title="Technology Stack | AI-Powered Development Platform | Zoptal"
        description="Explore our cutting-edge technology stack powering AI-accelerated development. From frontend frameworks to AI/ML models, cloud infrastructure, and security solutions."
        canonicalUrl="https://zoptal.com/solutions/technology-stack"
        keywords={metadata.keywords as string[]}
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Zoptal Technology Stack",
          "description": "Comprehensive overview of technologies powering AI-accelerated development",
          "about": {
            "@type": "SoftwareApplication",
            "name": "Zoptal AI Development Platform",
            "applicationCategory": "DeveloperApplication"
          }
        }}
      />

      <MainLayout>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <CodeBracketIcon className="w-4 h-4" />
                <span>Our Technology Stack</span>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Cutting-Edge Technologies
                  <br />
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Powering Innovation
                  </span>
                </h1>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Our carefully curated technology stack combines the latest frameworks, 
                  AI/ML models, and cloud infrastructure to deliver exceptional results.
                </p>
              </MotionDiv>

              {/* Tech Stats */}
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                  <div className="text-gray-600 text-sm">Technologies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">6</div>
                  <div className="text-gray-600 text-sm">Core Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
                  <div className="text-gray-600 text-sm">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
                  <div className="text-gray-600 text-sm">Support</div>
                </div>
              </MotionDiv>
            </div>
          </div>
        </section>

        {/* Technology Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {techCategories.map((category, categoryIndex) => (
                <MotionDiv
                  key={category.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="text-center mb-12">
                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {category.title}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      {category.description}
                    </p>
                  </div>

                  {/* Technologies Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {category.technologies.map((tech, techIndex) => (
                      <MotionDiv
                        key={tech.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: techIndex * 0.1 }}
                        className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group hover:border-primary-200"
                      >
                        {/* Tech Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-3xl">{tech.logo}</div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {tech.version}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                          {tech.name}
                        </h3>

                        <p className="text-gray-600 mb-4 text-sm">
                          {tech.description}
                        </p>

                        {/* Features */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {tech.features.slice(0, 3).map((feature, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Use Cases */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Use Cases:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {tech.useCases.slice(0, 2).map((useCase, idx) => (
                              <li key={idx} className="flex items-center">
                                <div className="w-1 h-1 bg-primary-500 rounded-full mr-2" />
                                {useCase}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </MotionDiv>
                    ))}
                  </div>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Partners */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Integration Partners
                </h2>
              </MotionDiv>
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Seamlessly integrate with your favorite tools and services
                </p>
              </MotionDiv>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {integrationPartners.map((partner, index) => (
                <MotionDiv
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="text-3xl mb-2">{partner.logo}</div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{partner.name}</h3>
                  <p className="text-xs text-gray-600">{partner.category}</p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Why Our Technology Stack Matters
                  </h2>
                </MotionDiv>

                <div className="space-y-6">
                  {[
                    {
                      icon: BoltIcon,
                      title: 'Performance First',
                      description: 'Optimized for speed, scalability, and efficiency with modern architectures.'
                    },
                    {
                      icon: ShieldCheckIcon,
                      title: 'Enterprise Security',
                      description: 'Built-in security features and best practices across all layers.'
                    },
                    {
                      icon: RocketLaunchIcon,
                      title: 'Future Ready',
                      description: 'Latest technologies and frameworks that evolve with industry trends.'
                    },
                    {
                      icon: Cog6ToothIcon,
                      title: 'Fully Customizable',
                      description: 'Flexible architecture that adapts to your specific requirements.'
                    }
                  ].map((benefit, index) => (
                    <MotionDiv
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </MotionDiv>
                  ))}
                </div>
              </div>

              <div className="relative">
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 relative overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-4 relative z-10">
                    {['⚛️', '🔥', '☁️', '🐍', '📱', '🧠', '🐳', '⚡', '🚀'].map((emoji, index) => (
                      <MotionDiv
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="bg-white rounded-xl p-4 text-center shadow-sm"
                      >
                        <div className="text-3xl">{emoji}</div>
                      </MotionDiv>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-100/20 to-transparent" />
                </MotionDiv>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to Build with Our Technology Stack?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Let our experts help you choose the right technologies for your project 
                and accelerate your development with AI-powered solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <span>Get Started Today</span>
                  <RocketLaunchIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/solutions/products"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-700 text-white px-8 py-4 rounded-lg hover:bg-primary-800 transition-all font-semibold border border-primary-500"
                >
                  <span>Explore Solutions</span>
                  <ChartBarIcon className="w-5 h-5" />
                </Link>
              </div>
            </MotionDiv>
          </div>
        </section>
      </MainLayout>
    </>
  );
}