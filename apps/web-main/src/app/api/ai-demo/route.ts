import { NextRequest, NextResponse } from 'next/server';

interface AIRequest {
  prompt: string;
  options?: {
    framework?: string;
    complexity?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    includeDatabase?: boolean;
    includeAuth?: boolean;
    deploymentTarget?: string;
  };
  demoId?: string;
  location?: {
    city: string;
    country: string;
  };
}

interface AIResponse {
  title: string;
  description: string;
  code: string;
  framework: string;
  preview: string;
  structure: Array<{
    name: string;
    type: 'file' | 'folder';
    children?: Array<any>;
  }>;
  estimatedTime: string;
  complexity: string;
  success: boolean;
}

// Mock AI responses for demo purposes
const mockResponses: Record<string, Partial<AIResponse>> = {
  'ecommerce': {
    title: 'E-Commerce Platform',
    description: 'Modern e-commerce platform with product catalog, shopping cart, and payment integration',
    framework: 'Next.js',
    estimatedTime: '2-3 hours',
    complexity: 'advanced'
  },
  'saas': {
    title: 'SaaS Dashboard',
    description: 'Complete SaaS application with user management, subscription billing, and analytics',
    framework: 'React',
    estimatedTime: '3-4 hours',
    complexity: 'expert'
  },
  'mobile': {
    title: 'Mobile Application',
    description: 'Cross-platform mobile app with native features and cloud synchronization',
    framework: 'React Native',
    estimatedTime: '4-5 hours',
    complexity: 'advanced'
  },
  'ai': {
    title: 'AI-Powered Tool',
    description: 'Intelligent application with machine learning capabilities and data processing',
    framework: 'Python/FastAPI',
    estimatedTime: '2-3 hours',
    complexity: 'expert'
  },
  'dashboard': {
    title: 'Analytics Dashboard',
    description: 'Real-time analytics dashboard with interactive charts and data visualization',
    framework: 'Vue.js',
    estimatedTime: '1-2 hours',
    complexity: 'intermediate'
  }
};

const generateCodeExample = (framework: string, prompt: string): string => {
  const frameworks: Record<string, string> = {
    'react': `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Generated Application</h1>
        <p>Built from: "${prompt.slice(0, 50)}..."</p>
      </header>
      <main>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="content">
            {/* Generated content based on prompt */}
            <div className="features">
              <h2>Features</h2>
              <ul>
                <li>✅ Responsive Design</li>
                <li>✅ API Integration</li>
                <li>✅ Error Handling</li>
                <li>✅ Loading States</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;`,
    'vue': `<template>
  <div id="app">
    <header class="app-header">
      <h1>Generated Vue Application</h1>
      <p>Built from: "{{ prompt.slice(0, 50) }}..."</p>
    </header>
    <main>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else class="content">
        <div class="features">
          <h2>Features</h2>
          <ul>
            <li>✅ Vue 3 Composition API</li>
            <li>✅ Reactive Data</li>
            <li>✅ Component System</li>
            <li>✅ Modern Architecture</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const data = ref([])
    const loading = ref(true)
    const prompt = ref("${prompt}")

    const fetchData = async () => {
      try {
        const response = await fetch('/api/data')
        data.value = await response.json()
      } catch (error) {
        console.error('Error:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      data,
      loading,
      prompt
    }
  }
}
</script>`,
    'python': `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Generated API", description="Built from: ${prompt.slice(0, 50)}...")

class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    in_stock: bool = True

# Mock database
items_db = []

@app.get("/")
async def root():
    return {"message": "Generated API is running!", "prompt": "${prompt.slice(0, 100)}..."}

@app.get("/items", response_model=List[Item])
async def get_items():
    return items_db

@app.post("/items", response_model=Item)
async def create_item(item: Item):
    item.id = len(items_db) + 1
    items_db.append(item)
    return item

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`
  };

  return frameworks[framework.toLowerCase()] || frameworks['react'];
};

const generateFileStructure = (framework: string) => {
  const structures: Record<string, any[]> = {
    'react': [
      { name: 'src', type: 'folder', children: [
        { name: 'components', type: 'folder', children: [
          { name: 'Header.jsx', type: 'file' },
          { name: 'Footer.jsx', type: 'file' },
          { name: 'Layout.jsx', type: 'file' }
        ]},
        { name: 'pages', type: 'folder', children: [
          { name: 'Home.jsx', type: 'file' },
          { name: 'About.jsx', type: 'file' }
        ]},
        { name: 'hooks', type: 'folder', children: [
          { name: 'useApi.js', type: 'file' },
          { name: 'useAuth.js', type: 'file' }
        ]},
        { name: 'styles', type: 'folder', children: [
          { name: 'App.css', type: 'file' },
          { name: 'index.css', type: 'file' }
        ]},
        { name: 'App.js', type: 'file' },
        { name: 'index.js', type: 'file' }
      ]},
      { name: 'public', type: 'folder', children: [
        { name: 'index.html', type: 'file' },
        { name: 'favicon.ico', type: 'file' }
      ]},
      { name: 'package.json', type: 'file' },
      { name: 'README.md', type: 'file' }
    ],
    'vue': [
      { name: 'src', type: 'folder', children: [
        { name: 'components', type: 'folder', children: [
          { name: 'HelloWorld.vue', type: 'file' },
          { name: 'Layout.vue', type: 'file' }
        ]},
        { name: 'views', type: 'folder', children: [
          { name: 'Home.vue', type: 'file' },
          { name: 'About.vue', type: 'file' }
        ]},
        { name: 'composables', type: 'folder', children: [
          { name: 'useApi.js', type: 'file' }
        ]},
        { name: 'App.vue', type: 'file' },
        { name: 'main.js', type: 'file' }
      ]},
      { name: 'public', type: 'folder', children: [
        { name: 'index.html', type: 'file' }
      ]},
      { name: 'package.json', type: 'file' }
    ],
    'python': [
      { name: 'app', type: 'folder', children: [
        { name: 'main.py', type: 'file' },
        { name: 'models.py', type: 'file' },
        { name: 'routes.py', type: 'file' },
        { name: 'database.py', type: 'file' }
      ]},
      { name: 'requirements.txt', type: 'file' },
      { name: 'Dockerfile', type: 'file' },
      { name: 'README.md', type: 'file' }
    ]
  };

  return structures[framework.toLowerCase()] || structures['react'];
};

const detectPromptType = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce') || lowerPrompt.includes('shop')) {
    return 'ecommerce';
  }
  if (lowerPrompt.includes('saas') || lowerPrompt.includes('subscription') || lowerPrompt.includes('dashboard')) {
    return 'saas';
  }
  if (lowerPrompt.includes('mobile') || lowerPrompt.includes('app') || lowerPrompt.includes('react native')) {
    return 'mobile';
  }
  if (lowerPrompt.includes('ai') || lowerPrompt.includes('machine learning') || lowerPrompt.includes('ml')) {
    return 'ai';
  }
  if (lowerPrompt.includes('analytics') || lowerPrompt.includes('chart') || lowerPrompt.includes('visualization')) {
    return 'dashboard';
  }
  
  return 'saas'; // default
};

// Simulate AI processing delay
const simulateProcessing = (complexity: string): Promise<void> => {
  const delays = {
    'beginner': 2000,
    'intermediate': 3000,
    'advanced': 4000,
    'expert': 5000
  };
  
  const delay = delays[complexity as keyof typeof delays] || 3000;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { prompt, options = {}, demoId, location } = body;

    // Validate request
    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const userIP = request.headers.get('x-forwarded-for') || 'unknown';
    // In production, implement proper rate limiting with Redis/database

    // Detect prompt type and get base response
    const promptType = detectPromptType(prompt);
    const baseResponse = mockResponses[promptType] || mockResponses['saas'];

    // Merge with options
    const framework = options.framework || baseResponse.framework || 'React';
    const complexity = options.complexity || baseResponse.complexity || 'intermediate';

    // Simulate AI processing time
    await simulateProcessing(complexity);

    // Generate response
    const response: AIResponse = {
      title: baseResponse.title || 'Generated Application',
      description: baseResponse.description || 'AI-generated application based on your requirements',
      code: generateCodeExample(framework, prompt),
      framework,
      preview: `data:text/html;base64,${Buffer.from(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${baseResponse.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
            .feature { padding: 10px; margin: 10px 0; background: #e7f3ff; border-left: 4px solid #007bff; }
            .badge { display: inline-block; padding: 4px 8px; background: #28a745; color: white; border-radius: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${baseResponse.title}</h1>
              <p>${baseResponse.description}</p>
              <span class="badge">Generated with AI</span>
            </div>
            <div class="feature">
              <h3>✨ Key Features</h3>
              <ul>
                <li>Modern ${framework} Architecture</li>
                <li>Responsive Design</li>
                <li>API Integration Ready</li>
                <li>Production Optimized</li>
              </ul>
            </div>
            <div class="feature">
              <h3>🚀 Quick Start</h3>
              <p>Your application is ready to deploy! Estimated development time: ${baseResponse.estimatedTime}</p>
            </div>
          </div>
        </body>
        </html>
      `).toString('base64')}`,
      structure: generateFileStructure(framework),
      estimatedTime: baseResponse.estimatedTime || '2-3 hours',
      complexity,
      success: true
    };

    // Log for analytics (in production, send to proper analytics service)
    console.info('AI Demo Generated:', {
      demoId,
      promptLength: prompt.length,
      framework,
      complexity,
      location: location?.city,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI Demo API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate demo',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Demo API is running',
    version: '1.0.0',
    endpoints: {
      'POST /api/ai-demo': 'Generate AI demo from prompt',
    },
    rateLimit: {
      requests: 10,
      window: '1 hour'
    }
  });
}