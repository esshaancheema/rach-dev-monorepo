'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
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
  CogIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { EnhancedCodeGenerator, EnhancedGenerationResult } from '@/lib/ai/enhanced-code-generator';
import { CodeAnalyzer } from '@/lib/ai/code-analyzer';
import { useCollaboration } from '@/hooks/useCollaboration';
import { DeploymentManager } from '@/lib/deployment/deployment-manager';
import { LearningAssistant } from '@/lib/ai/learning-assistant';

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

interface AIBuilderDashboardProps {
  initialProject?: EnhancedGenerationResult;
  userId: string;
  className?: string;
}

type ActiveView = 'code' | 'collaborate' | 'analyze' | 'deploy' | 'learn' | 'enterprise' | 'templates' | 'security' | 'analytics' | 'review' | 'cicd' | 'settings';

export default function AIBuilderDashboard({
  initialProject,
  userId,
  className
}: AIBuilderDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('code');
  const [currentProject, setCurrentProject] = useState<EnhancedGenerationResult | null>(initialProject || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(currentProject?.files[0] || null);
  const [selectedLine, setSelectedLine] = useState<number | undefined>();
  
  // Initialize services
  const [codeGenerator] = useState(() => new EnhancedCodeGenerator());
  const [analyzer] = useState(() => new CodeAnalyzer());
  const [deploymentManager] = useState(() => new DeploymentManager());
  const [learningAssistant] = useState(() => new LearningAssistant());

  const [analysisResult, setAnalysisResult] = useState(null);

  // Collaboration
  const collaboration = useCollaboration(currentProject?.id || 'default-project', userId);

  useEffect(() => {
    if (currentProject?.files) {
      runAnalysis();
    }
  }, [currentProject]);

  const runAnalysis = async () => {
    if (!currentProject?.files) return;
    
    try {
      const result = await analyzer.analyzeProject(currentProject.files, currentProject.framework);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const generateProject = async (prompt: string, options: any = {}) => {
    setIsGenerating(true);
    try {
      const project = await codeGenerator.generateAdvancedProject(prompt, {
        framework: 'react',
        complexity: 'moderate',
        includeTests: true,
        includeDocs: true,
        ...options
      });

      setCurrentProject(project);
      setSelectedFile(project.files[0] || null);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (file: any, line?: number) => {
    setSelectedFile(file);
    setSelectedLine(line);
    
    // Switch to appropriate view if needed
    if (activeView === 'learn' && file) {
      // Learning assistant will auto-explain the selected code
    }
  };

  const handleFileChange = (file: any, content: string) => {
    if (!currentProject) return;
    
    // Update the file content
    const updatedFiles = currentProject.files.map(f => 
      f.path === file.path ? { ...f, content } : f
    );
    
    setCurrentProject({
      ...currentProject,
      files: updatedFiles
    });

    // Re-run analysis after a delay
    setTimeout(runAnalysis, 1000);
  };

  const handleTutorialStart = (tutorialId: string) => {
    // Handle tutorial start - could open in a new tab or modal
    console.log('Starting tutorial:', tutorialId);
  };

  const viewItems = [
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

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI App Builder</h1>
              <p className="text-gray-600">
                {currentProject ? `${currentProject.title} • ${currentProject.framework}` : 'No project loaded'}
              </p>
            </div>
            
            {!currentProject && (
              <button
                onClick={() => generateProject('Create a modern todo application with React')}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Sample Project'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {viewItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={cn(
                  "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors",
                  activeView === item.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                title={item.description}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Code Generation View */}
        {activeView === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Multi-File Project Generation</h2>
              {currentProject ? (
                <MultiFileProjectViewer 
                  project={currentProject}
                  onFileSelect={handleFileSelect}
                  onFileChange={handleFileChange}
                />
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <CodeBracketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Loaded</h3>
                  <p className="text-gray-600 mb-6">Generate a new project to get started</p>
                  <button
                    onClick={() => generateProject('Create a modern React dashboard with charts and tables')}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating Project...' : 'Generate Demo Project'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Collaboration View */}
        {activeView === 'collaborate' && currentProject && (
          <motion.div
            key="collaborate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Collaboration</h2>
            <CollaborativeCodeEditor
              projectId={currentProject.id}
              files={currentProject.files}
              currentUserId={userId}
              initialFile={selectedFile}
              onFileChange={handleFileChange}
            />
          </motion.div>
        )}

        {/* Analysis View */}
        {activeView === 'analyze' && currentProject && (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Analysis & Optimization</h2>
            <CodeAnalysisDashboard
              files={currentProject.files}
              framework={currentProject.framework}
              onIssueSelect={(issue) => {
                const file = currentProject.files.find(f => f.path === issue.file);
                if (file) {
                  handleFileSelect(file, issue.line);
                }
              }}
            />
          </motion.div>
        )}

        {/* Deployment View */}
        {activeView === 'deploy' && currentProject && (
          <motion.div
            key="deploy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">One-Click Deployment</h2>
            <DeploymentInterface
              project={currentProject}
              onDeploymentComplete={(result) => {
                console.log('Deployment completed:', result);
              }}
            />
          </motion.div>
        )}

        {/* Learning Assistant View */}
        {activeView === 'learn' && currentProject && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Learning Assistant</h2>
            <LearningAssistantComponent
              files={currentProject.files}
              framework={currentProject.framework}
              userId={userId}
              analysisResult={analysisResult}
              selectedFile={selectedFile}
              selectedLine={selectedLine}
              onTutorialStart={handleTutorialStart}
            />
          </motion.div>
        )}

        {/* Enterprise Team Management View */}
        {activeView === 'enterprise' && (
          <motion.div
            key="enterprise"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Team Management</h2>
            <TeamManagementDashboard
              organizationId="org_sample"
              currentUserId={userId}
            />
          </motion.div>
        )}

        {/* Template Marketplace View */}
        {activeView === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TemplateMarketplace
              organizationId="org_sample"
              onTemplateSelect={(template) => {
                console.log('Template selected:', template);
              }}
              onTemplateUse={(templateId, variables) => {
                console.log('Template used:', templateId, variables);
                // Here you would integrate with the code generator to create a project from the template
              }}
            />
          </motion.div>
        )}

        {/* Security Dashboard View */}
        {activeView === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SecurityDashboard
              organizationId="org_sample"
              currentUserId={userId}
            />
          </motion.div>
        )}

        {/* Analytics Dashboard View */}
        {activeView === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnalyticsDashboard
              organizationId="org_sample"
              currentUserId={userId}
            />
          </motion.div>
        )}

        {/* Code Review Dashboard View */}
        {activeView === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CodeReviewDashboard
              organizationId="org_sample"
              currentUserId={userId}
              projectId={currentProject?.id}
            />
          </motion.div>
        )}

        {/* CI/CD Dashboard View */}
        {activeView === 'cicd' && (
          <motion.div
            key="cicd"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CICDDashboard
              organizationId="org_sample"
              currentUserId={userId}
              projectId={currentProject?.id}
            />
          </motion.div>
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings & Preferences</h2>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <p className="text-gray-600">Settings panel will be implemented here.</p>
              <p className="text-gray-600 mt-2">This would include:</p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Code generation preferences</li>
                <li>Collaboration settings</li>
                <li>Analysis thresholds</li>
                <li>Deployment configurations</li>
                <li>Learning preferences</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* No Project State for certain views */}
        {(activeView === 'collaborate' || activeView === 'analyze' || activeView === 'deploy' || activeView === 'learn') && !currentProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Available</h3>
              <p className="text-gray-600 mb-6">Generate a project first to access this feature</p>
              <button
                onClick={() => setActiveView('code')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Go to Code Generation
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}