'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CodePreviewProps {
  code: string;
  framework: 'react' | 'vue' | 'vanilla';
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onRefresh?: () => void;
}

interface CompilationError {
  type: 'syntax' | 'runtime' | 'warning';
  message: string;
  line?: number;
  column?: number;
}

interface CompilationStatus {
  isCompiling: boolean;
  hasErrors: boolean;
  errors: CompilationError[];
  warnings: CompilationError[];
  compilationTime?: number;
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type ViewMode = 'preview' | 'code';

export default function CodePreview({ 
  code, 
  framework,
  isLoading = false,
  error = null,
  className,
  onRefresh
}: CodePreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compilationStatus, setCompilationStatus] = useState<CompilationStatus>({
    isCompiling: false,
    hasErrors: false,
    errors: [],
    warnings: []
  });
  const [consoleOutput, setConsoleOutput] = useState<Array<{
    level: 'log' | 'error' | 'warn';
    message: string;
    timestamp: number;
  }>>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  // Generate sandboxed preview URL with compilation analysis
  useEffect(() => {
    if (code && !error) {
      const generatePreview = async () => {
        const startTime = Date.now();
        setCompilationStatus(prev => ({ ...prev, isCompiling: true }));
        
        try {
          // Analyze code for potential issues before execution
          const analysis = analyzeCode(code, framework);
          
          // Create HTML content for iframe with enhanced error monitoring
          const htmlContent = createSandboxedHTML(code, framework);
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          
          const compilationTime = Date.now() - startTime;
          
          setPreviewUrl(url);
          setCompilationStatus({
            isCompiling: false,
            hasErrors: analysis.errors.length > 0,
            errors: analysis.errors,
            warnings: analysis.warnings,
            compilationTime
          });
          
        } catch (err) {
          console.error('Failed to generate preview:', err);
          setCompilationStatus({
            isCompiling: false,
            hasErrors: true,
            errors: [{
              type: 'syntax',
              message: err instanceof Error ? err.message : 'Unknown compilation error'
            }],
            warnings: []
          });
        }
      };

      generatePreview();
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [code, framework, error]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      const { type, level, message, error, loadTime: reportedLoadTime, timestamp } = event.data;
      
      switch (type) {
        case 'console':
          setConsoleOutput(prev => [...prev, { level, message, timestamp }]);
          break;
          
        case 'compilation-success':
          setLoadTime(reportedLoadTime);
          setCompilationStatus(prev => ({ ...prev, isCompiling: false }));
          break;
          
        case 'compilation-error':
        case 'runtime-error':
          setCompilationStatus(prev => ({
            ...prev,
            hasErrors: true,
            errors: [...prev.errors, {
              type: 'runtime',
              message: error.message || error.reason || 'Runtime error occurred'
            }]
          }));
          break;
          
        case 'promise-rejection':
          setConsoleOutput(prev => [...prev, { 
            level: 'error', 
            message: `Unhandled Promise Rejection: ${event.data.reason}`, 
            timestamp 
          }]);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const analyzeCode = (code: string, framework: string): { errors: CompilationError[], warnings: CompilationError[] } => {
    const errors: CompilationError[] = [];
    const warnings: CompilationError[] = [];

    // Basic syntax checks
    try {
      // Check for common JavaScript syntax errors
      const lines = code.split('\n');
      lines.forEach((line, index) => {
        // Check for unclosed brackets
        const openBrackets = (line.match(/[\(\[\{]/g) || []).length;
        const closeBrackets = (line.match(/[\)\]\}]/g) || []).length;
        
        if (openBrackets > closeBrackets + 1) {
          warnings.push({
            type: 'warning',
            message: 'Potentially unclosed brackets detected',
            line: index + 1
          });
        }

        // Check for common typos
        if (line.includes('=++') || line.includes('=--')) {
          errors.push({
            type: 'syntax',
            message: 'Invalid increment/decrement operator',
            line: index + 1
          });
        }

        // Check for missing semicolons in critical places
        if (/^[\s]*\}[\s]*$/.test(line) && index < lines.length - 1 && 
            !/[\;\{\}]$/.test(lines[index + 1].trim()) && lines[index + 1].trim()) {
          warnings.push({
            type: 'warning',
            message: 'Consider adding semicolon after statement',
            line: index + 2
          });
        }
      });

      // Framework-specific checks
      if (framework === 'react') {
        if (!code.includes('export default') && !code.includes('function App')) {
          errors.push({
            type: 'syntax',
            message: 'React component must export a default App function'
          });
        }

        // Check for proper JSX
        if (code.includes('<') && code.includes('>') && !code.includes('React')) {
          warnings.push({
            type: 'warning',
            message: 'Using JSX without importing React may cause issues'
          });
        }
      } else if (framework === 'vue') {
        if (!code.includes('AppConfig') && !code.includes('createApp')) {
          errors.push({
            type: 'syntax',
            message: 'Vue app must define AppConfig or use createApp'
          });
        }
      }

      // Security checks
      if (code.includes('eval(') || code.includes('Function(')) {
        errors.push({
          type: 'runtime',
          message: 'Use of eval() or Function() is not allowed for security reasons'
        });
      }

      if (code.includes('document.write')) {
        warnings.push({
          type: 'warning',
          message: 'document.write() can cause security issues and performance problems'
        });
      }

    } catch (syntaxError) {
      errors.push({
        type: 'syntax',
        message: syntaxError instanceof Error ? syntaxError.message : 'Syntax error detected'
      });
    }

    return { errors, warnings };
  };

  const createSandboxedHTML = (code: string, framework: string): string => {
    const baseHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${framework === 'react' ? '<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' : ''}
  ${framework === 'vue' ? '<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>' : ''}
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .app-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .error-boundary {
      border: 2px dashed #ef4444;
      border-radius: 8px;
      padding: 20px;
      background: #fef2f2;
      color: #dc2626;
      text-align: center;
    }
  </style>
</head>
<body>
  <div id="app" class="app-container">
    <div class="error-boundary" style="display: none;" id="error-boundary">
      <h3>⚠️ App Error</h3>
      <p>There was an issue rendering your app. Please check the code and try again.</p>
    </div>
    <div id="app-content"></div>
  </div>
  
  <script>
    // Enhanced error handling and console capture
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    let consoleMessages = [];
    
    // Override console methods to capture output
    console.log = function(...args) {
      consoleMessages.push({ type: 'log', message: args.join(' '), timestamp: Date.now() });
      originalConsoleLog.apply(console, args);
      // Send to parent window if available
      try {
        window.parent.postMessage({
          type: 'console',
          level: 'log',
          message: args.join(' '),
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    };
    
    console.error = function(...args) {
      consoleMessages.push({ type: 'error', message: args.join(' '), timestamp: Date.now() });
      originalConsoleError.apply(console, args);
      try {
        window.parent.postMessage({
          type: 'console',
          level: 'error',
          message: args.join(' '),
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    };
    
    console.warn = function(...args) {
      consoleMessages.push({ type: 'warn', message: args.join(' '), timestamp: Date.now() });
      originalConsoleWarn.apply(console, args);
      try {
        window.parent.postMessage({
          type: 'console',
          level: 'warn',
          message: args.join(' '),
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    };

    // Performance monitoring
    const performanceStart = performance.now();

    // Error handling with detailed reporting
    window.addEventListener('error', function(e) {
      const errorInfo = {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error ? e.error.toString() : null
      };
      
      document.getElementById('error-boundary').style.display = 'block';
      document.getElementById('app-content').style.display = 'none';
      console.error('Runtime Error:', errorInfo);
      
      try {
        window.parent.postMessage({
          type: 'runtime-error',
          error: errorInfo,
          timestamp: Date.now()
        }, '*');
      } catch (err) {}
    });

    // Unhandled promise rejection handling
    window.addEventListener('unhandledrejection', function(e) {
      console.error('Unhandled Promise Rejection:', e.reason);
      try {
        window.parent.postMessage({
          type: 'promise-rejection',
          reason: e.reason ? e.reason.toString() : 'Unknown promise rejection',
          timestamp: Date.now()
        }, '*');
      } catch (err) {}
    });

    try {
      // Sanitized code execution with performance tracking
      ${sanitizeCode(code, framework)}
      
      // Report successful compilation
      const performanceEnd = performance.now();
      const loadTime = performanceEnd - performanceStart;
      
      try {
        window.parent.postMessage({
          type: 'compilation-success',
          loadTime: loadTime,
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
      
    } catch (error) {
      document.getElementById('error-boundary').style.display = 'block';
      document.getElementById('app-content').style.display = 'none';
      console.error('Execution Error:', error);
      
      try {
        window.parent.postMessage({
          type: 'compilation-error',
          error: {
            message: error.message,
            stack: error.stack
          },
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    }
  </script>
</body>
</html>`;

    return baseHTML;
  };

  const sanitizeCode = (code: string, framework: string): string => {
    // Remove potentially dangerous code
    const sanitized = code
      .replace(/document\.cookie/g, '/* document.cookie blocked */')
      .replace(/localStorage/g, '/* localStorage blocked */')
      .replace(/sessionStorage/g, '/* sessionStorage blocked */')
      .replace(/window\.location/g, '/* window.location blocked */')
      .replace(/fetch\(/g, '/* fetch blocked */ (')
      .replace(/XMLHttpRequest/g, '/* XMLHttpRequest blocked */');

    // Framework-specific handling
    if (framework === 'react') {
      return `
        const { useState, useEffect } = React;
        const container = document.getElementById('app-content');
        
        ${sanitized}
        
        // Render the React app
        if (typeof App !== 'undefined') {
          ReactDOM.render(React.createElement(App), container);
        } else {
          container.innerHTML = '<div class="text-center text-gray-500"><p>React App component not found. Make sure to export a default App component.</p></div>';
        }
      `;
    } else if (framework === 'vue') {
      return `
        ${sanitized}
        
        // Mount the Vue app
        if (typeof AppConfig !== 'undefined') {
          Vue.createApp(AppConfig).mount('#app-content');
        } else {
          document.getElementById('app-content').innerHTML = '<div class="text-center text-gray-500"><p>Vue app configuration not found.</p></div>';
        }
      `;
    } else {
      // Vanilla HTML/JS
      return `
        document.getElementById('app-content').innerHTML = \`${sanitized}\`;
      `;
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadCode = () => {
    const fileName = framework === 'vanilla' ? 'index.html' : 
                    framework === 'react' ? 'App.jsx' : 'App.vue';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadProject = () => {
    // Create a simple project structure
    const files: { [key: string]: string } = {};
    
    if (framework === 'react') {
      files['App.jsx'] = code;
      files['package.json'] = JSON.stringify({
        name: 'generated-react-app',
        version: '1.0.0',
        private: true,
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'react-scripts': '^5.0.1'
        },
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test',
          eject: 'react-scripts eject'
        }
      }, null, 2);
      files['public/index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated React App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
      files['src/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
    } else if (framework === 'vue') {
      files['App.vue'] = code.replace('const { createApp } = Vue;', '').replace('createApp(AppConfig).mount(\'#app\');', '');
      files['package.json'] = JSON.stringify({
        name: 'generated-vue-app',
        version: '1.0.0',
        private: true,
        dependencies: {
          'vue': '^3.0.0'
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^4.0.0',
          'vite': '^4.0.0'
        },
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        }
      }, null, 2);
      files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Vue App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
      files['src/main.js'] = `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`;
    } else {
      files['index.html'] = code;
      files['README.md'] = `# Generated Vanilla JS App

This is a vanilla JavaScript application generated with AI.

## Getting Started

1. Open \`index.html\` in your web browser
2. Or serve with a local server for best results:
   - Python: \`python -m http.server 8000\`
   - Node.js: \`npx serve .\`
   - Live Server extension in VS Code

## Features

- Pure HTML, CSS, and JavaScript
- No build process required
- Responsive design with Tailwind CSS
- Modern browser APIs
`;
    }

    // Create and download ZIP file (simplified approach)
    const zipContent = Object.entries(files).map(([path, content]) => 
      `File: ${path}\n${'-'.repeat(50)}\n${content}\n${'='.repeat(50)}\n`
    ).join('\n');
    
    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-${framework}-project.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header Controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-1",
                  viewMode === 'preview' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <EyeIcon className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-1",
                  viewMode === 'code' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <CodeBracketIcon className="h-4 w-4" />
                <span>Code</span>
              </button>
            </div>
          </div>

          {/* Preview Controls */}
          {viewMode === 'preview' && (
            <div className="flex items-center space-x-2">
              {/* Device Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    "p-2 rounded-md transition-colors duration-200",
                    previewMode === 'desktop' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  title="Desktop View"
                >
                  <ComputerDesktopIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={cn(
                    "p-2 rounded-md transition-colors duration-200",
                    previewMode === 'tablet' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  title="Tablet View"
                >
                  <DeviceTabletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    "p-2 rounded-md transition-colors duration-200",
                    previewMode === 'mobile' 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  title="Mobile View"
                >
                  <DevicePhoneMobileIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={onRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Refresh Preview"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Code Controls */}
          {viewMode === 'code' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2",
                  isCopied 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={handleDownloadCode}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                title="Download single file"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>File</span>
              </button>
              
              <button
                onClick={handleDownloadProject}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
                title="Download complete project structure"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-sm font-medium text-gray-700">
                Generating your app...
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preview Error
            </h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Preview View */}
        {viewMode === 'preview' && !error && !isLoading && (
          <div className="p-6 bg-gray-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div 
                className={cn(
                  "bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300",
                  previewMode === 'mobile' && "mx-auto"
                )}
                style={{
                  width: getPreviewDimensions().width,
                  height: getPreviewDimensions().height,
                  maxWidth: '100%'
                }}
              >
                {previewUrl && (
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="App Preview"
                  />
                )}
              </div>
            </motion.div>

            {/* Device Info */}
            <div className="text-center mt-4 text-xs text-gray-500">
              Viewing in {previewMode} mode ({getPreviewDimensions().width} × {getPreviewDimensions().height})
            </div>
          </div>
        )}

        {/* Code View */}
        {viewMode === 'code' && !error && !isLoading && (
          <div className="relative">
            <pre className="p-6 bg-gray-900 text-gray-100 text-sm overflow-x-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Framework: <span className="font-medium capitalize">{framework}</span></span>
            <span>Lines: <span className="font-medium">{code.split('\n').length}</span></span>
            {loadTime && (
              <span>Load Time: <span className="font-medium">{loadTime.toFixed(1)}ms</span></span>
            )}
            {compilationStatus.errors.length > 0 && (
              <span className="text-red-600">
                Errors: <span className="font-medium">{compilationStatus.errors.length}</span>
              </span>
            )}
            {compilationStatus.warnings.length > 0 && (
              <span className="text-yellow-600">
                Warnings: <span className="font-medium">{compilationStatus.warnings.length}</span>
              </span>
            )}
          </div>
          <div className={cn(
            "flex items-center space-x-1",
            compilationStatus.hasErrors ? "text-red-600" : 
            compilationStatus.warnings.length > 0 ? "text-yellow-600" : 
            "text-green-600"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              compilationStatus.isCompiling ? "bg-blue-500 animate-pulse" :
              compilationStatus.hasErrors ? "bg-red-500" :
              compilationStatus.warnings.length > 0 ? "bg-yellow-500" :
              "bg-green-500"
            )}></div>
            <span>
              {compilationStatus.isCompiling ? 'Compiling...' :
               compilationStatus.hasErrors ? 'Compilation Error' :
               compilationStatus.warnings.length > 0 ? 'Compiled with Warnings' :
               'Compiled Successfully'}
            </span>
          </div>
        </div>
        
        {/* Quick Error/Warning Display */}
        {(compilationStatus.errors.length > 0 || compilationStatus.warnings.length > 0) && (
          <div className="mt-2 space-y-1">
            {compilationStatus.errors.slice(0, 2).map((error, index) => (
              <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                <span className="font-medium">Error{error.line ? ` (line ${error.line})` : ''}:</span> {error.message}
              </div>
            ))}
            {compilationStatus.warnings.slice(0, 1).map((warning, index) => (
              <div key={index} className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                <span className="font-medium">Warning{warning.line ? ` (line ${warning.line})` : ''}:</span> {warning.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}