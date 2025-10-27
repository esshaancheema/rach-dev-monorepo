import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ChartBarIcon,
  TrendingUpIcon,
  BanknotesIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Investor Relations - Zoptal Financial Information',
  description: 'Learn about investment opportunities with Zoptal. Access financial reports, company metrics, and investor resources.',
  keywords: [
    'investor relations',
    'investment opportunities',
    'financial reports',
    'company metrics',
    'funding rounds',
    'investor information',
    'venture capital',
    'Zoptal investors'
  ],
  alternates: {
    canonical: 'https://zoptal.com/investors',
  },
  openGraph: {
    title: 'Investor Relations - Zoptal',
    description: 'Investment opportunities and financial information for Zoptal',
    type: 'website',
  },
};

const fundingHistory = [
  {
    round: 'Series B',
    amount: '$50M',
    date: 'December 2024',
    leadInvestor: 'Sequoia Capital',
    otherInvestors: ['Andreessen Horowitz', 'Google Ventures', 'Founders Fund'],
    valuation: '$500M',
    highlight: true
  },
  {
    round: 'Series A',
    amount: '$20M',
    date: 'June 2023',
    leadInvestor: 'Accel Partners',
    otherInvestors: ['Y Combinator', 'Angel Investors'],
    valuation: '$150M',
    highlight: false
  },
  {
    round: 'Seed',
    amount: '$5M',
    date: 'January 2022',
    leadInvestor: 'Y Combinator',
    otherInvestors: ['Angel Investors'],
    valuation: '$25M',
    highlight: false
  }
];

const keyMetrics = [
  {
    label: 'Annual Recurring Revenue',
    value: '$25M+',
    growth: '+250%',
    icon: CurrencyDollarIcon
  },
  {
    label: 'Customer Count',
    value: '500+',
    growth: '+180%',
    icon: UserGroupIcon
  },
  {
    label: 'Team Size',
    value: '50+',
    growth: '+150%',
    icon: BuildingOffice2Icon
  },
  {
    label: 'Countries Served',
    value: '25+',
    growth: '+100%',
    icon: GlobeAltIcon
  }
];

const growthHighlights = [
  {
    metric: 'Revenue Growth',
    value: '3x',
    period: 'Year over Year',
    description: 'Consistent triple-digit growth for 3 consecutive years'
  },
  {
    metric: 'Customer Retention',
    value: '95%',
    period: 'Annual',
    description: 'Industry-leading retention with net negative churn'
  },
  {
    metric: 'Market Expansion',
    value: '15',
    period: 'New Markets',
    description: 'International expansion across EMEA and APAC regions'
  },
  {
    metric: 'Product Development',
    value: '50+',
    period: 'Features Released',
    description: 'Continuous innovation with AI-powered capabilities'
  }
];

const investors = [
  {
    name: 'Sequoia Capital',
    logo: '/investors/sequoia.svg',
    type: 'Lead Investor - Series B'
  },
  {
    name: 'Andreessen Horowitz',
    logo: '/investors/a16z.svg',
    type: 'Series B'
  },
  {
    name: 'Google Ventures',
    logo: '/investors/gv.svg',
    type: 'Series B'
  },
  {
    name: 'Accel Partners',
    logo: '/investors/accel.svg',
    type: 'Lead Investor - Series A'
  },
  {
    name: 'Y Combinator',
    logo: '/investors/yc.svg',
    type: 'Seed & Series A'
  },
  {
    name: 'Founders Fund',
    logo: '/investors/founders-fund.svg',
    type: 'Series B'
  }
];

const boardMembers = [
  {
    name: 'John Smith',
    title: 'CEO & Co-Founder',
    bio: 'Former VP of Engineering at Google, 15+ years in enterprise software'
  },
  {
    name: 'Sarah Johnson',
    title: 'Board Chair',
    bio: 'Partner at Sequoia Capital, former CEO of TechCorp'
  },
  {
    name: 'Michael Chen',
    title: 'Independent Director',
    bio: 'Former CTO at Microsoft, AI and cloud computing expert'
  },
  {
    name: 'Emily Davis',
    title: 'Board Member',
    bio: 'Managing Partner at Andreessen Horowitz, fintech specialist'
  }
];

const upcomingEvents = [
  {
    title: 'Q4 2024 Earnings Call',
    date: 'January 15, 2025',
    time: '2:00 PM PST',
    type: 'Webcast'
  },
  {
    title: 'Annual Investor Day',
    date: 'March 10, 2025',
    time: '9:00 AM PST',
    type: 'In-Person & Virtual'
  },
  {
    title: 'Technology Showcase',
    date: 'April 20, 2025',
    time: '1:00 PM PST',
    type: 'Virtual Demo'
  }
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Investor Relations
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Building the future of AI-powered software development. Join us in transforming 
              how companies build and deploy technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Download Investor Deck
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Contact IR Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Key Metrics
            </h2>
            <p className="text-xl text-gray-600">
              Strong growth across all key performance indicators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {metric.growth} YoY
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {metric.label}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Funding History */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Funding History
            </h2>
            <p className="text-xl text-gray-600">
              $75M raised from world-class investors
            </p>
          </div>

          <div className="space-y-6">
            {fundingHistory.map((round) => (
              <Card key={round.round} className={`p-6 ${round.highlight ? 'border-2 border-blue-500' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {round.round}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-700">
                        {round.amount}
                      </Badge>
                      {round.highlight && (
                        <Badge className="bg-green-100 text-green-700">Latest</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <CalendarIcon className="w-4 h-4" />
                      {round.date}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Lead: </span>{round.leadInvestor}
                      {round.otherInvestors.length > 0 && (
                        <span> • Others: {round.otherInvestors.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Valuation</div>
                    <div className="text-2xl font-bold text-gray-900">{round.valuation}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Highlights */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Growth Highlights
            </h2>
            <p className="text-xl text-gray-600">
              Accelerating growth across all business metrics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {growthHighlights.map((highlight) => (
              <div key={highlight.metric} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {highlight.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {highlight.metric}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {highlight.period}
                </div>
                <p className="text-sm text-gray-600">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Investors */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Investors
            </h2>
            <p className="text-xl text-gray-600">
              Backed by leading venture capital firms
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {investors.map((investor) => (
              <div key={investor.name} className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3">
                  <BuildingOffice2Icon className="w-12 h-12 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 text-sm">{investor.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{investor.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Board of Directors
            </h2>
            <p className="text-xl text-gray-600">
              Experienced leadership guiding our vision
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {boardMembers.map((member) => (
              <Card key={member.name} className="p-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                  {member.name}
                </h3>
                <div className="text-sm text-blue-600 text-center mb-3">
                  {member.title}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {member.bio}
                </p>
              </Card>
            ))}
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
              Connect with our leadership team
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.title} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline">{event.type}</Badge>
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    {event.time}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Register
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources & Contact */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">
                  Investor Resources
                </h2>
                <p className="text-blue-100 mb-6">
                  Access financial reports, presentations, and company information.
                </p>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-2 text-white hover:text-blue-200">
                    <DocumentTextIcon className="w-5 h-5" />
                    Annual Report 2024
                  </a>
                  <a href="#" className="flex items-center gap-2 text-white hover:text-blue-200">
                    <DocumentTextIcon className="w-5 h-5" />
                    Q3 2024 Financial Results
                  </a>
                  <a href="#" className="flex items-center gap-2 text-white hover:text-blue-200">
                    <DocumentTextIcon className="w-5 h-5" />
                    Investor Presentation
                  </a>
                  <a href="#" className="flex items-center gap-2 text-white hover:text-blue-200">
                    <DocumentTextIcon className="w-5 h-5" />
                    Company Fact Sheet
                  </a>
                </div>
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">
                  Contact Investor Relations
                </h2>
                <p className="text-blue-100 mb-6">
                  Have questions? Our investor relations team is here to help.
                </p>
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="mb-4">
                    <div className="font-semibold">Email</div>
                    <a href="mailto:investors@zoptal.com" className="text-blue-200 hover:text-white">
                      investors@zoptal.com
                    </a>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold">Phone</div>
                    <div className="text-blue-200">+1 (555) 123-4567</div>
                  </div>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Schedule a Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}