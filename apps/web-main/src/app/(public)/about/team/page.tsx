import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  UserGroupIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  SparklesIcon,
  HeartIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Our Team - Meet the Zoptal Leadership & Experts',
  description: 'Meet the talented team behind Zoptal. Learn about our leadership, engineers, and experts building the future of AI-powered development.',
  keywords: [
    'Zoptal team',
    'company leadership',
    'engineering team',
    'founders',
    'AI experts',
    'software engineers',
    'team members',
    'company culture'
  ],
  alternates: {
    canonical: 'https://zoptal.com/about/team',
  },
  openGraph: {
    title: 'Our Team - Zoptal',
    description: 'Meet the talented team building the future of AI-powered development',
    type: 'website',
  },
};

const teamMembers = [
  {
    name: 'Alex Rodriguez',
    role: 'CEO & Co-Founder',
    department: 'Leadership',
    image: '/team/alex-rodriguez.jpg',
    bio: 'Former VP of Engineering at Google. 15+ years building scalable systems and leading engineering teams. Stanford CS, MIT MBA.',
    location: 'San Francisco, CA',
    joined: '2020',
    skills: ['Leadership', 'System Architecture', 'Strategy'],
    linkedin: 'https://linkedin.com/in/alex-rodriguez',
    twitter: 'https://twitter.com/alex_rodriguez'
  },
  {
    name: 'Sarah Chen',
    role: 'CTO & Co-Founder',
    department: 'Engineering',
    image: '/team/sarah-chen.jpg',
    bio: 'AI researcher and engineer. Former Principal at Meta AI. PhD in Computer Science from MIT, specialized in machine learning.',
    location: 'San Francisco, CA',
    joined: '2020',
    skills: ['AI/ML', 'System Design', 'Engineering'],
    linkedin: 'https://linkedin.com/in/sarah-chen',
    github: 'https://github.com/sarah-chen'
  },
  {
    name: 'Marcus Johnson',
    role: 'VP of Product',
    department: 'Product',
    image: '/team/marcus-johnson.jpg',
    bio: 'Product leader with 12+ years at top tech companies. Former Senior Director at Stripe. Expert in developer tools and platforms.',
    location: 'New York, NY',
    joined: '2021',
    skills: ['Product Strategy', 'UX Design', 'Growth'],
    linkedin: 'https://linkedin.com/in/marcus-johnson'
  },
  {
    name: 'Priya Patel',
    role: 'Head of AI Research',
    department: 'AI Team',
    image: '/team/priya-patel.jpg',
    bio: 'Leading AI researcher specializing in large language models. Former researcher at OpenAI. PhD in AI from Carnegie Mellon.',
    location: 'Remote',
    joined: '2021',
    skills: ['LLMs', 'NLP', 'Research'],
    linkedin: 'https://linkedin.com/in/priya-patel',
    scholar: 'https://scholar.google.com/citations?user=priya-patel'
  },
  {
    name: 'David Kim',
    role: 'VP of Engineering',
    department: 'Engineering',
    image: '/team/david-kim.jpg',
    bio: 'Full-stack engineering leader. Former Engineering Manager at Uber. Expert in distributed systems and cloud infrastructure.',
    location: 'Seattle, WA',
    joined: '2022',
    skills: ['Full-Stack', 'DevOps', 'Team Leadership'],
    linkedin: 'https://linkedin.com/in/david-kim',
    github: 'https://github.com/david-kim'
  },
  {
    name: 'Emily Zhang',
    role: 'Head of Design',
    department: 'Design',
    image: '/team/emily-zhang.jpg',
    bio: 'Design leader focused on developer experience. Former Senior Designer at Figma. Passionate about making complex tools simple.',
    location: 'Los Angeles, CA',
    joined: '2022',
    skills: ['UX Design', 'Design Systems', 'User Research'],
    linkedin: 'https://linkedin.com/in/emily-zhang',
    dribbble: 'https://dribbble.com/emily-zhang'
  }
];

const departments = [
  {
    name: 'Leadership',
    count: 2,
    description: 'Visionary leaders setting the strategic direction'
  },
  {
    name: 'Engineering',
    count: 25,
    description: 'World-class engineers building cutting-edge technology'
  },
  {
    name: 'AI Team',
    count: 8,
    description: 'AI researchers and ML engineers advancing the state of AI'
  },
  {
    name: 'Product',
    count: 6,
    description: 'Product managers and designers creating exceptional experiences'
  },
  {
    name: 'Design',
    count: 4,
    description: 'Talented designers crafting beautiful, intuitive interfaces'
  },
  {
    name: 'Operations',
    count: 5,
    description: 'Business operations, HR, and finance professionals'
  }
];

const values = [
  {
    icon: SparklesIcon,
    title: 'Innovation First',
    description: 'We push boundaries and embrace new technologies to solve complex problems.',
    color: 'blue'
  },
  {
    icon: UserGroupIcon,
    title: 'Collaboration',
    description: 'We believe diverse perspectives and teamwork create the best solutions.',
    color: 'green'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from code quality to customer service.',
    color: 'purple'
  },
  {
    icon: HeartIcon,
    title: 'Customer Focus',
    description: 'Our customers\' success is our success. We build with their needs at the center.',
    color: 'red'
  }
];

const perks = [
  'Competitive salary and equity',
  'Health, dental, and vision insurance',
  'Unlimited PTO and flexible hours',
  'Remote-first culture',
  '$2,500 learning and development budget',
  'Top-tier equipment and setup budget',
  'Company retreats and team events',
  'Stock options and equity participation'
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're a diverse group of engineers, researchers, designers, and leaders united by our 
              mission to revolutionize software development with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/careers">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Join Our Team
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  About Zoptal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 mt-2">Team Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15+</div>
              <div className="text-gray-600 mt-2">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">6</div>
              <div className="text-gray-600 mt-2">Departments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-gray-600 mt-2">Remote Friendly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced leaders with a track record of building successful companies
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-16 h-16 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-blue-600 font-medium mb-2">
                  {member.role}
                </div>
                <Badge variant="outline" className="mb-4">
                  {member.department}
                </Badge>
                
                <p className="text-gray-600 text-sm mb-4">
                  {member.bio}
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {member.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    Since {member.joined}
                  </div>
                </div>
                
                <div className="flex justify-center space-x-3">
                  {member.linkedin && (
                    <a 
                      href={member.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                  {member.github && (
                    <a 
                      href={member.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      GitHub
                    </a>
                  )}
                  {member.twitter && (
                    <a 
                      href={member.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Twitter
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Departments
            </h2>
            <p className="text-xl text-gray-600">
              Talented professionals across every function
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dept.name}
                  </h3>
                  <Badge className="bg-blue-100 text-blue-700">
                    {dept.count} people
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  {dept.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                red: 'bg-red-100 text-red-600'
              };
              
              return (
                <div key={value.title} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${colorClasses[value.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perks & Benefits */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Work at Zoptal?
            </h2>
            <p className="text-xl text-gray-600">
              We take care of our team so they can do their best work
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Help us build the future of AI-powered software development. 
              We're always looking for talented individuals to join our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/careers">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  View Open Positions
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}