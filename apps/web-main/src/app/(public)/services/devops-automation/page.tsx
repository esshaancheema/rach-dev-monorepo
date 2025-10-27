import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  CogIcon,
  CloudIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'DevOps & Automation Services | Zoptal - CI/CD, Cloud & Infrastructure',
  description: 'Professional DevOps automation services including CI/CD pipelines, infrastructure as code, container orchestration, and cloud deployment solutions.',
  keywords: ['DevOps automation', 'CI/CD pipelines', 'infrastructure automation', 'Docker', 'Kubernetes', 'cloud deployment'],
  openGraph: {
    title: 'DevOps & Automation Services | Zoptal',
    description: 'Professional DevOps automation services with CI/CD, infrastructure automation, and cloud deployment.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: CogIcon,
    title: 'CI/CD Automation',
    description: 'Automated testing, building, and deployment pipelines for faster releases.'
  },
  {
    icon: CloudIcon,
    title: 'Infrastructure as Code',
    description: 'Version-controlled infrastructure with Terraform, CloudFormation, and Ansible.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Container Orchestration',
    description: 'Docker containers and Kubernetes orchestration for scalable applications.'
  },
  {
    icon: ChartBarIcon,
    title: 'Monitoring & Analytics',
    description: 'Comprehensive monitoring, logging, and performance analytics solutions.'
  }
];

const services = [
  {
    title: 'CI/CD Pipeline Setup',
    description: 'Automated build, test, and deployment workflows for continuous delivery',
    href: '/services/devops-automation/cicd',
    features: ['Automated Testing', 'Build Automation', 'Deployment Pipeline']
  },
  {
    title: 'Cloud Infrastructure',
    description: 'Scalable cloud infrastructure with auto-scaling and disaster recovery',
    href: '/services/devops-automation/cloud',
    features: ['AWS/Azure/GCP', 'Auto-scaling', 'Load Balancing']
  },
  {
    title: 'Container Solutions',
    description: 'Docker containerization and Kubernetes orchestration for modern apps',
    href: '/services/devops-automation/containers',
    features: ['Docker Containers', 'Kubernetes', 'Service Mesh']
  }
];

const technologies = [
  'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI/CD', 'GitHub Actions', 'Terraform', 'Ansible', 'AWS',
  'Azure', 'Google Cloud', 'Prometheus', 'Grafana', 'ELK Stack', 'Helm', 'ArgoCD', 'Istio'
];

const process = [
  {
    step: 1,
    title: 'Infrastructure Assessment',
    description: 'Analyzing current infrastructure, workflows, and identifying automation opportunities',
    duration: '1 week'
  },
  {
    step: 2,
    title: 'Strategy & Planning',
    description: 'Designing DevOps strategy, selecting tools, and creating implementation roadmap',
    duration: '1-2 weeks'
  },
  {
    step: 3,
    title: 'Implementation & Testing',
    description: 'Setting up pipelines, infrastructure, and testing automation workflows',
    duration: '4-8 weeks'
  },
  {
    step: 4,
    title: 'Monitoring & Optimization',
    description: 'Deploying monitoring solutions and optimizing performance',
    duration: 'Ongoing'
  }
];

const packages = [
  {
    name: 'Starter DevOps',
    price: '$12,000',
    description: 'Essential DevOps setup for small to medium projects',
    features: [
      'Basic CI/CD pipeline',
      'Docker containerization',
      'Cloud deployment setup',
      'Basic monitoring',
      'Infrastructure documentation',
      '3 months support'
    ],
    highlight: false
  },
  {
    name: 'Professional DevOps',
    price: '$30,000',
    description: 'Comprehensive DevOps solution for growing businesses',
    features: [
      'Advanced CI/CD with multiple environments',
      'Kubernetes orchestration',
      'Infrastructure as Code (Terraform)',
      'Automated testing integration',
      'Monitoring & alerting',
      'Security scanning',
      'Performance optimization',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise DevOps',
    price: 'Custom Quote',
    description: 'Full-scale DevOps transformation with enterprise features',
    features: [
      'Multi-cloud deployment strategy',
      'Advanced security & compliance',
      'Auto-scaling & disaster recovery',
      'Service mesh & microservices',
      'Advanced monitoring & analytics',
      'Team training & consultation',
      'Dedicated DevOps engineer',
      '12 months support'
    ],
    highlight: false
  }
];

export default function DevOpsAutomationPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600/20 backdrop-blur-sm text-indigo-200 text-sm font-medium mb-6">
                <CogIcon className="h-4 w-4 mr-2" />
                DevOps & Automation Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Streamline Your
                <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent block">
                  Development Workflow
                </span>
              </h1>
              
              <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                Accelerate your software delivery with automated CI/CD pipelines, 
                infrastructure as code, and cloud-native solutions. Deploy faster, 
                scale smarter, and maintain quality with our DevOps expertise.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Start DevOps Transformation
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Success Stories
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/services/devops-automation.webp"
                  alt="DevOps & Automation Services"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our DevOps Automation Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your development workflow with automation that increases efficiency and reliability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our DevOps Automation Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end DevOps solutions from development to production deployment
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-indigo-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Learn More
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              DevOps Tools & Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry-leading tools for automation, monitoring, and infrastructure management
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our DevOps Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology for successful DevOps transformation and automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-indigo-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-indigo-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              DevOps Automation Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect DevOps solution for your team and infrastructure needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-indigo-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-indigo-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Accelerate Your Development?
          </h2>
          
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join 600+ companies that transformed their development workflow with Zoptal. 
            Reduce deployment time by 90% and increase release frequency with our DevOps solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Transformation
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}