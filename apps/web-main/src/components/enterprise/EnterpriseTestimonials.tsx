import OptimizedImage from '@/components/ui/OptimizedImage';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Chief Technology Officer',
    company: 'Fortune 500 Financial Services',
    avatar: '/images/testimonials/sarah-chen-enterprise.jpg',
    rating: 5,
    content: 'Zoptal transformed our entire digital infrastructure. Their enterprise-grade solutions and dedicated support have been instrumental in our growth. The team understood our complex requirements and delivered a solution that exceeded expectations.',
    results: [
      { metric: '300%', label: 'Efficiency Improvement' },
      { metric: '99.9%', label: 'System Uptime' },
      { metric: '$2M', label: 'Annual Savings' }
    ],
    project: 'Digital Banking Platform',
    industry: 'Financial Services'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    title: 'VP of Engineering',
    company: 'Global Healthcare Provider',
    avatar: '/images/testimonials/michael-rodriguez-enterprise.jpg',
    rating: 5,
    content: 'The AI-powered patient management system developed by Zoptal has revolutionized our operations. Their expertise in healthcare compliance and enterprise security gave us confidence throughout the project.',
    results: [
      { metric: '40%', label: 'Faster Patient Processing' },
      { metric: '95%', label: 'Diagnostic Accuracy' },
      { metric: '200+', label: 'Hospitals Connected' }
    ],
    project: 'AI Patient Management System',
    industry: 'Healthcare'
  },
  {
    id: 3,
    name: 'David Kim',
    title: 'Head of Digital Transformation',
    company: 'Manufacturing Corporation',
    avatar: '/images/testimonials/david-kim-enterprise.jpg',
    rating: 5,
    content: 'Zoptal delivered a comprehensive IoT platform that connected all our manufacturing facilities globally. Their understanding of enterprise scalability and security requirements was exceptional.',
    results: [
      { metric: '25%', label: 'Production Increase' },
      { metric: '60%', label: 'Downtime Reduction' },
      { metric: '1000+', label: 'Facilities Connected' }
    ],
    project: 'Smart Factory IoT Platform',
    industry: 'Manufacturing'
  }
];

const awards = [
  {
    title: 'Enterprise Software Excellence',
    organization: 'Tech Excellence Awards 2024',
    year: '2024',
    icon: '🏆'
  },
  {
    title: 'Best Cloud Migration Partner',
    organization: 'Cloud Computing Awards',
    year: '2024',
    icon: '☁️'
  },
  {
    title: 'Top AI Implementation',
    organization: 'AI Innovation Awards',
    year: '2023',
    icon: '🤖'
  },
  {
    title: 'Security Excellence',
    organization: 'Cybersecurity Awards',
    year: '2023',
    icon: '🔒'
  }
];

export default function EnterpriseTestimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            What Enterprise Leaders Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by Fortune 500 companies and industry leaders worldwide. 
            See how we've helped transform enterprise operations.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Rating */}
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Results */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {testimonial.results.map((result, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl font-bold text-blue-600">{result.metric}</div>
                    <div className="text-xs text-gray-500">{result.label}</div>
                  </div>
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-start space-x-4">
                <OptimizedImage
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full flex-shrink-0"
                />
                
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{testimonial.title}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  
                  {/* Project Tag */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                      {testimonial.project}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Awards & Recognition */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-100">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Awards & Recognition
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our commitment to excellence in enterprise software development 
              has been recognized by industry leaders and organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {awards.map((award, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{award.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{award.title}</h4>
                <p className="text-sm text-gray-600 mb-1">{award.organization}</p>
                <p className="text-xs text-blue-600 font-semibold">{award.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Enterprise Projects</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-sm text-gray-600">Fortune 500 Clients</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </div>
          

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
            <div className="text-sm text-gray-600">Countries Served</div>
          </div>
        </div>

        {/* Video Testimonial CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900 rounded-2xl p-12 text-white">
            <h3 className="text-2xl font-bold mb-4">
              See Our Enterprise Success Stories
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Watch detailed case studies and hear directly from enterprise leaders 
              about their transformation journey with Zoptal.
            </p>
            
            <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Video Testimonials
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}