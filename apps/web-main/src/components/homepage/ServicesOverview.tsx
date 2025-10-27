'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CodeBracketIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  ShieldCheckIcon,
  CogIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useIndustryDetection } from '@/hooks/useIndustryDetection';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  image: string;
  href: string;
  badge?: string;
  stats: {
    label: string;
    value: string;
  }[];
  technologies: string[];
  price: {
    starting: string;
    unit: string;
  };
}

interface ServicesOverviewProps {
  className?: string;
  variant?: 'grid' | 'tabs' | 'carousel';
  showPricing?: boolean;
  maxServices?: number;
}

const services: Service[] = [
  {
    id: 'software-development',
    title: 'Custom Software Development',
    description: 'Enterprise-grade custom software solutions built with cutting-edge technologies and AI-powered development tools.',
    features: [
      'AI-Assisted Code Generation',
      'Microservices Architecture',
      'Real-time Monitoring',
      'Automated Testing',
      'DevOps Integration',
      '24/7 Support'
    ],
    icon: CodeBracketIcon,
    image: '/images/services/zoptal_custom_software_development.png',
    href: '/services/software-development',
    badge: 'Most Popular',
    stats: [
      { label: 'Projects Delivered', value: '500+' },
      { label: 'Client Satisfaction', value: '98%' },
      { label: 'Average Timeline', value: '12 weeks' }
    ],
    technologies: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    price: {
      starting: '$50,000',
      unit: 'per project'
    }
  },
  {
    id: 'ai-development',
    title: 'AI Agents & Automation',
    description: 'Intelligent automation solutions powered by advanced AI algorithms, machine learning models, and neural networks.',
    features: [
      'Custom AI Agents',
      'Process Automation',
      'Natural Language Processing',
      'Predictive Analytics',
      'MLOps Pipeline',
      'Smart Decision Making'
    ],
    icon: SparklesIcon,
    image: '/images/services/zoptal_ai_agents_&_zoptal_ai_automation_services.png',
    href: '/services/ai-development',
    badge: 'Hot',
    stats: [
      { label: 'AI Models Trained', value: '200+' },
      { label: 'Processes Automated', value: '500+' },
      { label: 'Efficiency Gain', value: '80%' }
    ],
    technologies: ['Claude', 'OpenAI', 'TensorFlow', 'LangChain', 'AutoGen'],
    price: {
      starting: '$75,000',
      unit: 'per project'
    }
  },
  {
    id: 'mobile-development',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications that deliver exceptional user experiences.',
    features: [
      'Native iOS & Android',
      'Cross-Platform Solutions',
      'UI/UX Design',
      'App Store Optimization',
      'Push Notifications',
      'Analytics Integration'
    ],
    icon: DevicePhoneMobileIcon,
    image: '/images/services/zoptal_mobile_app_development.png',
    href: '/services/mobile-development',
    stats: [
      { label: 'Apps Published', value: '150+' },
      { label: 'Downloads', value: '5M+' },
      { label: 'Store Rating', value: '4.8/5' }
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    price: {
      starting: '$40,000',
      unit: 'per app'
    }
  },
  {
    id: 'enterprise-development',
    title: 'Enterprise Applications',
    description: 'Scalable enterprise solutions and automated deployment pipelines for modern business applications.',
    features: [
      'Multi-Cloud Architecture',
      'Enterprise Integration',
      'Container Orchestration',
      'Infrastructure as Code',
      'Monitoring & Alerting',
      'Security Hardening'
    ],
    icon: CloudIcon,
    image: '/images/services/zoptal_enterprise_application_development_services.png',
    href: '/services/enterprise-development',
    stats: [
      { label: 'Enterprise Clients', value: '50+' },
      { label: 'Uptime SLA', value: '99.9%' },
      { label: 'Cost Reduction', value: '40%' }
    ],
    technologies: ['AWS', 'Kubernetes', 'Terraform', 'Jenkins', 'Prometheus'],
    price: {
      starting: '$100,000',
      unit: 'per project'
    }
  },
  {
    id: 'saas-development',
    title: 'SaaS Application Development',
    description: 'Complete Software-as-a-Service solutions with multi-tenant architecture and subscription management.',
    features: [
      'Multi-Tenant Architecture',
      'Subscription Management',
      'API-First Development',
      'Automated Scaling',
      'Analytics Dashboard',
      'Payment Integration'
    ],
    icon: CloudIcon,
    image: '/images/services/zoptal_saas_app_development.png',
    href: '/services/saas-development',
    badge: 'Popular',
    stats: [
      { label: 'SaaS Apps Built', value: '80+' },
      { label: 'Monthly Users', value: '2M+' },
      { label: 'Revenue Growth', value: '250%' }
    ],
    technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'Redis', 'Vercel'],
    price: {
      starting: '$60,000',
      unit: 'per platform'
    }
  },
  {
    id: 'complete-solutions',
    title: 'Complete Digital Ecosystem',
    description: 'Comprehensive end-to-end digital solutions that transform your entire business technology stack.',
    features: [
      'Full-Stack Development',
      'System Integration',
      'Digital Transformation',
      'Legacy Modernization',
      'Quality Assurance',
      'Continuous Support'
    ],
    icon: CogIcon,
    image: '/images/services/zoptal_complete_custom_digital_services_list_ecosystem.png',
    href: '/services/complete-solutions',
    badge: 'Comprehensive',
    stats: [
      { label: 'Digital Transformations', value: '200+' },
      { label: 'Systems Integrated', value: '1000+' },
      { label: 'Success Rate', value: '96%' }
    ],
    technologies: ['Full-Stack', 'Microservices', 'API Gateway', 'Cloud', 'DevOps'],
    price: {
      starting: '$150,000',
      unit: 'per transformation'
    }
  },
  {
    id: 'desktop-development',
    title: 'Desktop Applications',
    description: 'Cross-platform desktop applications for Windows and macOS with native performance and user experience.',
    features: [
      'Cross-Platform Compatibility',
      'Native Performance',
      'Offline Capabilities',
      'File System Integration',
      'Auto-Updates',
      'System Tray Support'
    ],
    icon: DevicePhoneMobileIcon,
    image: '/images/services/zoptal_desktop_application_development_windows_and_macbooks.png',
    href: '/services/desktop-development',
    stats: [
      { label: 'Desktop Apps', value: '60+' },
      { label: 'OS Compatibility', value: '100%' },
      { label: 'User Satisfaction', value: '94%' }
    ],
    technologies: ['Electron', 'Tauri', 'Swift', 'C++', 'WinUI'],
    price: {
      starting: '$35,000',
      unit: 'per application'
    }
  },
  {
    id: 'iot-development',
    title: 'IoT Application Development',
    description: 'Internet of Things solutions connecting devices, sensors, and systems for smart automation.',
    features: [
      'Device Integration',
      'Real-time Data Processing',
      'Cloud Connectivity',
      'Mobile Control Apps',
      'Sensor Networks',
      'Edge Computing'
    ],
    icon: CpuChipIcon,
    image: '/images/services/zoptal_iOT_application_development_services.png',
    href: '/services/iot-development',
    badge: 'Innovative',
    stats: [
      { label: 'Devices Connected', value: '10K+' },
      { label: 'Data Points/Day', value: '1M+' },
      { label: 'Uptime', value: '99.5%' }
    ],
    technologies: ['Arduino', 'Raspberry Pi', 'MQTT', 'AWS IoT', 'LoRaWAN'],
    price: {
      starting: '$45,000',
      unit: 'per solution'
    }
  }
];

export default function ServicesOverview({ 
  className, 
  variant = 'grid', 
  showPricing = true,
  maxServices = 8 
}: ServicesOverviewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();
  const { industry } = useIndustryDetection();
  
  const displayServices = services.slice(0, maxServices);

  const handleServiceClick = (service: Service, position: number) => {
    trackEvent('service_cta_click', 'conversion', 'services_overview', service.id, 1, {
      service_title: service.title,
      service_price: service.price.starting,
      position,
      variant,
      industry,
      has_badge: !!service.badge,
      badge_type: service.badge || null
    });
  };

  const renderServiceCard = (service: Service, index: number) => (
    <div
      key={service.id}
      className={cn(
        'relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden',
        'border border-gray-100 hover:border-blue-200',
        hoveredCard === service.id && 'scale-[1.02] shadow-2xl'
      )}
      onMouseEnter={() => setHoveredCard(service.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Badge */}
      {service.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
            service.badge === 'Most Popular' && 'bg-blue-100 text-blue-800',
            service.badge === 'Hot' && 'bg-red-100 text-red-800',
            service.badge === 'New' && 'bg-green-100 text-green-800'
          )}>
            {service.badge === 'Hot' && <StarIcon className="w-3 h-3 mr-1" />}
            {service.badge}
          </span>
        </div>
      )}

      {/* Service Image */}
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={service.image}
          alt={service.title}
          width={400}
          height={192}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Icon */}
        <div className="absolute bottom-4 left-4">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <service.icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
          <div className="grid grid-cols-2 gap-2">
            {service.features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-center text-xs text-gray-600">
                <CheckIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
          {service.features.length > 4 && (
            <p className="text-xs text-gray-500 mt-2">
              +{service.features.length - 4} more features
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          {service.stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Technologies */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {service.technologies.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {service.technologies.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                +{service.technologies.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between">
          {showPricing && (
            <div>
              <div className="text-2xl font-bold text-gray-900">{service.price.starting}</div>
              <div className="text-xs text-gray-500">{service.price.unit}</div>
            </div>
          )}
          
          <Link
            href={service.href}
            onClick={() => handleServiceClick(service, index)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors group"
          >
            Learn More
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );

  if (variant === 'tabs') {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive technology solutions designed to accelerate your business growth
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {displayServices.map((service, index) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setActiveTab(index)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                )}
              >
                {service.title}
              </button>
            ))}
          </div>

          {/* Active Service */}
          <div className="max-w-4xl mx-auto">
            {renderServiceCard(displayServices[activeTab], activeTab)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16 bg-gray-50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <CogIcon className="h-4 w-4 mr-2" />
            Our Services
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            End-to-End Technology Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From AI-powered development to cloud infrastructure, we provide comprehensive 
            solutions that transform your business and accelerate growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {displayServices.map((service, index) => renderServiceCard(service, index))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            View All Services
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Pre-configured variants
export function ServicesGrid(props: Omit<ServicesOverviewProps, 'variant'>) {
  return <ServicesOverview {...props} variant="grid" />;
}

export function ServicesTabs(props: Omit<ServicesOverviewProps, 'variant'>) {
  return <ServicesOverview {...props} variant="tabs" />;
}

export function ServicesPreview(props: Omit<ServicesOverviewProps, 'maxServices'>) {
  return <ServicesOverview {...props} maxServices={3} />;
}