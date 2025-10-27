'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
  ComputerDesktopIcon,
  HomeIcon,
  CodeBracketIcon,
  UserGroupIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BeakerIcon,
  BuildingStorefrontIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Import existing components
import AIAppBuilder from '@/components/interactive-hero/AIAppBuilder';
import MultiFileProjectViewer from '@/components/generation/MultiFileProjectViewer';
import CollaborativeCodeEditor from '@/components/collaboration/CollaborativeCodeEditor';
import CodeAnalysisDashboard from '@/components/analysis/CodeAnalysisDashboard';
import DeploymentInterface from '@/components/deployment/DeploymentInterface';
import LearningAssistantComponent from '@/components/learning/LearningAssistant';
import TeamManagementDashboard from '@/components/enterprise/TeamManagementDashboard';
import TemplateMarketplace from '@/components/enterprise/TemplateMarketplace';
import SecurityDashboard from '@/components/enterprise/SecurityDashboard';
import AnalyticsDashboard from '@/components/enterprise/AnalyticsDashboard';
import CodeReviewDashboard from '@/components/ai/CodeReviewDashboard';
import CICDDashboard from '@/components/ci-cd/CICDDashboard';

interface UnifiedAIBuilderDashboardProps {
  initialPrompt: string;
  userId: string;
}

type ActiveView = 'code' | 'collaborate' | 'analyze' | 'deploy' | 'learn' | 'enterprise' | 'templates' | 'security' | 'analytics' | 'review' | 'cicd' | 'settings';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  code?: string;
  framework?: 'react' | 'vue' | 'vanilla';
}

export default function UnifiedAIBuilderDashboard({
  initialPrompt,
  userId
}: UnifiedAIBuilderDashboardProps) {
  // Start with code view when there's an initial prompt, otherwise default view
  const [activeView, setActiveView] = useState<ActiveView>('code');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  // Auto-process initial prompt when provided
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      // Add initial prompt to messages for display
      const initialMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: initialPrompt,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      
      // Auto-submit the prompt
      handlePromptSubmit(initialPrompt);
    }
  }, [initialPrompt]);

  // Navigation items for features
  const navigationItems = [
    {
      id: 'code',
      label: 'Code Generation',
      icon: CodeBracketIcon,
      description: 'AI-powered multi-file project generation'
    },
    {
      id: 'collaborate',
      label: 'Collaboration',
      icon: UserGroupIcon,
      description: 'Real-time collaborative editing'
    },
    {
      id: 'analyze',
      label: 'Code Analysis',
      icon: ChartBarIcon,
      description: 'Comprehensive code quality analysis'
    },
    {
      id: 'deploy',
      label: 'Deployment',
      icon: RocketLaunchIcon,
      description: 'One-click deployment to multiple platforms'
    },
    {
      id: 'learn',
      label: 'AI Learning',
      icon: AcademicCapIcon,
      description: 'Personalized learning assistant'
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      icon: BuildingOfficeIcon,
      description: 'Team management and collaboration'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: CubeIcon,
      description: 'Browse and use project templates'
    },
    {
      id: 'security',
      label: 'Security',
      icon: ShieldCheckIcon,
      description: 'Enterprise authentication and security'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      description: 'Comprehensive analytics and reporting'
    },
    {
      id: 'review',
      label: 'Code Review',
      icon: DocumentTextIcon,
      description: 'AI-powered code review and quality gates'
    },
    {
      id: 'cicd',
      label: 'CI/CD',
      icon: BuildingStorefrontIcon,
      description: 'Continuous integration and deployment pipelines'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: CogIcon,
      description: 'Configure preferences and options'
    }
  ];

  // Calculate prompts remaining (3 for guests)
  const totalPrompts = isAuthenticated ? Infinity : 3;
  const promptsRemaining = isAuthenticated ? Infinity : Math.max(0, totalPrompts - promptsUsed);

  // Mock prompt submission handler (would be connected to real API)
  const handlePromptSubmit = async (prompt: string) => {
    setPromptsUsed(prev => prev + 1);
    
    // Mock response - add AI response to messages
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `Generated a React component based on your request: "${prompt}"`,
      timestamp: new Date(),
      code: `// Generated code for: ${prompt}\nfunction App() {\n  return <div>Hello World</div>;\n}`,
      framework: 'react'
    };
    
    setMessages(prev => [...prev, aiResponse]);
    
    // Mock project creation
    setCurrentProject({
      id: Date.now().toString(),
      files: [
        {
          name: 'App.js',
          content: aiResponse.code,
          language: 'javascript'
        }
      ],
      framework: 'react'
    });
    
    return {
      code: aiResponse.code,
      framework: 'react',
      description: aiResponse.content
    };
  };

  const handleAuthRequired = () => {
    setShowAuthGate(true);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'code':
        return (
          <div className="h-full">
            <AIAppBuilder
              initialPrompt={initialPrompt}
              isAuthenticated={isAuthenticated}
              promptsUsed={promptsUsed}
              promptsRemaining={promptsRemaining}
              totalPrompts={totalPrompts}
              onAuthRequired={handleAuthRequired}
              onPromptSubmit={handlePromptSubmit}
              className="h-full"
            />
          </div>
        );
      
      case 'collaborate':
        return currentProject ? (
          <CollaborativeCodeEditor
            projectId={currentProject.id}
            files={currentProject.files}
            currentUserId={userId}
            initialFile={null}
            onFileChange={() => {}}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Available</h3>
              <p className="text-gray-600 mb-4">Generate a project first to start collaborating</p>
              <button
                onClick={() => setActiveView('code')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Start with Code Generation
              </button>
            </div>
          </div>
        );
      
      case 'analyze':
        return currentProject ? (
          <CodeAnalysisDashboard
            files={currentProject.files}
            framework={currentProject.framework}
            onIssueSelect={() => {}}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Available</h3>
              <p className="text-gray-600 mb-4">Generate a project first to analyze code quality</p>
              <button
                onClick={() => setActiveView('code')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Start with Code Generation
              </button>
            </div>
          </div>
        );
      
      case 'deploy':
        return currentProject ? (
          <DeploymentInterface
            project={currentProject}
            onDeploymentComplete={(result) => {
              console.log('Deployment completed:', result);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RocketLaunchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Available</h3>
              <p className="text-gray-600 mb-4">Generate a project first to deploy</p>
              <button
                onClick={() => setActiveView('code')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Start with Code Generation
              </button>
            </div>
          </div>
        );
      
      case 'learn':
        return (
          <LearningAssistantComponent
            files={currentProject?.files || []}
            framework={currentProject?.framework || 'react'}
            userId={userId}
            analysisResult={null}
            selectedFile={null}
            selectedLine={undefined}
            onTutorialStart={(tutorialId) => {
              console.log('Starting tutorial:', tutorialId);
            }}
          />
        );
      
      case 'enterprise':
        return (
          <TeamManagementDashboard
            organizationId="org_sample"
            currentUserId={userId}
          />
        );
      
      case 'templates':
        return (
          <TemplateMarketplace
            organizationId="org_sample"
            onTemplateSelect={(template) => {
              console.log('Template selected:', template);
            }}
            onTemplateUse={(templateId, variables) => {
              console.log('Template used:', templateId, variables);
            }}
          />
        );
      
      case 'security':
        return (
          <SecurityDashboard
            organizationId="org_sample"
            currentUserId={userId}
          />
        );
      
      case 'analytics':
        return (
          <AnalyticsDashboard
            organizationId="org_sample"
            currentUserId={userId}
          />
        );
      
      case 'review':
        return (
          <CodeReviewDashboard
            organizationId="org_sample"
            currentUserId={userId}
            projectId={currentProject?.id}
          />
        );
      
      case 'cicd':
        return (
          <CICDDashboard
            organizationId="org_sample"
            currentUserId={userId}
            projectId={currentProject?.id}
          />
        );
      
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings & Preferences</h2>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <p className="text-gray-600">Settings panel will be implemented here.</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/logo/zoptal-icon.svg"
                  alt="Zoptal"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <Image
                  src="/images/logo/zoptal-text.svg"
                  alt="Zoptal AI Builder"
                  width={120}
                  height={30}
                  className="h-7 w-auto max-w-[120px]"
                />
              </Link>
            </div>

            {/* Feature Navigation - Desktop */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.slice(0, 6).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeView === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  title={item.description}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Prompts: {promptsUsed}/{isAuthenticated ? '∞' : totalPrompts}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-900">
                  {isAuthenticated ? 'User' : 'Guest'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Lovable.dev-style Split Screen Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile Feature Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold">Features</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ActiveView);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors",
                      activeView === item.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Backdrop */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Panel - Chat Interface (40% width) */}
        {activeView === 'code' && (
          <div className="w-full lg:w-2/5 bg-white border-r border-gray-200 flex flex-col">
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </div>
        )}

        {/* Right Panel - Preview & Features (60% width) */}
        <div className={cn(
          "flex-1 flex flex-col",
          activeView === 'code' ? "lg:w-3/5" : "w-full"
        )}>
          {/* Feature Tabs - Top Navigation */}
          {activeView !== 'code' && (
            <div className="bg-white border-b border-gray-200 px-4">
              <div className="flex space-x-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as ActiveView)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                      activeView === item.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                    title={item.description}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Generation Split View */}
          {activeView === 'code' && (
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Preview Area for Code Generation */}
              <div className="flex-1 bg-gray-50 p-4">
                <div className="h-full bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                    <div className="flex items-center space-x-2">
                      {navigationItems.slice(1, 6).map(item => (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id as ActiveView)}
                          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title={item.description}
                        >
                          <item.icon className="w-3 h-3" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[calc(100%-2rem)] bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <ComputerDesktopIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Generated code preview will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Features - Full Width */}
          {activeView !== 'code' && (
            <div className="flex-1 overflow-hidden">
              <motion.div
                key={activeView}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-auto"
              >
                {renderMainContent()}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}