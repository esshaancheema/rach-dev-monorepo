'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  CogIcon,
  PhotoIcon,
  TagIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  DocumentIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BeakerIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  TemplateMarketplaceService,
  CustomTemplate,
  TemplateVariable,
  TemplateCategory,
  TemplatePricing,
  ProjectTemplate
} from '@/lib/enterprise/template-marketplace';
import { ProjectFile } from '@/lib/ai/enhanced-code-generator';

interface TemplateBuilderProps {
  organizationId: string;
  teamId?: string;
  createdBy: string;
  initialTemplate?: CustomTemplate;
  onTemplateCreated?: (template: CustomTemplate) => void;
  onTemplatePublished?: (template: ProjectTemplate) => void;
  className?: string;
}

type BuilderStep = 'basic' | 'files' | 'variables' | 'config' | 'preview' | 'publish';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export default function TemplateBuilder({
  organizationId,
  teamId,
  createdBy,
  initialTemplate,
  onTemplateCreated,
  onTemplatePublished,
  className
}: TemplateBuilderProps) {
  const [marketplaceService] = useState(() => new TemplateMarketplaceService());
  
  // Current step
  const [currentStep, setCurrentStep] = useState<BuilderStep>('basic');
  
  // Template data
  const [template, setTemplate] = useState<Partial<CustomTemplate>>({
    name: '',
    description: '',
    organizationId,
    teamId,
    createdBy,
    config: {
      framework: 'react',
      styling: 'tailwind',
      features: [],
      integrations: [],
      deployment: [],
      testing: false,
      documentation: false,
      ci: false,
      monitoring: false
    },
    files: [],
    variables: [],
    isPublic: false
  });
  
  // Publishing data
  const [publishData, setPublishData] = useState<{
    category: TemplateCategory;
    tags: string[];
    pricing: TemplatePricing;
    license: string;
    documentation?: string;
    screenshots: string[];
  }>({
    category: 'web-app',
    tags: [],
    pricing: { type: 'free' },
    license: 'MIT',
    screenshots: []
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [previewMode, setPreviewMode] = useState<'code' | 'variables' | 'config'>('code');

  const steps: { id: BuilderStep; label: string; description: string; icon: any }[] = [
    { id: 'basic', label: 'Basic Info', description: 'Template name and description', icon: DocumentTextIcon },
    { id: 'files', label: 'Files', description: 'Add template files and structure', icon: FolderIcon },
    { id: 'variables', label: 'Variables', description: 'Define customizable variables', icon: CogIcon },
    { id: 'config', label: 'Configuration', description: 'Framework and feature settings', icon: BeakerIcon },
    { id: 'preview', label: 'Preview', description: 'Review your template', icon: EyeIcon },
    { id: 'publish', label: 'Publish', description: 'Publish to marketplace', icon: RocketLaunchIcon }
  ];

  const categories: { id: TemplateCategory; label: string }[] = [
    { id: 'web-app', label: 'Web Application' },
    { id: 'mobile-app', label: 'Mobile Application' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'e-commerce', label: 'E-commerce' },
    { id: 'landing-page', label: 'Landing Page' },
    { id: 'api', label: 'API' },
    { id: 'component-library', label: 'Component Library' },
    { id: 'ai-ml', label: 'AI/ML' }
  ];

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  useEffect(() => {
    validateCurrentStep();
  }, [currentStep, template, publishData]);

  const validateCurrentStep = () => {
    const errors: ValidationError[] = [];
    
    switch (currentStep) {
      case 'basic':
        if (!template.name?.trim()) {
          errors.push({ field: 'name', message: 'Template name is required', severity: 'error' });
        }
        if (!template.description?.trim()) {
          errors.push({ field: 'description', message: 'Description is required', severity: 'error' });
        }
        break;
        
      case 'files':
        if (!template.files?.length) {
          errors.push({ field: 'files', message: 'At least one file is required', severity: 'error' });
        }
        break;
        
      case 'config':
        if (!template.config?.framework) {
          errors.push({ field: 'framework', message: 'Framework selection is required', severity: 'error' });
        }
        break;
        
      case 'publish':
        if (!publishData.category) {
          errors.push({ field: 'category', message: 'Category is required', severity: 'error' });
        }
        if (!publishData.tags.length) {
          errors.push({ field: 'tags', message: 'At least one tag is required', severity: 'warning' });
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const updateTemplate = (updates: Partial<CustomTemplate>) => {
    setTemplate(prev => ({ ...prev, ...updates }));
  };

  const addFile = () => {
    const newFile: ProjectFile = {
      path: 'new-file.tsx',
      content: '// New file content\nexport default function NewComponent() {\n  return <div>Hello World</div>;\n}',
      type: 'component',
      dependencies: []
    };
    
    updateTemplate({
      files: [...(template.files || []), newFile]
    });
  };

  const updateFile = (index: number, updates: Partial<ProjectFile>) => {
    const updatedFiles = [...(template.files || [])];
    updatedFiles[index] = { ...updatedFiles[index], ...updates };
    updateTemplate({ files: updatedFiles });
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...(template.files || [])];
    updatedFiles.splice(index, 1);
    updateTemplate({ files: updatedFiles });
  };

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      key: 'newVariable',
      label: 'New Variable',
      description: 'Description of the new variable',
      type: 'string',
      required: false,
      defaultValue: '',
      placeholder: 'Enter value'
    };
    
    updateTemplate({
      variables: [...(template.variables || []), newVariable]
    });
  };

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const updatedVariables = [...(template.variables || [])];
    updatedVariables[index] = { ...updatedVariables[index], ...updates };
    updateTemplate({ variables: updatedVariables });
  };

  const removeVariable = (index: number) => {
    const updatedVariables = [...(template.variables || [])];
    updatedVariables.splice(index, 1);
    updateTemplate({ variables: updatedVariables });
  };

  const handleSaveTemplate = async () => {
    setIsLoading(true);
    try {
      const savedTemplate = await marketplaceService.createCustomTemplate(
        organizationId,
        template
      );
      onTemplateCreated?.(savedTemplate);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishTemplate = async () => {
    if (!template.id) {
      await handleSaveTemplate();
    }
    
    setIsLoading(true);
    try {
      const publishedTemplate = await marketplaceService.publishTemplate(
        template.id!,
        publishData
      );
      onTemplatePublished?.(publishedTemplate);
    } catch (error) {
      console.error('Failed to publish template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToNext = () => {
    return !validationErrors.some(error => error.severity === 'error');
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1 && canProceedToNext()) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const renderFileTree = (files: ProjectFile[]) => {
    const fileTree = files.reduce((tree, file) => {
      const parts = file.path.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i === parts.length - 1) {
          // It's a file
          current.files = current.files || [];
          current.files.push({ file, index: files.indexOf(file) });
        } else {
          // It's a directory
          current.directories = current.directories || {};
          current.directories[part] = current.directories[part] || {};
          current = current.directories[part];
        }
      }
      
      return tree;
    }, {} as any);

    const renderTreeNode = (node: any, path = '', level = 0) => {
      return (
        <div key={path} style={{ marginLeft: `${level * 16}px` }}>
          {/* Directories */}
          {node.directories && Object.entries(node.directories).map(([name, subNode]) => {
            const fullPath = path ? `${path}/${name}` : name;
            const isExpanded = expandedFolders.has(fullPath);
            
            return (
              <div key={fullPath}>
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedFolders);
                    if (isExpanded) {
                      newExpanded.delete(fullPath);
                    } else {
                      newExpanded.add(fullPath);
                    }
                    setExpandedFolders(newExpanded);
                  }}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded text-left w-full"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                  <FolderIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{name}</span>
                </button>
                
                {isExpanded && renderTreeNode(subNode, fullPath, level + 1)}
              </div>
            );
          })}
          
          {/* Files */}
          {node.files?.map(({ file, index }: any) => (
            <button
              key={index}
              onClick={() => setSelectedFile(file)}
              className={cn(
                "flex items-center space-x-2 p-2 hover:bg-gray-100 rounded text-left w-full",
                selectedFile === file && "bg-blue-50 border-l-2 border-blue-500"
              )}
            >
              <div className="w-4" /> {/* Spacer for alignment */}
              <DocumentIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{file.path.split('/').pop()}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="ml-auto p-1 text-red-500 hover:bg-red-100 rounded"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      );
    };

    return renderTreeNode(fileTree);
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Template Builder</h1>
            <p className="text-purple-100">Create and publish custom project templates</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveTemplate}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex space-x-8">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center space-x-3 py-2 px-4 rounded-lg transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : 
                    isCompleted ? "text-green-600" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isActive ? "bg-blue-600 text-white" :
                    isCompleted ? "bg-green-600 text-white" : "bg-gray-200"
                  )}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{step.label}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 space-y-2">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg flex items-center space-x-3",
                  error.severity === 'error' ? "bg-red-50 text-red-800" :
                  error.severity === 'warning' ? "bg-yellow-50 text-yellow-800" :
                  "bg-blue-50 text-blue-800"
                )}
              >
                {error.severity === 'error' ? (
                  <XCircleIcon className="h-5 w-5" />
                ) : error.severity === 'warning' ? (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                ) : (
                  <InformationCircleIcon className="h-5 w-5" />
                )}
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Basic Info Step */}
        {currentStep === 'basic' && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={template.name || ''}
                onChange={(e) => updateTemplate({ name: e.target.value })}
                placeholder="Enter template name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={template.description || ''}
                onChange={(e) => updateTemplate({ description: e.target.value })}
                placeholder="Describe what this template does and when to use it"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={template.isPublic || false}
                  onChange={(e) => updateTemplate({ isPublic: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Make this template public within organization
                </span>
              </label>
            </div>
          </motion.div>
        )}

        {/* Files Step */}
        {currentStep === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Template Files</h3>
              <button
                onClick={addFile}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add File</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Tree */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">File Structure</h4>
                <div className="space-y-1">
                  {template.files && template.files.length > 0 ? (
                    renderFileTree(template.files)
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FolderIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No files added yet</p>
                      <p className="text-sm">Click "Add File" to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Editor */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {selectedFile ? `Editing: ${selectedFile.path}` : 'Select a file to edit'}
                </h4>
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Path
                      </label>
                      <input
                        type="text"
                        value={selectedFile.path}
                        onChange={(e) => {
                          const index = template.files?.indexOf(selectedFile) ?? -1;
                          if (index >= 0) {
                            updateFile(index, { path: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={selectedFile.content}
                        onChange={(e) => {
                          const index = template.files?.indexOf(selectedFile) ?? -1;
                          if (index >= 0) {
                            updateFile(index, { content: e.target.value });
                          }
                        }}
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="Enter file content..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <DocumentIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Select a file from the tree to edit</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Variables Step */}
        {currentStep === 'variables' && (
          <motion.div
            key="variables"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Template Variables</h3>
                <p className="text-sm text-gray-600">Define customizable variables for your template</p>
              </div>
              <button
                onClick={addVariable}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Variable</span>
              </button>
            </div>

            <div className="space-y-4">
              {template.variables && template.variables.length > 0 ? (
                template.variables.map((variable, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variable Key
                        </label>
                        <input
                          type="text"
                          value={variable.key}
                          onChange={(e) => updateVariable(index, { key: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={variable.label}
                          onChange={(e) => updateVariable(index, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, { description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={variable.type}
                          onChange={(e) => updateVariable(index, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="select">Select</option>
                          <option value="multiselect">Multi-select</option>
                          <option value="color">Color</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Value
                        </label>
                        <input
                          type="text"
                          value={variable.defaultValue || ''}
                          onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => updateVariable(index, { required: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                      
                      <button
                        onClick={() => removeVariable(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <CogIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Variables</h3>
                  <p className="text-gray-600 mb-4">Add variables to make your template customizable</p>
                  <button
                    onClick={addVariable}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add First Variable
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 'basic'}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            {currentStep === 'publish' ? (
              <button
                onClick={handlePublishTemplate}
                disabled={!canProceedToNext() || isLoading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Publishing...' : 'Publish Template'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}