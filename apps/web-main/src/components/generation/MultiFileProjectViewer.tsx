'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentIcon,
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  CubeIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { EnhancedGenerationResult, ProjectFile } from '@/lib/ai/enhanced-code-generator';

interface MultiFileProjectViewerProps {
  project: EnhancedGenerationResult;
  onFileSelect?: (file: ProjectFile, line?: number) => void;
  onFileChange?: (file: ProjectFile, content: string) => void;
  className?: string;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  file?: ProjectFile;
}

export default function MultiFileProjectViewer({
  project,
  onFileSelect,
  onFileChange,
  className
}: MultiFileProjectViewerProps) {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    buildFileTree();
    if (project.files.length > 0 && !selectedFile) {
      setSelectedFile(project.files[0]);
      onFileSelect?.(project.files[0]);
    }
  }, [project]);

  const buildFileTree = () => {
    const tree: FileTreeNode[] = [];
    const folderMap: Record<string, FileTreeNode> = {};

    // Sort files by path depth and name
    const sortedFiles = [...project.files].sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      if (aDepth !== bDepth) return aDepth - bDepth;
      return a.path.localeCompare(b.path);
    });

    for (const file of sortedFiles) {
      const pathParts = file.path.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      if (pathParts.length === 1) {
        // Root level file
        tree.push({
          name: fileName,
          path: file.path,
          type: 'file',
          file
        });
      } else {
        // File in a folder
        const folderPath = pathParts.slice(0, -1).join('/');
        
        // Create folder structure if it doesn't exist
        let currentPath = '';
        let currentLevel = tree;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folderName = pathParts[i];
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
          
          let folder = currentLevel.find(node => node.name === folderName && node.type === 'folder');
          
          if (!folder) {
            folder = {
              name: folderName,
              path: currentPath,
              type: 'folder',
              children: []
            };
            currentLevel.push(folder);
            folderMap[currentPath] = folder;
          }
          
          currentLevel = folder.children!;
        }
        
        // Add file to the final folder
        currentLevel.push({
          name: fileName,
          path: file.path,
          type: 'file',
          file
        });
      }
    }

    setFileTree(tree);
    
    // Auto-expand first level folders
    const firstLevelFolders = tree.filter(node => node.type === 'folder').map(node => node.path);
    setExpandedFolders(new Set(firstLevelFolders));
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const getFileIcon = (file: ProjectFile) => {
    const extension = file.path.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <CodeBracketIcon className="h-4 w-4 text-blue-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <BeakerIcon className="h-4 w-4 text-pink-500" />;
      case 'html':
        return <DocumentIcon className="h-4 w-4 text-orange-500" />;
      case 'json':
        return <CubeIcon className="h-4 w-4 text-yellow-500" />;
      case 'md':
        return <DocumentIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'component': return 'text-blue-600 bg-blue-100';
      case 'page': return 'text-green-600 bg-green-100';
      case 'style': return 'text-pink-600 bg-pink-100';
      case 'config': return 'text-gray-600 bg-gray-100';
      case 'test': return 'text-purple-600 bg-purple-100';
      case 'api': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderTreeNode = (node: FileTreeNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    
    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => toggleFolder(node.path)}
            className={cn(
              "w-full flex items-center space-x-2 px-2 py-1 text-left hover:bg-gray-100 rounded transition-colors",
              `pl-${(level * 4) + 2}`
            )}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            )}
            <FolderIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">{node.name}</span>
            <span className="text-xs text-gray-500">
              ({node.children?.filter(child => child.type === 'file').length || 0})
            </span>
          </motion.button>
          
          <AnimatePresence>
            {isExpanded && node.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {node.children.map(child => renderTreeNode(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // File node
    return (
      <motion.button
        key={node.path}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => node.file && handleFileSelect(node.file)}
        className={cn(
          "w-full flex items-center justify-between px-2 py-1 text-left hover:bg-gray-100 rounded transition-colors group",
          `pl-${(level * 4) + 6}`,
          selectedFile?.path === node.path && "bg-blue-50 border-l-2 border-blue-500"
        )}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {node.file && getFileIcon(node.file)}
          <span className="text-sm text-gray-800 truncate">{node.name}</span>
          {node.file && (
            <span className={cn("px-1.5 py-0.5 text-xs rounded", getFileTypeColor(node.file.type))}>
              {node.file.type}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-gray-200 rounded">
            <EyeIcon className="h-3 w-3" />
          </button>
          <button className="p-1 hover:bg-gray-200 rounded">
            <DocumentDuplicateIcon className="h-3 w-3" />
          </button>
        </div>
      </motion.button>
    );
  };

  const filteredFiles = project.files.filter(file =>
    file.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadProject = () => {
    const zip = {
      files: project.files.reduce((acc, file) => {
        acc[file.path] = file.content;
        return acc;
      }, {} as Record<string, string>)
    };

    const dataStr = JSON.stringify(zip, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${project.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-600">
              {project.framework} • {project.files.length} files • {project.complexity}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {viewMode === 'tree' ? 'List View' : 'Tree View'}
            </button>
            <button
              onClick={downloadProject}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="flex h-96">
        {/* File Tree/List */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Project Structure</h4>
            
            {viewMode === 'tree' ? (
              <div className="space-y-1">
                {fileTree.map(node => renderTreeNode(node))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => handleFileSelect(file)}
                    className={cn(
                      "w-full flex items-center space-x-2 px-2 py-2 text-left hover:bg-gray-100 rounded transition-colors",
                      selectedFile?.path === file.path && "bg-blue-50 border-l-2 border-blue-500"
                    )}
                  >
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 truncate">{file.path}</div>
                      <div className="text-xs text-gray-500 truncate">{file.description}</div>
                    </div>
                    <span className={cn("px-1.5 py-0.5 text-xs rounded", getFileTypeColor(file.type))}>
                      {file.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Content */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(selectedFile)}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{selectedFile.path}</h4>
                      <p className="text-xs text-gray-600">{selectedFile.description}</p>
                    </div>
                    <span className={cn("px-2 py-1 text-xs rounded", getFileTypeColor(selectedFile.type))}>
                      {selectedFile.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {selectedFile.content.split('\n').length} lines
                    </span>
                  </div>
                </div>
              </div>

              {/* File Content */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={selectedFile.content}
                  onChange={(e) => onFileChange?.(selectedFile, e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-white"
                  style={{ 
                    lineHeight: '1.5',
                    tabSize: 2
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Generated with {project.framework} • {new Date().toLocaleString()}
          </div>
          <div className="flex items-center space-x-4">
            {project.features && (
              <div className="flex items-center space-x-2">
                <span>Features:</span>
                <div className="flex space-x-1">
                  {project.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                  {project.features.length > 3 && (
                    <span className="text-xs text-gray-500">+{project.features.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}