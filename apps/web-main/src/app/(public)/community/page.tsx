import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CalendarIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon,
  TrophyIcon,
  MicrophoneIcon,
  BookOpenIcon,
  CodeBracketIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Zoptal Community - Connect, Learn, and Grow Together',
  description: 'Join the Zoptal developer community. Connect with developers, share knowledge, attend events, and contribute to open-source projects.',
  keywords: [
    'developer community',
    'Zoptal community',
    'developer forum',
    'discord community',
    'developer events',
    'open source',
    'developer resources',
    'community support'
  ],
  alternates: {
    canonical: 'https://zoptal.com/community',
  },
  openGraph: {
    title: 'Zoptal Community',
    description: 'Join thousands of developers building the future with Zoptal',
    type: 'website',
  },
};

const communityChannels = [
  {
    name: 'Discord Server',
    description: 'Real-time chat with 10,000+ developers',
    members: '10,000+',
    icon: ChatBubbleLeftRightIcon,
    link: 'https://discord.gg/zoptal',
    color: 'purple',
    featured: true
  },
  {
    name: 'GitHub Discussions',
    description: 'Technical discussions and Q&A',
    members: '5,000+',
    icon: CodeBracketIcon,
    link: 'https://github.com/zoptal/discussions',
    color: 'gray',
    featured: false
  },
  {
    name: 'Developer Forum',
    description: 'In-depth technical discussions',
    members: '8,000+',
    icon: UserGroupIcon,
    link: 'https://forum.zoptal.com',
    color: 'blue',
    featured: false
  },
  {
    name: 'Stack Overflow',
    description: 'Get help with Zoptal-related questions',
    members: '3,000+',
    icon: BookOpenIcon,
    link: 'https://stackoverflow.com/questions/tagged/zoptal',
    color: 'orange',
    featured: false
  }
];

const upcomingEvents = [
  {
    title: 'Zoptal Developer Conference 2025',
    date: 'March 15-17, 2025',
    location: 'San Francisco & Virtual',
    type: 'Conference',
    attendees: '2,000+',
    featured: true
  },
  {
    title: 'AI Development Workshop',
    date: 'January 20, 2025',
    location: 'Virtual',
    type: 'Workshop',
    attendees: '500+',
    featured: false
  },
  {
    title: 'Monthly Developer Meetup',
    date: 'Every First Thursday',
    location: 'Virtual',
    type: 'Meetup',
    attendees: '100+',
    featured: false
  },
  {
    title: 'Hackathon: Build with AI',
    date: 'February 10-12, 2025',
    location: 'Virtual',
    type: 'Hackathon',
    attendees: '1,000+',
    featured: true
  }
];

const communityStats = [
  {
    value: '25,000+',
    label: 'Community Members',
    icon: UserGroupIcon
  },
  {
    value: '150+',
    label: 'Contributors',
    icon: HeartIcon
  },
  {
    value: '50+',
    label: 'Events Per Year',
    icon: CalendarIcon
  },
  {
    value: '30+',
    label: 'Countries',
    icon: GlobeAltIcon
  }
];

const contributorSpotlight = [
  {
    name: 'Alex Johnson',
    avatar: '/avatars/alex.jpg',
    role: 'Top Contributor',
    contributions: '150+ PRs',
    github: 'alexj'
  },
  {
    name: 'Maria Garcia',
    avatar: '/avatars/maria.jpg',
    role: 'Community Leader',
    contributions: 'Discord Moderator',
    github: 'mgarcia'
  },
  {
    name: 'David Kim',
    avatar: '/avatars/david.jpg',
    role: 'Documentation Hero',
    contributions: '200+ Docs',
    github: 'dkim'
  },
  {
    name: 'Sophie Chen',
    avatar: '/avatars/sophie.jpg',
    role: 'Plugin Developer',
    contributions: '10+ Plugins',
    github: 'sophiec'
  }
];

const resources = [
  {
    title: 'Developer Documentation',
    description: 'Comprehensive guides and API references',
    icon: BookOpenIcon,
    link: '/docs'
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides',
    icon: AcademicCapIcon,
    link: '/tutorials'
  },
  {
    title: 'Code Examples',
    description: 'Sample projects and code snippets',
    icon: CodeBracketIcon,
    link: '/examples'
  },
  {
    title: 'Blog',
    description: 'Technical articles and updates',
    icon: SparklesIcon,
    link: '/blog'
  }
];

const openSourceProjects = [
  {
    name: 'Zoptal CLI',
    description: 'Command-line interface for Zoptal platform',
    stars: '2.5k',
    language: 'TypeScript',
    link: 'https://github.com/zoptal/cli'
  },
  {
    name: 'AI Code Assistant',
    description: 'AI-powered coding assistant',
    stars: '5.2k',
    language: 'Python',
    link: 'https://github.com/zoptal/ai-assistant'
  },
  {
    name: 'React Components',
    description: 'Reusable React component library',
    stars: '1.8k',
    language: 'React',
    link: 'https://github.com/zoptal/react-components'
  },
  {
    name: 'DevOps Tools',
    description: 'Infrastructure as code templates',
    stars: '900',
    language: 'Terraform',
    link: 'https://github.com/zoptal/devops'
  }
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-600 to-blue-600 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Join the Zoptal Community
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Connect with thousands of developers, share knowledge, and build amazing 
              things together. Be part of the future of AI-powered development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Join Discord
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Explore Forums
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {communityStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-gray-600 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Connect With Us
            </h2>
            <p className="text-xl text-gray-600">
              Choose your preferred way to engage with the community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityChannels.map((channel) => {
              const Icon = channel.icon;
              const colorClasses = {
                purple: 'bg-purple-100 text-purple-600',
                gray: 'bg-gray-100 text-gray-600',
                blue: 'bg-blue-100 text-blue-600',
                orange: 'bg-orange-100 text-orange-600'
              };
              
              return (
                <Card key={channel.name} className={`p-6 hover:shadow-lg transition-shadow ${channel.featured ? 'border-2 border-purple-500' : ''}`}>
                  <div className={`w-12 h-12 mb-4 rounded-lg flex items-center justify-center ${colorClasses[channel.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {channel.description}
                  </p>
                  <div className="text-sm text-gray-500 mb-4">
                    {channel.members} members
                  </div>
                  <a 
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    Join Now
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600">
              Learn, network, and grow with the community
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.title} className={`p-6 ${event.featured ? 'border-2 border-purple-500' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={event.featured ? 'default' : 'outline'}>
                    {event.type}
                  </Badge>
                  {event.featured && (
                    <Badge className="bg-purple-100 text-purple-700">Featured</Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4" />
                    {event.attendees} expected attendees
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" variant="outline">
              View All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Open Source Projects */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Open Source
            </h2>
            <p className="text-xl text-gray-600">
              Contribute to our open-source projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {openSourceProjects.map((project) => (
              <Card key={project.name} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {project.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{project.language}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <SparklesIcon className="w-4 h-4" />
                    {project.stars}
                  </div>
                </div>
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  View on GitHub
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contributor Spotlight */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Contributor Spotlight
            </h2>
            <p className="text-xl text-gray-600">
              Celebrating our amazing community contributors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contributorSpotlight.map((contributor) => (
              <Card key={contributor.name} className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <UserGroupIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {contributor.name}
                </h3>
                <Badge className="mb-2">{contributor.role}</Badge>
                <p className="text-sm text-gray-600 mb-3">
                  {contributor.contributions}
                </p>
                <a 
                  href={`https://github.com/${contributor.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  @{contributor.github}
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Community Resources
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to get started and grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link key={resource.title} href={resource.link}>
                  <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                    <Icon className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {resource.description}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Connect with developers worldwide, get help, share your knowledge, 
            and build amazing things together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Join Discord Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Subscribe to Newsletter
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}