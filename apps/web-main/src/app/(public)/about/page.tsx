import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
// import { generateAboutPageSchema, generateBreadcrumbSchema } from '@/lib/seo/schemas';

export const metadata: Metadata = {
  title: 'About Zoptal | AI Development Platform Story',
  description: 'Learn about Zoptal\'s mission to revolutionize software development with AI. Meet our team & discover how we\'re building the future.',
  keywords: [
    'about zoptal',
    'company story',
    'AI development team',
    'software development mission',
    'technology leadership',
    'startup story',
    'development platform',
  ],
  alternates: {
    canonical: 'https://zoptal.com/about',
  },
};

const teamMembers = [
  {
    name: 'Alex Rodriguez',
    role: 'Co-Founder & CEO',
    bio: 'Former engineering lead at Google and Stripe. Passionate about making software development accessible to everyone.',
    image: '/team/alex-rodriguez.jpg',
    linkedin: 'https://linkedin.com/in/alex-rodriguez',
    twitter: 'https://twitter.com/alexrodriguez',
  },
  {
    name: 'Sarah Chen',
    role: 'Co-Founder & CTO',
    bio: 'AI researcher with 10+ years at OpenAI and DeepMind. PhD in Computer Science from Stanford.',
    image: '/team/sarah-chen.jpg',
    linkedin: 'https://linkedin.com/in/sarah-chen',
    twitter: 'https://twitter.com/sarahchen',
  },
  {
    name: 'Marcus Johnson',
    role: 'VP of Engineering',
    bio: 'Former Principal Engineer at Meta. Expert in distributed systems and developer tools.',
    image: '/team/marcus-johnson.jpg',
    linkedin: 'https://linkedin.com/in/marcus-johnson',
  },
  {
    name: 'Dr. Priya Patel',
    role: 'Head of AI Research',
    bio: 'Former research scientist at Microsoft Research. Specializes in large language models and code generation.',
    image: '/team/priya-patel.jpg',
    linkedin: 'https://linkedin.com/in/priya-patel',
  },
  {
    name: 'David Kim',
    role: 'VP of Product',
    bio: 'Product leader with 8+ years at GitHub and Figma. Focused on developer experience and user-centric design.',
    image: '/team/david-kim.jpg',
    linkedin: 'https://linkedin.com/in/david-kim',
  },
  {
    name: 'Emily Zhang',
    role: 'Head of Design',
    bio: 'Design systems expert from Airbnb and Notion. Believes in making complex technology simple and intuitive.',
    image: '/team/emily-zhang.jpg',
    linkedin: 'https://linkedin.com/in/emily-zhang',
  },
];

const values = [
  {
    title: 'Developer First',
    description: 'Everything we build starts with the developer experience. We obsess over making complex things simple.',
    icon: '👩‍💻',
  },
  {
    title: 'AI for Good',
    description: 'We believe AI should augment human creativity, not replace it. Our goal is to make developers more productive and fulfilled.',
    icon: '🤖',
  },
  {
    title: 'Open Innovation',
    description: 'We build in the open, share our learnings, and contribute back to the developer community.',
    icon: '🌐',
  },
  {
    title: 'Quality & Speed',
    description: 'We don\'t compromise on quality for speed. Our platform enables both rapid development and robust solutions.',
    icon: '⚡',
  },
];

const milestones = [
  {
    year: '2021',
    title: 'The Beginning',
    description: 'Alex and Sarah founded Zoptal with a vision to democratize software development using AI.',
  },
  {
    year: '2022',
    title: 'First Product Launch',
    description: 'Launched our MVP with 100 beta users. Achieved 95% user satisfaction in the first month.',
  },
  {
    year: '2023',
    title: 'Series A Funding',
    description: 'Raised $15M Series A led by Andreessen Horowitz to accelerate product development.',
  },
  {
    year: '2024',
    title: 'Enterprise Launch',
    description: 'Expanded to serve enterprise customers with advanced security and compliance features.',
  },
  {
    year: '2024',
    title: 'Global Expansion',
    description: 'Opened offices in London and Singapore. Now serving 50+ countries worldwide.',
  },
];

const stats = [
  { label: 'Developers Served', value: '100K+' },
  { label: 'Applications Built', value: '500K+' },
  { label: 'Countries', value: '50+' },
  { label: 'Team Members', value: '150+' },
];

const investors = [
  { name: 'Andreessen Horowitz', logo: '/investors/a16z.png' },
  { name: 'Sequoia Capital', logo: '/investors/sequoia.png' },
  { name: 'Y Combinator', logo: '/investors/yc.png' },
  { name: 'First Round Capital', logo: '/investors/first-round.png' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Building the Future of
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Software Development
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              We're on a mission to democratize software development by combining the power of 
              artificial intelligence with human creativity. Every developer should be able to 
              build their ideas without limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg" className="text-lg px-8 py-4">
                  Join Our Mission
                </Button>
              </Link>
              <Link href="#story">
                <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Story Section */}
      <section id="story" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-xl text-gray-600">
                How two developers with a shared vision are transforming the way software is built
              </p>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                In 2021, Alex Rodriguez and Sarah Chen were working at different tech giants, 
                facing the same frustration: software development was becoming increasingly complex, 
                requiring teams to master dozens of technologies just to build simple applications.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                Alex, an engineering lead at Google, was spending more time configuring build systems 
                than actually building features. Sarah, an AI researcher at OpenAI, saw the potential 
                for artificial intelligence to eliminate this complexity and let developers focus on 
                what they do best—solving problems and creating value.
              </p>
              
              <p className="text-lg text-gray-700 mb-6">
                They left their comfortable positions to start Zoptal with a simple but ambitious goal: 
                make software development as easy as describing what you want to build. Today, that vision 
                is becoming reality as thousands of developers use our platform to build applications 
                in hours instead of months.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Journey</h2>
              <p className="text-xl text-gray-600">
                Key milestones in our mission to revolutionize software development
              </p>
            </div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {milestone.year}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-16 bg-blue-200 mt-4"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Our Values</h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value) => (
                <Card key={value.title} className="p-8 text-center">
                  <span className="text-4xl mb-4 block">{value.icon}</span>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-xl text-gray-600">
                World-class talent from leading tech companies, united by a shared vision
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.name} className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-2xl text-gray-600">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="flex justify-center gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        LinkedIn
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                Want to join our mission? We're always looking for talented people.
              </p>
              <Link href="/careers">
                <Button variant="primary" size="lg">
                  View Open Positions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Investors */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">
              Backed by Leading Investors
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {investors.map((investor) => (
                <div key={investor.name} className="grayscale hover:grayscale-0 transition-all">
                  {investor.logo ? (
                    <Image
                      src={investor.logo}
                      alt={investor.name}
                      width={120}
                      height={60}
                      className="mx-auto"
                    />
                  ) : (
                    <div className="text-lg font-bold text-gray-600">
                      {investor.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Press & Recognition */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">
              Press & Recognition
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6">
                <h3 className="font-bold mb-2">TechCrunch</h3>
                <p className="text-sm text-gray-600 mb-3">
                  "Zoptal is revolutionizing how developers build applications with AI"
                </p>
                <Badge variant="outline" size="sm">Featured Article</Badge>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">Forbes</h3>
                <p className="text-sm text-gray-600 mb-3">
                  "One of the most promising startups in the developer tools space"
                </p>
                <Badge variant="outline" size="sm">30 Under 30</Badge>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-2">Hacker News</h3>
                <p className="text-sm text-gray-600 mb-3">
                  "The future of software development is here, and it's called Zoptal"
                </p>
                <Badge variant="outline" size="sm">#1 Trending</Badge>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join Us in Building the Future
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Whether you're a developer, investor, or someone who shares our vision, 
              we'd love to connect and explore how we can work together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="white" size="lg" className="text-lg px-8 py-4">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}