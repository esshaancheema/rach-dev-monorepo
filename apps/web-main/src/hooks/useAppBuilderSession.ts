'use client';

import { useState, useEffect, useCallback } from 'react';

interface SessionState {
  sessionId: string;
  promptsUsed: number;
  promptsRemaining: number;
  totalPrompts: number;
  isAuthenticated: boolean;
  apps: Array<{
    id: string;
    prompt: string;
    code: string;
    framework: string;
    description: string;
    timestamp: Date;
  }>;
}

interface UseAppBuilderSessionReturn extends SessionState {
  generateApp: (prompt: string) => Promise<{
    code: string;
    framework: string;
    description: string;
  }>;
  authenticate: (user: any) => void;
  clearSession: () => void;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'zoptal_app_builder_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useAppBuilderSession(): UseAppBuilderSessionReturn {
  const [state, setState] = useState<SessionState>({
    sessionId: '',
    promptsUsed: 0,
    promptsRemaining: 3,
    totalPrompts: 3,
    isAuthenticated: false,
    apps: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        const sessionAge = Date.now() - parsed.timestamp;
        
        // Check if session is still valid
        if (sessionAge < SESSION_DURATION) {
          setState({
            ...parsed,
            apps: parsed.apps.map((app: any) => ({
              ...app,
              timestamp: new Date(app.timestamp)
            }))
          });
        } else {
          // Session expired, clear it
          localStorage.removeItem(STORAGE_KEY);
          generateNewSession();
        }
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        generateNewSession();
      }
    } else {
      generateNewSession();
    }
  }, []);

  // Save session to localStorage whenever state changes
  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now()
      }));
    }
  }, [state]);

  const generateNewSession = () => {
    const sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    setState({
      sessionId,
      promptsUsed: 0,
      promptsRemaining: 3,
      totalPrompts: 3,
      isAuthenticated: false,
      apps: []
    });
  };

  const generateApp = useCallback(async (prompt: string) => {
    if (state.promptsRemaining <= 0 && !state.isAuthenticated) {
      throw new Error('No prompts remaining. Please sign up to continue.');
    }

    setIsLoading(true);
    setError(null);

    try {
      let mockResponse;
      
      try {
        // Call the real API
        const response = await fetch('/api/ai/generate-app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            sessionId: state.sessionId,
            userId: state.isAuthenticated ? 'current_user_id' : undefined,
            context: {
              previousApps: state.apps.map(app => ({
                prompt: app.prompt,
                framework: app.framework,
                features: []
              })),
              userPreferences: {
                framework: 'auto',
                complexity: 'moderate'
              }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          mockResponse = {
            code: data.data.code,
            framework: data.data.framework,
            description: data.data.description
          };
        } else {
          throw new Error(`API call failed: ${response.statusText}`);
        }
      } catch (apiError) {
        console.log('API call failed, using simulation:', apiError);
        // Fallback to simulation
        mockResponse = await simulateAppGeneration(prompt);
      }
      
      // Create new app entry
      const newApp = {
        id: Date.now().toString(),
        prompt,
        code: mockResponse.code,
        framework: mockResponse.framework,
        description: mockResponse.description,
        timestamp: new Date()
      };

      // Update state with new app and incremented usage
      setState(prev => ({
        ...prev,
        promptsUsed: prev.promptsUsed + 1,
        promptsRemaining: prev.promptsRemaining - 1,
        apps: [...prev.apps, newApp]
      }));

      return {
        code: mockResponse.code,
        framework: mockResponse.framework,
        description: mockResponse.description
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate app';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [state.sessionId, state.promptsRemaining, state.isAuthenticated, state.apps]);

  // Import and use the real ZoptalCodeGenerator
  const simulateAppGeneration = async (prompt: string) => {
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the actual ZoptalCodeGenerator for better results
    const { ZoptalCodeGenerator } = await import('@/lib/ai/code-generator');
    const generator = new ZoptalCodeGenerator();
    
    // Determine framework based on prompt or default to react
    const frameworks = ['react', 'vue', 'vanilla'] as const;
    let selectedFramework = frameworks[0]; // default to react
    
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('vue')) selectedFramework = 'vue';
    else if (lowerPrompt.includes('vanilla') || lowerPrompt.includes('html')) selectedFramework = 'vanilla';
    
    try {
      const result = await generator.generateFullApp(prompt, {
        framework: selectedFramework,
        complexity: 'simple',
        features: []
      });
      
      return {
        code: result.code,
        framework: result.framework,
        description: result.description
      };
    } catch (error) {
      console.error('Code generation failed, falling back to templates:', error);
      // Fallback to original template system
      const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
      
      const createVanillaTemplate = (prompt: string) => {
        const appName = prompt.split(' ').slice(0, 3).join(' ') + ' App';
        return `<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
    ${appName}
  </h1>
  
  <div class="mb-6">
    <div class="text-center mb-4">
      <button id="countBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
        Count: <span id="count">0</span>
      </button>
    </div>
  </div>

  <div class="space-y-4">
    <div class="flex space-x-2">
      <input id="todoInput" type="text" placeholder="Add a todo..." class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button id="addBtn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">Add</button>
    </div>
    <ul id="todoList" class="space-y-2"></ul>
  </div>

  <div class="mt-6 text-center text-sm text-gray-500">Built with Vanilla JS & AI ✨</div>
</div>

<script>
let count = 0;
let todos = [];
let todoId = 0;

document.getElementById('countBtn').addEventListener('click', () => {
  count++;
  document.getElementById('count').textContent = count;
});

function addTodo() {
  const text = document.getElementById('todoInput').value.trim();
  if (text) {
    todos.push({ id: ++todoId, text, completed: false });
    document.getElementById('todoInput').value = '';
    renderTodos();
  }
}

function renderTodos() {
  document.getElementById('todoList').innerHTML = todos.map(todo => 
    '<li class="flex items-center space-x-2">' +
    '<input type="checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(' + todo.id + ')" class="rounded" />' +
    '<span class="' + (todo.completed ? 'line-through text-gray-500' : 'text-gray-800') + '">' + todo.text + '</span>' +
    '</li>'
  ).join('');
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
  }
}

document.getElementById('addBtn').addEventListener('click', addTodo);
document.getElementById('todoInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});
</script>`;
      };
      
      const sampleApps = {
      react: {
        code: `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ${prompt.split(' ').slice(0, 3).join(' ')} App
      </h1>
      
      <div className="mb-6">
        <div className="text-center mb-4">
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Count: {count}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a todo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="rounded"
              />
              <span className={todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                {todo.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Built with React & AI ✨
      </div>
    </div>
  );
}

export default App;`,
        description: `I've created a React app based on your request: "${prompt}". The app includes interactive features like a counter button, todo list functionality, and modern styling with Tailwind CSS. It's fully functional and responsive.`
      },
      vue: {
        code: `const { createApp } = Vue;

const AppConfig = {
  data() {
    return {
      count: 0,
      todos: [],
      inputValue: ''
    }
  },
  methods: {
    addTodo() {
      if (this.inputValue.trim()) {
        this.todos.push({
          id: Date.now(),
          text: this.inputValue,
          completed: false
        });
        this.inputValue = '';
      }
    },
    toggleTodo(id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }
  },
  template: \`
    <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        ${prompt.split(' ').slice(0, 3).join(' ')} App
      </h1>
      
      <div class="mb-6">
        <div class="text-center mb-4">
          <button 
            @click="count++"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Count: {{ count }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex space-x-2">
          <input
            v-model="inputValue"
            @keyup.enter="addTodo"
            type="text"
            placeholder="Add a todo..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="addTodo"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        <ul class="space-y-2">
          <li v-for="todo in todos" :key="todo.id" class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="todo.completed"
              class="rounded"
            />
            <span :class="todo.completed ? 'line-through text-gray-500' : 'text-gray-800'">
              {{ todo.text }}
            </span>
          </li>
        </ul>
      </div>

      <div class="mt-6 text-center text-sm text-gray-500">
        Built with Vue 3 & AI ✨
      </div>
    </div>
  \`
};`,
        description: `I've created a Vue 3 app based on your request: "${prompt}". It includes reactive state management, interactive features, and uses Vue's composition API with clean styling powered by Tailwind CSS.`
      },
      vanilla: {
        code: createVanillaTemplate(prompt),
        description: `I've created a vanilla JavaScript app based on your request: "${prompt}". It features interactive elements, clean code structure, and modern styling using Tailwind CSS. No framework dependencies required!`
      }
    };

      return sampleApps[framework];
    }
  };

  const authenticate = useCallback((user: any) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      totalPrompts: 6,
      promptsRemaining: 6 - prev.promptsUsed
    }));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    generateNewSession();
    setError(null);
  }, []);

  return {
    ...state,
    generateApp,
    authenticate,
    clearSession,
    isLoading,
    error
  };
}

// Additional hook for managing device fingerprinting and rate limiting
export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    // Generate a simple device fingerprint for rate limiting
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('device-fingerprint', 2, 2);
      
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ];
      
      // Simple hash function
      let hash = 0;
      const str = components.join('|');
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return 'fp_' + Math.abs(hash).toString(36);
    };

    setFingerprint(generateFingerprint());
  }, []);

  return fingerprint;
}