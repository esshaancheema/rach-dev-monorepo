import { 
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UsersIcon,
  GlobeAltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const stats = [
  {
    icon: UsersIcon,
    value: '500+',
    label: 'Projects Delivered',
    description: 'Successfully completed projects across industries'
  },
  {
    icon: ChartBarIcon,
    value: '10x',
    label: 'Faster Development',
    description: 'Average speed improvement with our AI tools'
  },
  {
    icon: ClockIcon,
    value: '99.9%',
    label: 'Uptime Guarantee',
    description: 'Reliable service with minimal downtime'
  },
  {
    icon: GlobeAltIcon,
    value: '25+',
    label: 'Countries Served',
    description: 'Global reach with local expertise'
  },
  {
    icon: ShieldCheckIcon,
    value: '100%',
    label: 'Security Compliant',
    description: 'Enterprise-grade security standards'
  },
  {
    icon: StarIcon,
    value: '4.9/5',
    label: 'Client Satisfaction',
    description: 'Based on 200+ client reviews'
  }
];

const clientLogos = [
  { name: 'TechCorp', width: 120 },
  { name: 'InnovateLabs', width: 140 },
  { name: 'StartupXYZ', width: 100 },
  { name: 'Enterprise Inc', width: 160 },
  { name: 'GrowthCo', width: 110 },
  { name: 'DevStudio', width: 130 }
];

const testimonials = [
  {
    quote: "Zoptal transformed our development process. What used to take weeks now takes days.",
    author: "Sarah Chen",
    position: "CTO, TechStartup",
    avatar: "/images/testimonials/sarah.jpg"
  },
  {
    quote: "The AI-powered code generation is incredible. It's like having a senior developer on demand.",
    author: "Michael Rodriguez",
    position: "Lead Developer, InnovateInc",
    avatar: "/images/testimonials/michael.jpg"
  },
  {
    quote: "Outstanding quality and speed. Zoptal helped us launch our product 3 months ahead of schedule.",
    author: "Emily Watson",
    position: "Product Manager, GrowthLabs",
    avatar: "/images/testimonials/emily.jpg"
  }
];

export default function TrustIndicators() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Development Teams Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of companies that have accelerated their development with our AI-powered platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                <stat.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-700 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-500 leading-tight">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Client Logos */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Powering Innovation at Leading Companies
            </h3>
            <p className="text-gray-600">
              From startups to enterprises, we help businesses build better software faster
            </p>
          </div>
          
          <div className="flex justify-center items-center space-x-8 sm:space-x-12 opacity-60 hover:opacity-80 transition-opacity">
            {clientLogos.map((logo, index) => (
              <div 
                key={index}
                className="text-gray-400 font-bold text-lg"
                style={{ width: `${logo.width}px` }}
              >
                {logo.name}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h3>
            <p className="text-gray-600">
              Real feedback from real customers who've transformed their development process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-semibold text-lg">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.position}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security & Compliance
            </h3>
            <p className="text-gray-600 mb-6">
              Your code and data are protected with bank-level security. We comply with SOC 2, GDPR, 
              and other industry standards to ensure your peace of mind.
            </p>
            <div className="flex justify-center items-center space-x-8 text-sm font-semibold text-gray-500">
              <span>SOC 2 Certified</span>
              <span>GDPR Compliant</span>
              <span>ISO 27001</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}