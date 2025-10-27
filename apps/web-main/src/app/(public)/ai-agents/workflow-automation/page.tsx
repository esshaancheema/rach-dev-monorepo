import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Workflow Automation AI Agents | Streamline Operations with Intelligence | Zoptal',
  description: 'Streamline operations with intelligent agents that automate repetitive tasks and complex workflows. 80% time savings, 95% error reduction, 400% ROI.',
  keywords: [
    'workflow automation AI',
    'process automation',
    'intelligent automation',
    'business process automation',
    'task automation',
    'workflow optimization',
    'automated workflows',
    'process intelligence',
    'operational efficiency',
    'digital transformation'
  ],
};

const keyBenefits = [
  {
    icon: '⚙️',
    title: 'Process Automation',
    description: 'Automate complex, multi-step business processes with intelligent decision-making capabilities.'
  },
  {
    icon: '🎯',
    title: 'Task Orchestration',
    description: 'Coordinate tasks across multiple systems and teams with intelligent routing and prioritization.'
  },
  {
    icon: '🔗',
    title: 'System Integration',
    description: 'Seamlessly connect disparate systems and applications for unified workflow execution.'
  },
  {
    icon: '📋',
    title: 'Compliance Monitoring',
    description: 'Ensure adherence to regulatory requirements and business policies throughout all processes.'
  },
  {
    icon: '⚡',
    title: 'Exception Handling',
    description: 'Intelligent error detection and resolution with automatic escalation when needed.'
  },
  {
    icon: '📊',
    title: 'Performance Optimization',
    description: 'Continuously optimize workflows based on performance data and feedback loops.'
  }
];

const workflowAgents = [
  {
    category: 'Document Processing Agents',
    agents: [
      {
        name: 'Invoice Processing Bot',
        description: 'Automated invoice capture, validation, and processing with approval workflows.',
        features: ['OCR extraction', 'Data validation', 'Approval routing', 'ERP integration'],
        href: '/ai-agents/workflow-automation/invoice-processing'
      },
      {
        name: 'Contract Management Agent',
        description: 'End-to-end contract lifecycle management and automated compliance tracking.',
        features: ['Contract analysis', 'Compliance monitoring', 'Renewal alerts', 'Risk assessment'],
        href: '/ai-agents/workflow-automation/contract-management'
      },
      {
        name: 'Document Classification System',
        description: 'Intelligent document categorization and routing based on content analysis.',
        features: ['Auto classification', 'Smart routing', 'Metadata extraction', 'Archive management'],
        href: '/ai-agents/workflow-automation/document-classification'
      }
    ]
  },
  {
    category: 'HR & Employee Management Agents',
    agents: [
      {
        name: 'Employee Onboarding Coordinator',
        description: 'Streamlines the complete employee onboarding process from offer to day one.',
        features: ['Task scheduling', 'Document collection', 'System provisioning', 'Progress tracking'],
        href: '/ai-agents/workflow-automation/employee-onboarding'
      },
      {
        name: 'Time Off Management Agent',
        description: 'Automated leave request processing with policy validation and coverage planning.',
        features: ['Policy validation', 'Coverage planning', 'Calendar integration', 'Approval workflows'],
        href: '/ai-agents/workflow-automation/time-off-management'
      },
      {
        name: 'Performance Review Coordinator',
        description: 'Orchestrates performance review cycles with automated scheduling and reminders.',
        features: ['Review scheduling', 'Reminder automation', 'Feedback collection', 'Report generation'],
        href: '/ai-agents/workflow-automation/performance-reviews'
      }
    ]
  },
  {
    category: 'Financial Process Agents',
    agents: [
      {
        name: 'Expense Report Processor',
        description: 'Automated expense report submission, validation, and reimbursement processing.',
        features: ['Receipt scanning', 'Policy validation', 'Approval routing', 'Reimbursement processing'],
        href: '/ai-agents/workflow-automation/expense-reports'
      },
      {
        name: 'Purchase Order Automation',
        description: 'End-to-end purchase order creation, approval, and tracking system.',
        features: ['Auto PO creation', 'Approval workflows', 'Vendor management', 'Order tracking'],
        href: '/ai-agents/workflow-automation/purchase-orders'
      },
      {
        name: 'Budget Monitoring Agent',
        description: 'Continuous budget tracking with automated alerts and variance analysis.',
        features: ['Budget tracking', 'Variance alerts', 'Spending analysis', 'Forecast updates'],
        href: '/ai-agents/workflow-automation/budget-monitoring'
      }
    ]
  }
];

export default function WorkflowAutomationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Workflow Automation AI Agents
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Streamline Operations with
              <span className="block bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                Intelligent Automation
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              Streamline operations with intelligent agents that automate repetitive tasks and complex workflows. 
              Reduce manual work by 80% while improving accuracy and efficiency across your organization.
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-indigo-400 mb-2">80%</div>
                <div className="text-gray-300">Time Savings</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                <div className="text-gray-300">Error Reduction</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-pink-400 mb-2">400%</div>
                <div className="text-gray-300">ROI Achievement</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Build Custom Workflow
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Browse Automation Agents
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                See ROI Calculator
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
                Why Workflow Automation AI Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Transform your operations with intelligent automation
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
                Comprehensive Workflow Automation AI Agents
              </h2>
              <p className="text-xl text-gray-600">
                Specialized agents for every business process
              </p>
            </div>

            {workflowAgents.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">
                  {categoryIndex + 1}. {category.category}
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.agents.map((agent, agentIndex) => (
                    <Card key={agentIndex} className="p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold mb-3 text-indigo-600">{agent.name}</h4>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {agent.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
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
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Automate Your Workflows?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Transform your operations with intelligent agents that eliminate manual work and boost efficiency.
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
                <div className="text-3xl font-bold mb-2">5M+</div>
                <div className="text-indigo-200">Tasks Automated</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-indigo-200">Continuous Operation</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.5%</div>
                <div className="text-indigo-200">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}