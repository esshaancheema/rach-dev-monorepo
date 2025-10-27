'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  StopIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CubeIcon,
  CloudArrowUpIcon,
  ShareIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ProjectFile, EnhancedGenerationResult, DeploymentGuide } from '@/lib/ai/enhanced-code-generator';

interface MultiFileProjectViewerProps {
  project: EnhancedGenerationResult;
  className?: string;
  onFileSelect?: (file: ProjectFile) => void;
  onDeploymentStart?: (guide: DeploymentGuide) => void;
  onProjectDownload?: () => void;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  file?: ProjectFile;
  isOpen?: boolean;
}

export default function MultiFileProjectViewer({
  project,
  className,
  onFileSelect,
  onDeploymentStart,
  onProjectDownload
}: MultiFileProjectViewerProps) {
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'files' | 'preview' | 'deployment' | 'insights'>('files');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Build file tree from project files
  useEffect(() => {
    const tree = buildFileTree(project.files);
    setFileTree(tree);
    
    // Auto-select entry point file
    const entryFile = project.files.find(f => f.isEntryPoint) || project.files[0];
    if (entryFile) {
      setActiveFile(entryFile);
      onFileSelect?.(entryFile);
    }
  }, [project.files, onFileSelect]);

  const buildFileTree = (files: ProjectFile[]): FileTreeNode[] => {
    const root: Record<string, FileTreeNode> = {};

    files.forEach(file => {
      const parts = file.path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: index === parts.length - 1 ? undefined : {},
            file: index === parts.length - 1 ? file : undefined
          };
        }

        if (index < parts.length - 1) {
          current = current[part].children as Record<string, FileTreeNode>;
        }
      });
    });

    const convertToArray = (nodes: Record<string, FileTreeNode>): FileTreeNode[] => {
      return Object.values(nodes).map(node => ({
        ...node,
        children: node.children ? convertToArray(node.children as Record<string, FileTreeNode>) : undefined
      })).sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    };

    return convertToArray(root);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleFileSelect = (file: ProjectFile) => {
    setActiveFile(file);
    onFileSelect?.(file);
  };

  const getFileIcon = (file: ProjectFile) => {
    const ext = file.path.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <CodeBracketIcon className="h-4 w-4 text-blue-500" />;
      case 'vue':
        return <CodeBracketIcon className="h-4 w-4 text-green-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <DocumentIcon className="h-4 w-4 text-pink-500" />;
      case 'html':
        return <DocumentIcon className="h-4 w-4 text-orange-500" />;
      case 'json':
        return <DocumentIcon className="h-4 w-4 text-yellow-500" />;
      case 'md':
        return <DocumentIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFileTypeColor = (type: ProjectFile['type']) => {
    switch (type) {
      case 'component': return 'bg-blue-100 text-blue-800';
      case 'page': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'utility': return 'bg-orange-100 text-orange-800';
      case 'config': return 'bg-gray-100 text-gray-800';
      case 'style': return 'bg-pink-100 text-pink-800';
      case 'test': return 'bg-yellow-100 text-yellow-800';
      case 'docs': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFileTreeNode = (node: FileTreeNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = activeFile?.path === node.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className={cn(
              "flex items-center w-full text-left px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors",
              depth > 0 && "ml-4"
            )}
          >
            <div className="flex items-center space-x-1">
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              )}
              {isExpanded ? (
                <FolderOpenIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <FolderIcon className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm font-medium text-gray-700">{node.name}</span>
            </div>
          </button>
          
          {isExpanded && node.children && (
            <div className="ml-2">
              {node.children.map(child => renderFileTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={node.path}
        onClick={() => node.file && handleFileSelect(node.file)}
        className={cn(
          "flex items-center w-full text-left px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group",
          depth > 0 && "ml-6",
          isSelected && "bg-blue-100 text-blue-900"
        )}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getFileIcon(node.file!)}
          <span className="text-sm text-gray-700 truncate">{node.name}</span>
          {node.file?.isEntryPoint && (
            <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Entry</span>
          )}
        </div>
        
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
          getFileTypeColor(node.file!.type)
        )}>
          {node.file!.type}
        </span>
      </button>
    );
  };

  const generatePreviewHTML = () => {
    // Create a sandboxed HTML preview
    const entryFile = project.files.find(f => f.isEntryPoint);
    const cssFiles = project.files.filter(f => f.path.endsWith('.css'));
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${project.framework === 'react' ? '<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' : ''}
  ${project.framework === 'vue' ? '<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>' : ''}
  ${cssFiles.map(file => `<style>${file.content}</style>`).join('\n')}
</head>
<body>
  <div id="app"></div>
  <script type="module">
    ${entryFile?.content || '// No entry file found'}
  </script>
</body>
</html>`;
  };

  const handlePreviewRefresh = () => {
    setIsPreviewLoading(true);
    setTimeout(() => setIsPreviewLoading(false), 1000);
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CubeIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{project.title}</h2>
              <p className="text-blue-100 text-sm">{project.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              project.complexity === 'simple' ? 'bg-green-100 text-green-800' :
              project.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            )}>
              {project.complexity}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 text-white">
              {project.framework}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold">{project.files.length}</div>
            <div className="text-xs text-blue-100">Files</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{project.features.length}</div>
            <div className="text-xs text-blue-100">Features</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{project.buildTime}m</div>
            <div className="text-xs text-blue-100">Build Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{project.performance.bundleSize}</div>
            <div className="text-xs text-blue-100">Bundle Size</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'files', label: 'Files', icon: DocumentIcon },
            { id: 'preview', label: 'Preview', icon: EyeIcon },
            { id: 'deployment', label: 'Deploy', icon: RocketLaunchIcon },
            { id: 'insights', label: 'Insights', icon: LightBulbIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="h-96 overflow-hidden">
        {activeTab === 'files' && (
          <div className="flex h-full">
            {/* File Tree */}
            <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                {fileTree.map(node => renderFileTreeNode(node))}
              </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col">
              {activeFile && (
                <>
                  <div className="border-b border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(activeFile)}
                        <div>
                          <div className="font-medium text-gray-900">{activeFile.path}</div>
                          <div className="text-sm text-gray-600">{activeFile.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded",
                          getFileTypeColor(activeFile.type)
                        )}>
                          {activeFile.type}
                        </span>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="Copy to clipboard"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <pre className="p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap">
                      <code>{activeFile.content}</code>
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['desktop', 'tablet', 'mobile'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPreviewMode(mode)}
                      className={cn(
                        "px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize",
                        previewMode === mode ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviewRefresh}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh preview"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    title="Open in new tab"
                  >
                    <PlayIcon className="h-4 w-4 mr-1 inline" />
                    Run
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
              <div className={cn(
                "bg-white rounded-lg shadow-lg overflow-hidden",
                previewMode === 'desktop' && "w-full h-full",
                previewMode === 'tablet' && "w-3/4 h-5/6",
                previewMode === 'mobile' && "w-80 h-5/6"
              )}>
                {isPreviewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <iframe
                    srcDoc={generatePreviewHTML()}
                    className="w-full h-full border-0"
                    title="Project Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.deploymentInstructions.map(guide => (
                    <div
                      key={guide.platform}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 capitalize">{guide.platform}</h4>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded",
                          guide.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          guide.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {guide.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {guide.steps.length} steps • {guide.buildCommand ? `Build: ${guide.buildCommand}` : 'No build required'}
                      </p>
                      
                      <button
                        onClick={() => onDeploymentStart?.(guide)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <CloudArrowUpIcon className="h-4 w-4" />
                        <span>Deploy to {guide.platform}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(project.performance.lighthouse).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={cn(
                      "text-2xl font-bold mb-1",
                      value >= 90 ? 'text-green-600' :
                      value >= 70 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
              <div className="space-y-2">
                {project.bestPractices.map((practice, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-800">{practice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h3>
              <div className="space-y-2">
                {project.optimizations.map((optimization, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{optimization}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Resources</h3>
              <div className="space-y-3">
                {project.learningResources.map((resource, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded",
                        resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{resource.estimatedTime}</span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Learn More →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Estimated build time: {project.buildTime} minutes</span>
            <span>•</span>
            <span>Bundle size: {project.performance.bundleSize}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={onProjectDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Download Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}