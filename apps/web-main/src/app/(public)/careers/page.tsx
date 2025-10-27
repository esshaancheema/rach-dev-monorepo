import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  SparklesIcon,
  HeartIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  TrophyIcon,
  HomeModernIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Careers at Zoptal - Join Our Team | Shape the Future of Software',
  description: 'Join Zoptal and be part of a team building cutting-edge AI and software solutions. Explore open positions, benefits, and our innovative work culture.',
  keywords: [
    'careers',
    'jobs',
    'software engineer jobs',
    'AI developer jobs',
    'tech careers',
    'remote jobs',
    'startup jobs',
    'developer careers',
    'engineering jobs',
    'Zoptal careers'
  ],
  alternates: {
    canonical: 'https://zoptal.com/careers',
  },
  openGraph: {
    title: 'Careers at Zoptal - Join Our Team',
    description: 'Build your career at Zoptal. We\'re looking for talented individuals to help shape the future of AI and software development.',
    type: 'website',
  },
};

const openPositions = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    level: 'Senior',
    salary: '$150k - $200k',
    description: 'We\'re looking for an experienced full stack engineer to help build our next-generation AI-powered platform.',
    requirements: [
      '5+ years of experience with React/Next.js',
      'Strong TypeScript and Node.js skills',
      'Experience with cloud platforms (AWS/GCP)',
      'Passion for clean code and best practices'
    ],
    featured: true
  },
  {
    id: 2,
    title: 'AI/ML Engineer',
    department: 'AI Team',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid-Senior',
    salary: '$160k - $220k',
    description: 'Join our AI team to develop cutting-edge machine learning models and AI solutions.',
    requirements: [
      '3+ years of ML/AI experience',
      'Proficiency in Python and TensorFlow/PyTorch',
      'Experience with LLMs and NLP',
      'Strong mathematical and statistical background'
    ],
    featured: true
  },
  {
    id: 3,
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    level: 'Mid-Senior',
    salary: '$140k - $180k',
    description: 'Help us scale our infrastructure and improve our deployment processes.',
    requirements: [
      'Experience with Kubernetes and Docker',
      'Strong knowledge of CI/CD pipelines',
      'AWS/GCP certification preferred',
      'Infrastructure as Code (Terraform/CloudFormation)'
    ],
    featured: false
  },
  {
    id: 4,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    level: 'Senior',
    salary: '$130k - $170k',
    description: 'Lead the design of intuitive and beautiful user experiences for our platforms.',
    requirements: [
      '5+ years of product design experience',
      'Strong portfolio of web/mobile designs',
      'Proficiency in Figma and design systems',
      'Experience with user research and testing'
    ],
    featured: false
  },
  {
    id: 5,
    title: 'Technical Writer',
    department: 'Documentation',
    location: 'Remote',
    type: 'Contract',
    level: 'Mid',
    salary: '$80k - $100k',
    description: 'Create comprehensive documentation for our APIs and developer tools.',
    requirements: [
      '3+ years of technical writing experience',
      'Experience with developer documentation',
      'Understanding of APIs and software development',
      'Excellent written communication skills'
    ],
    featured: false
  }
];

const benefits = [
  {
    icon: CurrencyDollarIcon,
    title: 'Competitive Salary',
    description: 'Top-tier compensation with equity options'
  },
  {
    icon: HeartIcon,
    title: 'Health & Wellness',
    description: '100% covered health, dental, and vision insurance'
  },
  {
    icon: HomeModernIcon,
    title: 'Remote Flexibility',
    description: 'Work from anywhere with flexible hours'
  },
  {
    icon: CalendarDaysIcon,
    title: 'Unlimited PTO',
    description: 'Take time off when you need it'
  },
  {
    icon: AcademicCapIcon,
    title: 'Learning Budget',
    description: '$2,500 annual learning and development budget'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Career Growth',
    description: 'Clear paths for advancement and skill development'
  }
];

const values = [
  {
    icon: SparklesIcon,
    title: 'Innovation First',
    description: 'We push boundaries and embrace new technologies'
  },
  {
    icon: UserGroupIcon,
    title: 'Collaboration',
    description: 'We believe in the power of teamwork'
  },
  {
    icon: TrophyIcon,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do'
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Join the Zoptal Team
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Help us build the future of AI-powered software development. We're looking for passionate 
              individuals who want to make a real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View Open Positions
              </Button>
              <Button size="lg" variant="outline">
                Our Culture
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 mt-2">Team Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15+</div>
              <div className="text-gray-600 mt-2">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-gray-600 mt-2">Remote First</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">4.8</div>
              <div className="text-gray-600 mt-2">Glassdoor Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600">
              Find your next opportunity with us
            </p>
          </div>

          <div className="space-y-6">
            {openPositions.map((position) => (
              <Card key={position.id} className={`p-6 hover:shadow-lg transition-shadow ${position.featured ? 'border-blue-500 border-2' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {position.title}
                          </h3>
                          {position.featured && (
                            <Badge className="bg-blue-100 text-blue-700">Featured</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4">{position.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            {position.department}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {position.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {position.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            {position.salary}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-8">
                    <Link href={`/careers/${position.id}`}>
                      <Button className="w-full lg:w-auto">
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see a perfect fit? We're always looking for talented individuals.
            </p>
            <Button variant="outline" size="lg">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Benefits & Perks
            </h2>
            <p className="text-xl text-gray-600">
              We take care of our team so they can take care of our customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              What drives us every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Take the next step in your career and help us build amazing products that 
            make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              View All Jobs
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Learn About Our Culture
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}