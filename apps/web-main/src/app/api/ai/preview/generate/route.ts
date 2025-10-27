import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleCORS, addCORSHeaders } from '@/lib/utils/cors';

const previewGenerateSchema = z.object({
  projectId: z.string(),
  files: z.array(z.object({
    name: z.string(),
    content: z.string(),
    language: z.string()
  })),
  framework: z.string()
});

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCORS(request);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight if needed
  const corsResponse = handleCORS(request);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    const body = await request.json();
    const { projectId, files, framework } = previewGenerateSchema.parse(body);

    // For now, we'll generate a simple HTML preview
    // In production, this would compile and serve the actual application
    const previewHtml = generatePreviewHtml(files, framework);
    
    // In a real implementation, you would:
    // 1. Save the files to a temporary directory
    // 2. Set up a build process for the specific framework
    // 3. Serve the built application on a unique URL
    // 4. Return that URL for iframe embedding

    // For this demo, we'll create a data URL with the preview
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(previewHtml)}`;
    
    const response = NextResponse.json({
      success: true,
      previewUrl: dataUrl,
      projectId: projectId
    });

    return addCORSHeaders(response, request);

  } catch (error) {
    console.error('Preview generation error:', error);
    
    if (error instanceof z.ZodError) {
      const validationErrorResponse = NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'Please provide valid project data',
          details: error.errors
        },
        { status: 400 }
      );
      return addCORSHeaders(validationErrorResponse, request);
    }

    const serverErrorResponse = NextResponse.json(
      { 
        error: 'Preview generation failed',
        message: 'Failed to generate preview. Please try again.'
      },
      { status: 500 }
    );
    return addCORSHeaders(serverErrorResponse, request);
  }
}

function generatePreviewHtml(files: any[], framework: string): string {
  const mainFile = files.find(f => 
    f.name.includes('App.') || 
    f.name.includes('index.') || 
    f.name.includes('main.')
  ) || files[0];

  if (!mainFile) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview Error</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          .error { color: #e53e3e; }
        </style>
      </head>
      <body>
        <div class="error">
          <h2>Preview Error</h2>
          <p>No files available for preview</p>
        </div>
      </body>
      </html>
    `;
  }

  switch (framework) {
    case 'react':
      return generateReactPreview(mainFile.content, files);
    case 'vue':
      return generateVuePreview(mainFile.content, files);
    case 'vanilla':
    default:
      return generateVanillaPreview(mainFile.content, files);
  }
}

function generateReactPreview(code: string, files: any[]): string {
  // Extract the component code and create a working React preview
  let componentCode = code;
  
  // If the code doesn't include React import, add it
  if (!componentCode.includes('import React') && !componentCode.includes('from "react"')) {
    componentCode = `import React from 'react';\n${componentCode}`;
  }

  // Create a complete HTML page with React via CDN
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>React App Preview</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .preview-container { min-height: 100vh; }
        .error-boundary { 
          padding: 20px; 
          background: #fed7d7; 
          border: 1px solid #e53e3e; 
          border-radius: 6px; 
          color: #c53030;
        }
      </style>
    </head>
    <body>
      <div id="root"></div>
      
      <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        
        // Error Boundary Component
        class ErrorBoundary extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
          }
          
          static getDerivedStateFromError(error) {
            return { hasError: true, error };
          }
          
          componentDidCatch(error, errorInfo) {
            console.error('React Error:', error, errorInfo);
          }
          
          render() {
            if (this.state.hasError) {
              return (
                <div className="error-boundary">
                  <h2>Preview Error</h2>
                  <p>There was an error rendering the component:</p>
                  <pre>{this.state.error?.toString()}</pre>
                </div>
              );
            }
            
            return this.props.children;
          }
        }
        
        try {
          ${componentCode.replace(/export default/, 'const App =')}
          
          const AppWrapper = () => (
            <ErrorBoundary>
              <div className="preview-container">
                <App />
              </div>
            </ErrorBoundary>
          );
          
          ReactDOM.render(<AppWrapper />, document.getElementById('root'));
        } catch (error) {
          console.error('Script Error:', error);
          document.getElementById('root').innerHTML = \`
            <div class="error-boundary">
              <h2>Preview Error</h2>
              <p>Failed to render the React component:</p>
              <pre>\${error.toString()}</pre>
            </div>
          \`;
        }
      </script>
    </body>
    </html>
  `;
}

function generateVuePreview(code: string, files: any[]): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vue App Preview</title>
      <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .preview-container { min-height: 100vh; }
        .error-boundary { 
          padding: 20px; 
          background: #fed7d7; 
          border: 1px solid #e53e3e; 
          border-radius: 6px; 
          color: #c53030;
        }
      </style>
    </head>
    <body>
      <div id="app"></div>
      
      <script>
        try {
          const { createApp, ref, reactive, computed, onMounted } = Vue;
          
          ${code}
          
          const app = createApp(App);
          app.config.errorHandler = (error, vm, info) => {
            console.error('Vue Error:', error, info);
            document.getElementById('app').innerHTML = \`
              <div class="error-boundary">
                <h2>Preview Error</h2>
                <p>There was an error rendering the Vue component:</p>
                <pre>\${error.toString()}</pre>
              </div>
            \`;
          };
          
          app.mount('#app');
        } catch (error) {
          console.error('Script Error:', error);
          document.getElementById('app').innerHTML = \`
            <div class="error-boundary">
              <h2>Preview Error</h2>
              <p>Failed to render the Vue component:</p>
              <pre>\${error.toString()}</pre>
            </div>
          \`;
        }
      </script>
    </body>
    </html>
  `;
}

function generateVanillaPreview(code: string, files: any[]): string {
  // For vanilla JS, we'll try to execute the code directly
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>JavaScript App Preview</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .preview-container { min-height: 100vh; }
        .error-boundary { 
          padding: 20px; 
          background: #fed7d7; 
          border: 1px solid #e53e3e; 
          border-radius: 6px; 
          color: #c53030;
        }
      </style>
    </head>
    <body>
      <div id="root" class="preview-container"></div>
      
      <script>
        try {
          // Wrap the generated code in a try-catch
          window.addEventListener('error', function(event) {
            document.getElementById('root').innerHTML = \`
              <div class="error-boundary">
                <h2>Preview Error</h2>
                <p>JavaScript Error:</p>
                <pre>\${event.error?.toString() || event.message}</pre>
              </div>
            \`;
          });
          
          ${code}
        } catch (error) {
          console.error('Script Error:', error);
          document.getElementById('root').innerHTML = \`
            <div class="error-boundary">
              <h2>Preview Error</h2>
              <p>Failed to execute JavaScript:</p>
              <pre>\${error.toString()}</pre>
            </div>
          \`;
        }
      </script>
    </body>
    </html>
  `;
}