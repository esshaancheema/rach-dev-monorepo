'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  details: string[];
  duration: string;
  deliverables: string[];
  icon: string;
  image?: string;
  interactive?: boolean;
}

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'timeline' | 'cards' | 'interactive' | 'minimal';
  showDuration?: boolean;
  showDeliverables?: boolean;
  process?: 'development' | 'ai-integration' | 'consulting' | 'custom';
  className?: string;
}

const DEVELOPMENT_PROCESS: Step[] = [
  {
    id: 'discovery',
    number: 1,
    title: 'Discovery & Planning',
    description: 'We start by understanding your vision, requirements, and business goals through detailed discussions and analysis.',
    details: [
      'Stakeholder interviews and requirement gathering',
      'Technical feasibility analysis and architecture planning',
      'Project scope definition and timeline creation',
      'Technology stack selection and tool recommendations',
      'Risk assessment and mitigation strategies',
    ],
    duration: '1-2 weeks',
    deliverables: [
      'Project specification document',
      'Technical architecture diagram',
      'Detailed project timeline',
      'Technology recommendations',
      'Risk assessment report',
    ],
    icon: '🔍',
    image: '/process/discovery.jpg',
    interactive: true,
  },
  {
    id: 'design',
    number: 2,
    title: 'Design & Prototyping',
    description: 'Our design team creates intuitive user experiences and interactive prototypes to validate concepts before development.',
    details: [
      'User experience research and persona development',
      'Wireframing and information architecture',
      'Visual design and brand integration',
      'Interactive prototype development',
      'User testing and feedback incorporation',
    ],
    duration: '1-3 weeks',
    deliverables: [
      'UX/UI design mockups',
      'Interactive prototype',
      'Design system and style guide',
      'User flow diagrams',
      'Design specifications',
    ],
    icon: '🎨',
    image: '/process/design.jpg',
    interactive: true,
  },
  {
    id: 'development',
    number: 3,
    title: 'AI-Accelerated Development',
    description: 'Our developers combine AI tools with human expertise to build your application faster without compromising quality.',
    details: [
      'AI-assisted code generation and optimization',
      'Agile development with regular sprint reviews',
      'Continuous integration and automated testing',
      'Real-time collaboration and progress tracking',
      'Code reviews and quality assurance',
    ],
    duration: '2-8 weeks',
    deliverables: [
      'Working application (alpha version)',
      'Source code with documentation',
      'Automated test suites',
      'CI/CD pipeline setup',
      'Progress reports and demos',
    ],
    icon: '⚡',
    image: '/process/development.jpg',
    interactive: true,
  },
  {
    id: 'testing',
    number: 4,
    title: 'Testing & Quality Assurance',
    description: 'Comprehensive testing ensures your application is secure, performant, and ready for production deployment.',
    details: [
      'Automated and manual testing procedures',
      'Performance optimization and load testing',
      'Security audits and vulnerability assessments',
      'Cross-browser and device compatibility testing',
      'User acceptance testing coordination',
    ],
    duration: '1-2 weeks',
    deliverables: [
      'Test reports and coverage analysis',
      'Performance benchmark results',
      'Security audit report',
      'Bug fixes and optimizations',
      'UAT documentation',
    ],
    icon: '🧪',
    image: '/process/testing.jpg',
  },
  {
    id: 'deployment',
    number: 5,
    title: 'Deployment & Launch',
    description: 'We handle the complete deployment process and provide ongoing support to ensure a smooth launch.',
    details: [
      'Production environment setup and configuration',
      'Domain and SSL certificate management',
      'Database migration and optimization',
      'Monitoring and analytics implementation',
      'Launch strategy and rollout planning',
    ],
    duration: '1 week',
    deliverables: [
      'Live production application',
      'Deployment documentation',
      'Monitoring dashboard setup',
      'Analytics implementation',
      'Launch checklist completion',
    ],
    icon: '🚀',
    image: '/process/deployment.jpg',
  },
  {
    id: 'support',
    number: 6,
    title: 'Support & Maintenance',
    description: 'Post-launch support ensures your application continues to perform optimally with regular updates and improvements.',
    details: [
      '24/7 monitoring and incident response',
      'Regular updates and security patches',
      'Performance optimization and scaling',
      'Feature enhancements and improvements',
      'Technical support and consultation',
    ],
    duration: 'Ongoing',
    deliverables: [
      'Monthly performance reports',
      'Regular software updates',
      'Security patches and fixes',
      'Feature enhancement roadmap',
      'Technical support documentation',
    ],
    icon: '🛠️',
    image: '/process/support.jpg',
  },
];

const AI_INTEGRATION_PROCESS: Step[] = [
  {
    id: 'ai-assessment',
    number: 1,
    title: 'AI Opportunity Assessment',
    description: 'We analyze your business processes to identify the best AI integration opportunities and expected ROI.',
    details: [
      'Business process analysis and mapping',
      'AI use case identification and prioritization',
      'Data availability and quality assessment',
      'ROI estimation and success metrics definition',
      'Technology readiness evaluation',
    ],
    duration: '1 week',
    deliverables: [
      'AI opportunity assessment report',
      'Use case prioritization matrix',
      'Data readiness evaluation',
      'ROI projections and timelines',
      'Implementation roadmap',
    ],
    icon: '🧠',
  },
  {
    id: 'data-preparation',
    number: 2,
    title: 'Data Preparation & Training',
    description: 'We prepare and optimize your data for AI model training, ensuring high-quality inputs for better results.',
    details: [
      'Data collection and cleaning processes',
      'Feature engineering and data transformation',
      'Training dataset creation and validation',
      'Data privacy and security implementation',
      'Model training and fine-tuning',
    ],
    duration: '2-4 weeks',
    deliverables: [
      'Clean and structured datasets',
      'Trained AI models',
      'Model performance metrics',
      'Data pipeline documentation',
      'Privacy compliance certification',
    ],
    icon: '📊',
  },
  {
    id: 'ai-integration',
    number: 3,
    title: 'AI Integration & Deployment',
    description: 'We seamlessly integrate AI capabilities into your existing systems with minimal disruption to your operations.',
    details: [
      'API development and integration',
      'Real-time AI processing implementation',
      'User interface and experience optimization',
      'System integration and testing',
      'Performance monitoring setup',
    ],
    duration: '2-3 weeks',
    deliverables: [
      'Integrated AI-powered application',
      'API documentation and endpoints',
      'User training materials',
      'Integration test reports',
      'Monitoring dashboard',
    ],
    icon: '🔗',
  },
];

const CONSULTING_PROCESS: Step[] = [
  {
    id: 'assessment',
    number: 1,
    title: 'Current State Assessment',
    description: 'Comprehensive evaluation of your existing technology infrastructure, processes, and team capabilities.',
    details: [
      'Technology audit and gap analysis',
      'Team skill assessment and evaluation',
      'Process efficiency review',
      'Security and compliance evaluation',
      'Competitive analysis and benchmarking',
    ],
    duration: '1-2 weeks',
    deliverables: [
      'Technology assessment report',
      'Gap analysis documentation',
      'Process improvement recommendations',
      'Security audit findings',
      'Competitive positioning analysis',
    ],
    icon: '📋',
  },
  {
    id: 'strategy',
    number: 2,
    title: 'Strategy Development',
    description: 'Create a comprehensive technology roadmap aligned with your business objectives and growth plans.',
    details: [
      'Technology roadmap creation',
      'Architecture design and planning',
      'Team scaling and hiring strategy',
      'Budget planning and resource allocation',
      'Timeline and milestone definition',
    ],
    duration: '1-3 weeks',
    deliverables: [
      'Technology roadmap document',
      'Architecture blueprints',
      'Team scaling plan',
      'Budget and resource plan',
      'Implementation timeline',
    ],
    icon: '🗺️',
  },
  {
    id: 'implementation',
    number: 3,
    title: 'Implementation Support',
    description: 'Hands-on support during implementation with regular check-ins and course corrections as needed.',
    details: [
      'Implementation guidance and oversight',
      'Regular progress reviews and adjustments',
      'Team training and knowledge transfer',
      'Vendor selection and management',
      'Quality assurance and testing support',
    ],
    duration: 'Ongoing',
    deliverables: [
      'Implementation progress reports',
      'Team training sessions',
      'Vendor evaluation reports',
      'Quality assurance documentation',
      'Knowledge transfer materials',
    ],
    icon: '🎯',
  },
];

function StepCard({ step, isActive, onClick, variant, showDuration, showDeliverables }: {
  step: Step;
  isActive?: boolean;
  onClick?: () => void;
  variant: string;
  showDuration: boolean;
  showDeliverables: boolean;
}) {
  if (variant === 'minimal') {
    return (
      <div className="flex items-start gap-4 p-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{step.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
          <p className="text-gray-600 text-sm">{step.description}</p>
          {showDuration && (
            <div className="mt-2">
              <Badge variant="outline" size="sm">{step.duration}</Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="flex items-start gap-6">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative z-10',
            isActive ? 'bg-blue-600' : 'bg-gray-400'
          )}>
            {step.number}
          </div>
          <Card className={cn(
            'flex-1 p-6 transition-all cursor-pointer',
            isActive ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'
          )} onClick={onClick}>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{step.icon}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                {showDuration && (
                  <Badge variant="primary" size="sm" className="mb-2">{step.duration}</Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-4">{step.description}</p>
            
            {isActive && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What we do:</h4>
                  <ul className="space-y-1">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {showDeliverables && (
                  <div>
                    <h4 className="font-semibold mb-2">You receive:</h4>
                    <div className="flex flex-wrap gap-2">
                      {step.deliverables.map((deliverable, index) => (
                        <Badge key={index} variant="outline" size="sm">{deliverable}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      'p-6 h-full transition-all cursor-pointer',
      isActive ? 'border-blue-500 shadow-lg' : 'hover:shadow-md'
    )} onClick={onClick}>
      <div className="text-center mb-4">
        <div className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3',
          isActive ? 'bg-blue-600' : 'bg-gray-400'
        )}>
          {step.number}
        </div>
        <span className="text-3xl mb-2 block">{step.icon}</span>
        <h3 className="text-xl font-bold">{step.title}</h3>
        {showDuration && (
          <Badge variant="primary" size="sm" className="mt-2">{step.duration}</Badge>
        )}
      </div>
      
      <p className="text-gray-600 text-center mb-4">{step.description}</p>
      
      {isActive && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Process Details:</h4>
            <ul className="space-y-1">
              {step.details.slice(0, 3).map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {showDeliverables && (
            <div>
              <h4 className="font-semibold mb-2">Key Deliverables:</h4>
              <div className="flex flex-wrap gap-1">
                {step.deliverables.slice(0, 3).map((deliverable, index) => (
                  <Badge key={index} variant="outline" size="sm">{deliverable}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function HowItWorks({
  title = 'How We Work',
  subtitle = 'Our proven process combines AI acceleration with human expertise to deliver exceptional results in record time.',
  variant = 'default',
  showDuration = true,
  showDeliverables = true,
  process = 'development',
  className,
}: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState(1);

  const getProcessSteps = () => {
    switch (process) {
      case 'ai-integration':
        return AI_INTEGRATION_PROCESS;
      case 'consulting':
        return CONSULTING_PROCESS;
      case 'development':
      default:
        return DEVELOPMENT_PROCESS;
    }
  };

  const steps = getProcessSteps();
  const currentStep = steps.find(step => step.number === activeStep);

  if (variant === 'interactive') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Step Navigation */}
              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      'p-4 rounded-lg border-2 cursor-pointer transition-all',
                      activeStep === step.number
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setActiveStep(step.number)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                        activeStep === step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      )}>
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        {showDuration && (
                          <Badge variant="outline" size="sm" className="mt-1">{step.duration}</Badge>
                        )}
                      </div>
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Step Details */}
              <div className="lg:sticky lg:top-24">
                {currentStep && (
                  <Card className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">{currentStep.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{currentStep.title}</h2>
                        {showDuration && (
                          <Badge variant="primary" className="mt-1">{currentStep.duration}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{currentStep.description}</p>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">What We Do:</h4>
                        <ul className="space-y-2">
                          {currentStep.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {showDeliverables && (
                        <div>
                          <h4 className="font-semibold mb-3">What You Get:</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {currentStep.deliverables.map((deliverable, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm">{deliverable}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'timeline') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isActive={activeStep === step.number}
                  onClick={() => setActiveStep(step.number)}
                  variant={variant}
                  showDuration={showDuration}
                  showDeliverables={showDeliverables}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className={cn('py-16', className)}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-xl text-gray-600">{subtitle}</p>
            </div>
            
            <div className="space-y-6">
              {steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  variant={variant}
                  showDuration={showDuration}
                  showDeliverables={showDeliverables}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                isActive={activeStep === step.number}
                onClick={() => setActiveStep(step.number)}
                variant={variant}
                showDuration={showDuration}
                showDeliverables={showDeliverables}
              />
            ))}
          </div>
          
          {/* Process Summary */}
          <div className="mt-12 bg-blue-50 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Why Our Process Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    ⚡
                  </div>
                  <h4 className="font-semibold mb-2">AI-Accelerated</h4>
                  <p className="text-sm text-gray-600">
                    We use AI to speed up development while maintaining high quality standards.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    🎯
                  </div>
                  <h4 className="font-semibold mb-2">Results-Focused</h4>
                  <p className="text-sm text-gray-600">
                    Every step is designed to deliver measurable business value and ROI.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    🤝
                  </div>
                  <h4 className="font-semibold mb-2">Collaborative</h4>
                  <p className="text-sm text-gray-600">
                    We work closely with your team to ensure seamless integration and knowledge transfer.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button size="lg">
                  Start Your Project Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}