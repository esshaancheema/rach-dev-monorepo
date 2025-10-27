import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  NewspaperIcon,
  DocumentTextIcon,
  PhotoIcon,
  MicrophoneIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Press & Media - Zoptal News and Resources',
  description: 'Get the latest news, press releases, and media resources from Zoptal. Download our media kit, brand assets, and connect with our press team.',
  keywords: [
    'press releases',
    'media kit',
    'company news',
    'brand assets',
    'press contact',
    'Zoptal news',
    'media resources',
    'company announcements'
  ],
  alternates: {
    canonical: 'https://zoptal.com/press',
  },
  openGraph: {
    title: 'Press & Media - Zoptal',
    description: 'Latest news and media resources from Zoptal',
    type: 'website',
  },
};

const pressReleases = [
  {
    id: 1,
    title: 'Zoptal Raises $50M Series B to Accelerate AI-Powered Development Platform',
    date: '2024-12-15',
    category: 'Funding',
    excerpt: 'Leading venture capital firms back Zoptal\'s mission to revolutionize software development with AI-human collaboration.',
    featured: true,
    image: '/images/press/series-b-announcement.jpg'
  },
  {
    id: 2,
    title: 'Zoptal Launches Revolutionary AI Code Assistant for Enterprise Teams',
    date: '2024-11-28',
    category: 'Product Launch',
    excerpt: 'New AI assistant helps development teams increase productivity by 300% while maintaining code quality and security standards.',
    featured: true,
    image: '/images/press/ai-assistant-launch.jpg'
  },
  {
    id: 3,
    title: 'Zoptal Partners with Fortune 500 Companies to Transform Digital Innovation',
    date: '2024-11-10',
    category: 'Partnership',
    excerpt: 'Strategic partnerships with industry leaders to bring AI-powered development to enterprise scale.',
    featured: false,
    image: '/images/press/enterprise-partnership.jpg'
  },
  {
    id: 4,
    title: 'Zoptal Achieves SOC 2 Type II Certification',
    date: '2024-10-25',
    category: 'Security',
    excerpt: 'Demonstrating our commitment to security and compliance for enterprise customers.',
    featured: false,
    image: '/images/press/soc2-certification.jpg'
  },
  {
    id: 5,
    title: 'Zoptal Named to Forbes AI 50 List',
    date: '2024-10-05',
    category: 'Recognition',
    excerpt: 'Recognized as one of the most promising AI companies transforming the software industry.',
    featured: false,
    image: '/images/press/forbes-ai50.jpg'
  }
];

const mediaContacts = [
  {
    name: 'Sarah Johnson',
    title: 'Head of Communications',
    email: 'sarah.johnson@zoptal.com',
    phone: '+1 (555) 012-3456'
  },
  {
    name: 'Michael Chen',
    title: 'PR Manager',
    email: 'michael.chen@zoptal.com',
    phone: '+1 (555) 012-3457'
  }
];

const mediaAssets = [
  {
    title: 'Media Kit',
    description: 'Complete press kit with company information, executive bios, and fact sheet',
    icon: DocumentTextIcon,
    size: '2.4 MB',
    format: 'PDF'
  },
  {
    title: 'Brand Guidelines',
    description: 'Logo usage, color palette, typography, and brand voice guidelines',
    icon: PhotoIcon,
    size: '5.8 MB',
    format: 'PDF'
  },
  {
    title: 'Logo Package',
    description: 'High-resolution logos in various formats (PNG, SVG, EPS)',
    icon: PhotoIcon,
    size: '1.2 MB',
    format: 'ZIP'
  },
  {
    title: 'Executive Photos',
    description: 'Professional photos of leadership team and founders',
    icon: PhotoIcon,
    size: '8.5 MB',
    format: 'ZIP'
  }
];

const companyStats = [
  { label: 'Founded', value: '2020' },
  { label: 'Employees', value: '50+' },
  { label: 'Customers', value: '500+' },
  { label: 'Countries', value: '25+' }
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Press & Media Center
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get the latest news, announcements, and media resources from Zoptal. 
              We're transforming how software is built with AI-human collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Download Media Kit
              </Button>
              <Button size="lg" variant="outline">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Contact Press Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {companyStats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Press Releases */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Latest Press Releases
              </h2>
              <p className="text-xl text-gray-600">
                Company news and announcements
              </p>
            </div>
            <Button variant="outline">
              View All Releases
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {pressReleases.slice(0, 2).map((release) => (
              <Card key={release.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  {/* Placeholder for image */}
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    <NewspaperIcon className="w-16 h-16 text-white/50" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{release.category}</Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(release.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {release.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {release.excerpt}
                  </p>
                  <Link href={`/press/releases/${release.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                    Read Full Release →
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* More Releases List */}
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">More Releases</h3>
            {pressReleases.slice(2).map((release) => (
              <div key={release.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{release.category}</Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(release.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <Link href={`/press/releases/${release.id}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
                    {release.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Resources */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Media Resources
            </h2>
            <p className="text-xl text-gray-600">
              Download brand assets, media kits, and company information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaAssets.map((asset) => {
              const Icon = asset.icon;
              return (
                <Card key={asset.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {asset.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {asset.format} • {asset.size}
                    </span>
                    <Button size="sm" variant="outline">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Media Inquiries
                </h2>
                <p className="text-blue-100 mb-6">
                  For press inquiries, interview requests, or additional information about Zoptal, 
                  please contact our media relations team.
                </p>
                <div className="space-y-4">
                  {mediaContacts.map((contact) => (
                    <div key={contact.name} className="bg-white/10 rounded-lg p-4">
                      <div className="font-semibold">{contact.name}</div>
                      <div className="text-blue-100 text-sm">{contact.title}</div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2 text-sm">
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-200">
                          {contact.email}
                        </a>
                        <span className="hidden sm:inline text-blue-300">•</span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Quick Facts</h3>
                  <ul className="space-y-2 text-blue-100">
                    <li>• Founded in 2020 in San Francisco</li>
                    <li>• 50+ employees across 15 countries</li>
                    <li>• $75M in total funding raised</li>
                    <li>• 500+ enterprise customers</li>
                    <li>• AI-powered development platform</li>
                    <li>• SOC 2 Type II certified</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to receive press releases and company updates directly in your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}