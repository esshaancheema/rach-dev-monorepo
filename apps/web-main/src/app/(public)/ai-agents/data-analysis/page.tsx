import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Data Analysis AI Agents | Transform Raw Data into Actionable Insights | Zoptal',
  description: 'Transform raw data into actionable insights with AI agents. 100x faster processing, 99.2% accuracy, real-time reports. Advanced analytics, predictive modeling, custom dashboards.',
  keywords: [
    'data analysis AI agents',
    'business intelligence automation',
    'AI analytics',
    'predictive modeling',
    'automated reporting',
    'data visualization AI',
    'real-time analytics',
    'machine learning insights',
    'data processing automation',
    'smart dashboards'
  ],
};

const keyBenefits = [
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    description: 'Process and analyze data streams in real-time for immediate insights and decision-making.'
  },
  {
    icon: '🔮',
    title: 'Predictive Modeling',
    description: 'Advanced AI models that forecast trends, identify patterns, and predict future outcomes.'
  },
  {
    icon: '📈',
    title: 'Custom Dashboards',
    description: 'Automatically generated, personalized dashboards tailored to your specific KPIs and metrics.'
  },
  {
    icon: '⚡',
    title: 'Automated Reporting',
    description: 'Generate comprehensive reports automatically, saving hours of manual analysis work.'
  },
  {
    icon: '🎯',
    title: 'Actionable Insights',
    description: 'AI-driven recommendations and insights that directly inform business strategy and decisions.'
  },
  {
    icon: '🔄',
    title: 'Continuous Learning',
    description: 'Models that improve accuracy and insights as they process more data over time.'
  }
];

const dataAgents = [
  {
    category: 'Business Intelligence Agents',
    agents: [
      {
        name: 'Executive Dashboard Creator',
        description: 'Creates comprehensive C-level dashboards with key business metrics.',
        features: ['Real-time KPI tracking', 'Executive summaries', 'Trend analysis', 'Alert systems'],
        href: '/ai-agents/data-analysis/executive-dashboard'
      },
      {
        name: 'Sales Performance Analyzer',
        description: 'Analyzes sales data to identify opportunities and optimize performance.',
        features: ['Pipeline analysis', 'Win/loss tracking', 'Revenue forecasting', 'Rep performance'],
        href: '/ai-agents/data-analysis/sales-analyzer'
      },
      {
        name: 'Customer Behavior Analyst',
        description: 'Deep analysis of customer interactions and behavior patterns.',
        features: ['Journey mapping', 'Churn prediction', 'Segmentation', 'Lifetime value analysis'],
        href: '/ai-agents/data-analysis/customer-behavior'
      }
    ]
  },
  {
    category: 'Predictive Analytics Agents',
    agents: [
      {
        name: 'Demand Forecasting Agent',
        description: 'Predicts future demand patterns for inventory and resource planning.',
        features: ['Seasonal adjustments', 'Market trend analysis', 'Inventory optimization', 'Resource planning'],
        href: '/ai-agents/data-analysis/demand-forecasting'
      },
      {
        name: 'Risk Assessment Specialist',
        description: 'Identifies and quantifies business risks using predictive models.',
        features: ['Risk scoring', 'Scenario modeling', 'Mitigation strategies', 'Compliance monitoring'],
        href: '/ai-agents/data-analysis/risk-assessment'
      },
      {
        name: 'Market Intelligence Agent',
        description: 'Analyzes market trends and competitive landscape for strategic insights.',
        features: ['Market sizing', 'Competitive analysis', 'Trend identification', 'Opportunity mapping'],
        href: '/ai-agents/data-analysis/market-intelligence'
      }
    ]
  },
  {
    category: 'Operational Analytics Agents',
    agents: [
      {
        name: 'Process Optimization Bot',
        description: 'Analyzes operational processes to identify inefficiencies and improvements.',
        features: ['Bottleneck detection', 'Efficiency metrics', 'Cost analysis', 'Optimization recommendations'],
        href: '/ai-agents/data-analysis/process-optimization'
      },
      {
        name: 'Quality Control Analyzer',
        description: 'Monitors and analyzes quality metrics across operations.',
        features: ['Defect tracking', 'Quality scoring', 'Root cause analysis', 'Improvement suggestions'],
        href: '/ai-agents/data-analysis/quality-control'
      },
      {
        name: 'Resource Utilization Monitor',
        description: 'Tracks and optimizes resource usage across the organization.',
        features: ['Capacity planning', 'Utilization rates', 'Cost optimization', 'Allocation recommendations'],
        href: '/ai-agents/data-analysis/resource-utilization'
      }
    ]
  }
];

export default function DataAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white">
              Data Analysis AI Agents
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              Transform Raw Data into
              <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto">
              Transform raw data into actionable insights with agents that analyze, visualize, and report on complex datasets. 
              Our AI-powered analytics platform processes information 100x faster than traditional methods.
            </p>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-purple-400 mb-2">100x faster</div>
                <div className="text-gray-300">Processing Speed</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">99.2%</div>
                <div className="text-gray-300">Accuracy Rate</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur border-white/20">
                <div className="text-3xl font-bold text-indigo-400 mb-2">Real-time</div>
                <div className="text-gray-300">Report Generation</div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="white" size="lg" className="text-lg px-8 py-4">
                Build Custom Analyst
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                Browse Analytics Agents
              </Button>
              <Button variant="outline-white" size="lg" className="text-lg px-8 py-4">
                See Demo
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
                Why Data Analysis AI Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Turn your data into your competitive advantage
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
                Comprehensive Data Analysis AI Agents
              </h2>
              <p className="text-xl text-gray-600">
                Specialized agents for every aspect of data analytics
              </p>
            </div>

            {dataAgents.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">
                  {categoryIndex + 1}. {category.category}
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.agents.map((agent, agentIndex) => (
                    <Card key={agentIndex} className="p-6 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold mb-3 text-purple-600">{agent.name}</h4>
                      <p className="text-gray-600 mb-4">{agent.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {agent.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Unlock Your Data's Potential?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Transform your data into actionable insights with intelligent AI agents that work around the clock.
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
                <div className="text-3xl font-bold mb-2">50TB+</div>
                <div className="text-purple-200">Data Processed Daily</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-purple-200">Reports Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-purple-200">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}