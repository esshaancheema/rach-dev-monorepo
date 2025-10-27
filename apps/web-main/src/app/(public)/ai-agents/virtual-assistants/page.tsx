import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Virtual Personal Assistant AI Agents | Enhance Productivity 65% | Zoptal',
  description: 'Enhance productivity with AI assistants that manage schedules, tasks, and communications intelligently. 65% productivity increase, 98% task completion, instant responses.',
  keywords: [
    'virtual personal assistant AI',
    'AI personal assistant',
    'productivity automation',
    'schedule management AI',
    'task automation',
    'calendar management',
    'email automation',
    'personal productivity',
    'digital assistant',
    'executive assistant AI'
  ],
};

const keyBenefits = [
  {
    icon: '📅',
    title: 'Calendar Management',
    description: 'Intelligent scheduling with conflict resolution, time zone coordination, and meeting optimization.'
  },
  {
    icon: '📧',
    title: 'Email Prioritization',
    description: 'Smart email sorting, response drafting, and priority-based inbox management.'
  },
  {
    icon: '✅',
    title: 'Task Automation',
    description: 'Automated task creation, deadline tracking, and progress monitoring across projects.'
  },
  {
    icon: '📋',
    title: 'Meeting Preparation',
    description: 'Automated agenda creation, participant briefing, and follow-up task assignment.'
  },
  {
    icon: '✈️',
    title: 'Travel Coordination',
    description: 'End-to-end travel planning with booking management and itinerary optimization.'
  },
  {
    icon: '💬',
    title: 'Communication Management',
    description: 'Unified communication handling across all channels with intelligent routing and responses.'
  }
];

const assistantAgents = [
  {
    category: 'Executive Assistant Agents',
    agents: [
      {
        name: 'Executive Calendar Manager',
        description: 'Advanced calendar management with intelligent scheduling and conflict resolution.',
        features: ['Smart scheduling', 'Conflict resolution', 'Time zone management', 'Meeting optimization'],
        href: '/ai-agents/virtual-assistants/executive-calendar'
      },
      {
        name: 'Email Management Specialist',
        description: 'Intelligent email processing with priority sorting and automated responses.',
        features: ['Priority sorting', 'Auto responses', 'Follow-up reminders', 'Email templates'],
        href: '/ai-agents/virtual-assistants/email-management'
      },
      {
        name: 'Meeting Coordinator',
        description: 'Comprehensive meeting management from scheduling to follow-up actions.',
        features: ['Meeting scheduling', 'Agenda preparation', 'Note taking', 'Action item tracking'],
        href: '/ai-agents/virtual-assistants/meeting-coordinator'
      }
    ]
  },
  {
    category: 'Personal Productivity Agents',
    agents: [
      {
        name: 'Task Management Assistant',
        description: 'Intelligent task organization with priority management and deadline tracking.',
        features: ['Task prioritization', 'Deadline tracking', 'Progress monitoring', 'Dependency management'],
        href: '/ai-agents/virtual-assistants/task-management'
      },
      {
        name: 'Daily Planner Bot',
        description: 'Optimized daily schedule planning with time blocking and productivity insights.',
        features: ['Time blocking', 'Schedule optimization', 'Productivity analytics', 'Energy management'],
        href: '/ai-agents/virtual-assistants/daily-planner'
      },
      {
        name: 'Focus Time Guardian',
        description: 'Protects focused work time by managing interruptions and distractions.',
        features: ['Distraction blocking', 'Focus time scheduling', 'Interruption management', 'Deep work tracking'],
        href: '/ai-agents/virtual-assistants/focus-guardian'
      }
    ]
  },
  {
    category: 'Communication Agents',
    agents: [
      {
        name: 'Multi-Channel Communicator',
        description: 'Unified communication management across email, chat, and messaging platforms.',
        features: ['Channel unification', 'Response automation', 'Context management', 'Priority routing'],
        href: '/ai-agents/virtual-assistants/multi-channel'
      },
      {
        name: 'Follow-Up Automation Agent',
        description: 'Automated follow-up management for meetings, emails, and commitments.',
        features: ['Follow-up scheduling', 'Reminder automation', 'Status tracking', 'Escalation alerts'],
        href: '/ai-agents/virtual-assistants/follow-up-automation'
      },
      {
        name: 'Contact Relationship Manager',
        description: 'Intelligent contact management with relationship insights and interaction history.',
        features: ['Contact intelligence', 'Interaction tracking', 'Relationship mapping', 'Communication history'],
        href: '/ai-agents/virtual-assistants/contact-manager'
      }
    ]
  }
];

export default function VirtualAssistantsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Virtual Personal Assistant AI Agents
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Enhance Productivity with
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Intelligent AI Assistants
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              Enhance productivity with AI assistants that manage schedules, tasks, and communications intelligently. 
              Your personal AI workforce that handles the routine so you can focus on what matters most.
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-cyan-400 mb-2">+65%</div>
                <div className="text-gray-300">Productivity Increase</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
                <div className="text-gray-300">Task Completion Rate</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-indigo-400 mb-2">Instant</div>
                <div className="text-gray-300">Response Time</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Build Personal Assistant
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Browse Assistant Agents
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                See Productivity Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Why Virtual Personal Assistant AI Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Supercharge your productivity with intelligent automation
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyBenefits.map((benefit, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Agent List */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Comprehensive Virtual Personal Assistant AI Agents
              </h2>
              <p className="text-xl text-gray-600">
                Specialized agents for every aspect of personal productivity
              </p>
            </div>

            {assistantAgents.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">
                  {categoryIndex + 1}. {category.category}
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.agents.map((agent, agentIndex) => (
                    <Card key={agentIndex} className="p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold mb-3 text-cyan-600">{agent.name}</h4>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {agent.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Link href={agent.href}>
                        <Button variant="outline" className="w-full">
                          View Details →
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Supercharge Your Productivity?
            </h2>
            <p className="text-xl text-cyan-100 mb-8">
              Get your personal AI workforce that handles routine tasks so you can focus on strategic work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Start Building Free
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Schedule Demo
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-cyan-200">Professionals Assisted</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">5 hours</div>
                <div className="text-cyan-200">Daily Time Savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-cyan-200">Always Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}