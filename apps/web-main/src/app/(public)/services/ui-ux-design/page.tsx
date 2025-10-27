import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  PaintBrushIcon,
  EyeIcon,
  UserIcon,
  SwatchIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: 'UI/UX Design Services | Zoptal - User Experience & Interface Design',
  description: 'Professional UI/UX design services including user research, interface design, prototyping, and design systems. Create engaging digital experiences that users love.',
  keywords: ['UI design', 'UX design', 'user experience', 'interface design', 'prototyping', 'design systems', 'user research'],
  openGraph: {
    title: 'UI/UX Design Services | Zoptal',
    description: 'Professional UI/UX design services with user research, interface design, and prototyping.',
    images: ['/images/og-image.png'],
  },
};

const features = [
  {
    icon: PaintBrushIcon,
    title: 'Beautiful Interface Design',
    description: 'Stunning visual interfaces that align with your brand and captivate users.'
  },
  {
    icon: EyeIcon,
    title: 'User Experience Research',
    description: 'Data-driven insights through user research, testing, and behavioral analysis.'
  },
  {
    icon: UserIcon,
    title: 'User-Centered Design',
    description: 'Designs that prioritize user needs, accessibility, and seamless interactions.'
  },
  {
    icon: SwatchIcon,
    title: 'Design Systems',
    description: 'Scalable design systems that ensure consistency across all touchpoints.'
  }
];

const services = [
  {
    title: 'UX Research & Strategy',
    description: 'User research, personas, journey mapping, and strategic design planning',
    href: '/services/ui-ux-design/research',
    features: ['User Research', 'Persona Development', 'Journey Mapping']
  },
  {
    title: 'UI Design & Prototyping',
    description: 'High-fidelity interface design and interactive prototypes',
    href: '/services/ui-ux-design/interface',
    features: ['Interface Design', 'Interactive Prototypes', 'Visual Design']
  },
  {
    title: 'Design Systems & Guidelines',
    description: 'Comprehensive design systems and brand guidelines for consistency',
    href: '/services/ui-ux-design/systems',
    features: ['Design Systems', 'Component Libraries', 'Brand Guidelines']
  }
];

const technologies = [
  'Figma', 'Adobe XD', 'Sketch', 'Principle', 'Framer', 'InVision', 'Miro', 'Figjam',
  'Hotjar', 'Maze', 'Optimal Workshop', 'UserTesting', 'Zeplin', 'Abstract', 'Lottie', 'After Effects'
];

const process = [
  {
    step: 1,
    title: 'Research & Discovery',
    description: 'Understanding users, business goals, and market landscape through comprehensive research',
    duration: '1-2 weeks'
  },
  {
    step: 2,
    title: 'Ideation & Wireframing',
    description: 'Creating user flows, wireframes, and low-fidelity prototypes',
    duration: '1-2 weeks'
  },
  {
    step: 3,
    title: 'Visual Design & Prototyping',
    description: 'Crafting high-fidelity designs and interactive prototypes',
    duration: '3-4 weeks'
  },
  {
    step: 4,
    title: 'Testing & Refinement',
    description: 'User testing, feedback incorporation, and design iteration',
    duration: '1-2 weeks'
  }
];

const packages = [
  {
    name: 'Essential Design',
    price: '$8,000',
    description: 'Perfect for startups and small projects needing core design work',
    features: [
      'UX research & user personas',
      'Wireframes & user flows',
      'High-fidelity UI design',
      'Basic prototyping',
      'Design handoff documentation',
      '3 months support'
    ],
    highlight: false
  },
  {
    name: 'Professional Design',
    price: '$20,000',
    description: 'Comprehensive design solution for growing businesses',
    features: [
      'Extensive user research & testing',
      'Complete design system',
      'Interactive prototyping',
      'Multi-device responsive design',
      'Usability testing & optimization',
      'Brand identity integration',
      'Developer collaboration',
      '6 months support'
    ],
    highlight: true
  },
  {
    name: 'Enterprise Design',
    price: 'Custom Quote',
    description: 'Full-scale design solution with enterprise features',
    features: [
      'Comprehensive design strategy',
      'Large-scale design systems',
      'Advanced user research & analytics',
      'Multi-platform design solutions',
      'Accessibility & compliance',
      'Team training & workshops',
      'Dedicated design team',
      '12 months support'
    ],
    highlight: false
  }
];

export default function UIUXDesignPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-900 via-rose-800 to-purple-900 py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-pink-600/20 backdrop-blur-sm text-pink-200 text-sm font-medium mb-6">
                <PaintBrushIcon className="h-4 w-4 mr-2" />
                UI/UX Design Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Design Experiences
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent block">
                  Users Love
                </span>
              </h1>
              
              <p className="text-xl text-pink-100 mb-8 leading-relaxed">
                Create stunning digital experiences with our comprehensive UI/UX design services. 
                From user research to pixel-perfect interfaces, we design products that delight 
                users and drive business success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Start Design Project
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <PlayIcon className="mr-2 h-5 w-5" />
                  View Design Portfolio
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/services/ui-ux-design.webp"
                  alt="UI/UX Design Services"
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
              Why Choose Our UI/UX Design Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We create user-centered designs that combine beautiful aesthetics with intuitive functionality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-pink-600 group-hover:text-white transition-colors" />
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
              Our UI/UX Design Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end design services from research and strategy to final implementation
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
                      <CheckIcon className="h-5 w-5 text-pink-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={service.href}
                  className="inline-flex items-center text-pink-600 font-semibold hover:text-pink-700 transition-colors"
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
              Design Tools & Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry-leading tools for research, design, prototyping, and collaboration
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-full hover:bg-pink-100 hover:text-pink-800 transition-colors"
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
              Our Design Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A proven methodology ensuring user-centered design and exceptional results
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-12 h-12 bg-pink-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="flex items-center text-sm text-pink-600 font-medium">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.duration}
                  </div>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-pink-200" />
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
              UI/UX Design Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect design solution for your project needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg ${pkg.highlight ? 'ring-2 ring-pink-500 scale-105' : ''}`}>
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-4xl font-bold text-pink-600 mb-4">{pkg.price}</div>
                  <p className="text-gray-600">{pkg.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-pink-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    pkg.highlight 
                      ? 'bg-pink-600 text-white hover:bg-pink-700' 
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
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400 mr-2" />
            <StarIcon className="h-8 w-8 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Amazing User Experiences?
          </h2>
          
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join 400+ companies that chose Zoptal for exceptional UI/UX design. 
            Let's create digital experiences that users love and businesses thrive on.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Your Design Project
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-pink-700 text-white font-semibold rounded-lg hover:bg-pink-800 transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}