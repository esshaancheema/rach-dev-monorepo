import { DemoScenario } from './types';

export const demoScenarios: DemoScenario[] = [
  {
    id: 'ai-chatbot',
    title: 'AI-Powered Customer Service Chatbot',
    description: 'Build an intelligent chatbot that understands customer queries and provides accurate responses using natural language processing.',
    category: 'ai',
    difficulty: 'intermediate',
    estimatedTime: '5 minutes',
    tags: ['AI', 'NLP', 'Customer Service', 'React', 'Python'],
    benefits: [
      '24/7 customer support automation',
      '85% reduction in response time',
      'Handle 1000+ queries simultaneously',
      'Multilingual support',
      'Sentiment analysis and escalation'
    ],
    technologies: ['OpenAI GPT', 'React', 'Node.js', 'WebSocket', 'MongoDB'],
    icon: '🤖',
    steps: [
      {
        id: 'setup',
        title: 'Initialize AI Chatbot',
        description: 'Set up the foundation for our intelligent chatbot with NLP capabilities.',
        code: `import { OpenAI } from 'openai';
import { WebSocketServer } from 'ws';

class IntelligentChatbot {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.conversationHistory = new Map();
  }

  async processMessage(userId, message) {
    const context = this.getConversationContext(userId);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: \`You are a helpful customer service assistant for Zoptal, 
                    a software development company. Be friendly, professional, 
                    and provide accurate information about our services.\`
        },
        ...context,
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    this.updateConversationHistory(userId, message, response.choices[0].message.content);
    return response.choices[0].message.content;
  }
}`,
        language: 'javascript',
        explanation: 'This creates the core chatbot class with OpenAI integration and conversation memory.',
        duration: 3000
      },
      {
        id: 'intent-recognition',
        title: 'Intent Recognition & Classification',
        description: 'Implement intelligent intent recognition to understand what customers really want.',
        code: `// Advanced intent recognition system
class IntentClassifier {
  constructor() {
    this.intents = {
      'pricing': {
        keywords: ['cost', 'price', 'budget', 'quote', 'expensive'],
        response: 'pricing_info',
        confidence_threshold: 0.7
      },
      'technical_support': {
        keywords: ['bug', 'error', 'issue', 'problem', 'not working'],
        response: 'tech_support',
        confidence_threshold: 0.8
      },
      'services': {
        keywords: ['what do you do', 'services', 'development', 'build'],
        response: 'services_info',
        confidence_threshold: 0.6
      }
    };
  }

  async classifyIntent(message) {
    // Use embeddings for semantic similarity
    const embedding = await this.getMessageEmbedding(message);
    
    let bestMatch = null;
    let highestScore = 0;

    for (const [intent, config] of Object.entries(this.intents)) {
      const score = await this.calculateSimilarity(embedding, intent);
      
      if (score > config.confidence_threshold && score > highestScore) {
        bestMatch = intent;
        highestScore = score;
      }
    }

    return {
      intent: bestMatch,
      confidence: highestScore,
      suggestedActions: this.getSuggestedActions(bestMatch)
    };
  }
}`,
        language: 'javascript',
        explanation: 'Smart intent classification helps route conversations to the right responses and actions.',
        duration: 4000
      },
      {
        id: 'real-time-response',
        title: 'Real-Time Response System',
        description: 'Implement WebSocket-based real-time messaging with typing indicators and smart suggestions.',
        input: 'Hi, I need help with web development pricing',
        output: `{
  "response": "Hello! I'd be happy to help you with web development pricing. Our web development services start from $5,000 for basic websites and go up to $50,000+ for complex web applications. 

  Here's a quick breakdown:
  • Basic Website: $5,000 - $15,000
  • E-commerce Site: $15,000 - $35,000  
  • Custom Web App: $25,000 - $100,000+

  What type of web development project are you considering?",
  "intent": "pricing",
  "confidence": 0.92,
  "suggestions": ["Tell me about your project", "Schedule a consultation", "View our portfolio"],
  "metadata": {
    "responseTime": "0.8s",
    "category": "pricing_inquiry"
  }
}`,
        code: `// Real-time WebSocket handler
wss.on('connection', (ws, request) => {
  const userId = extractUserId(request);
  
  ws.on('message', async (data) => {
    const { message, type } = JSON.parse(data);
    
    // Show typing indicator
    ws.send(JSON.stringify({ type: 'typing', status: true }));
    
    try {
      // Process with AI
      const response = await chatbot.processMessage(userId, message);
      const intent = await intentClassifier.classifyIntent(message);
      
      // Hide typing indicator
      ws.send(JSON.stringify({ type: 'typing', status: false }));
      
      // Send response with metadata
      ws.send(JSON.stringify({
        type: 'message',
        response,
        intent: intent.intent,
        confidence: intent.confidence,
        suggestions: intent.suggestedActions,
        timestamp: Date.now()
      }));
      
      // Track analytics
      await trackChatInteraction(userId, message, response, intent);
      
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'I apologize, but I encountered an issue. Let me connect you with a human agent.',
        escalate: true
      }));
    }
  });
});`,
        language: 'javascript',
        explanation: 'WebSocket enables instant responses with typing indicators and smart suggestions.',
        duration: 5000
      },
      {
        id: 'analytics-insights',
        title: 'Analytics & Performance Insights',
        description: 'Track chatbot performance and generate insights for continuous improvement.',
        code: `class ChatbotAnalytics {
  async generateInsights() {
    const analytics = await this.aggregateMetrics();
    
    return {
      performance: {
        averageResponseTime: '0.8s',
        resolutionRate: '89%',
        customerSatisfaction: '4.6/5',
        handoffRate: '11%'
      },
      
      popularQueries: [
        { query: 'pricing information', count: 1247, trend: '+15%' },
        { query: 'technical support', count: 892, trend: '+8%' },
        { query: 'project timeline', count: 654, trend: '+22%' }
      ],
      
      improvements: [
        'Add more pricing FAQs',
        'Improve technical troubleshooting responses',
        'Create project estimation tool'
      ],
      
      businessImpact: {
        leadsGenerated: 342,
        supportTicketsReduced: '67%',
        customerEngagement: '+45%'
      }
    };
  }
}`,
        language: 'javascript',
        explanation: 'Analytics help optimize chatbot performance and measure business impact.',
        duration: 3000
      }
    ],
    demoUrl: '/demos/ai-chatbot',
    githubUrl: 'https://github.com/zoptal/ai-chatbot-demo'
  },
  
  {
    id: 'code-generator',
    title: 'AI Code Generation Assistant',
    description: 'Experience how AI can generate production-ready code from natural language descriptions.',
    category: 'ai',
    difficulty: 'advanced',
    estimatedTime: '7 minutes',
    tags: ['AI', 'Code Generation', 'Automation', 'DevTools'],
    benefits: [
      '10x faster development',
      'Reduce coding errors by 60%',
      'Generate tests automatically',
      'Multiple programming languages',
      'Best practices included'
    ],
    technologies: ['OpenAI Codex', 'AST Parser', 'ESLint', 'Prettier', 'TypeScript'],
    icon: '💻',
    steps: [
      {
        id: 'prompt-analysis',
        title: 'Natural Language Processing',
        description: 'Convert natural language requirements into structured specifications.',
        input: 'Create a React component for a user profile card with edit functionality',
        code: `class RequirementAnalyzer {
  async analyzePrompt(userPrompt) {
    const analysis = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: \`Analyze this development request and extract:
                  1. Component type and framework
                  2. Required features and functionality  
                  3. UI/UX requirements
                  4. Data structure needs
                  5. Testing requirements\`
      }, {
        role: "user", 
        content: userPrompt
      }],
      functions: [{
        name: "extract_requirements",
        parameters: {
          type: "object",
          properties: {
            componentType: { type: "string" },
            framework: { type: "string" },
            features: { type: "array", items: { type: "string" } },
            dataStructure: { type: "object" },
            styling: { type: "string" },
            testingNeeds: { type: "array", items: { type: "string" } }
          }
        }
      }]
    });

    return JSON.parse(analysis.choices[0].message.function_call.arguments);
  }
}`,
        language: 'javascript',
        explanation: 'AI analyzes natural language to understand exact development requirements.',
        duration: 4000
      },
      {
        id: 'code-generation',
        title: 'Production-Ready Code Generation',
        description: 'Generate complete, tested, and documented code from specifications.',
        output: `// UserProfileCard.tsx - Generated by Zoptal AI
import React, { useState } from 'react';
import { User, Edit2, Save, X } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
}

interface UserProfileCardProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => Promise<void>;
  editable?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  onUpdate,
  editable = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {editedUser.avatar ? (
            <img
              src={editedUser.avatar}
              alt={editedUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          )}
        </div>
        
        {editable && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-gray-600 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          {isEditing ? (
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          ) : (
            <p className="text-gray-900">{user.email}</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-500">Role</label>
          {isEditing ? (
            <input
              type="text"
              value={editedUser.role}
              onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          ) : (
            <p className="text-gray-900">{user.role}</p>
          )}
        </div>

        {user.bio && (
          <div>
            <label className="text-sm font-medium text-gray-500">Bio</label>
            {isEditing ? (
              <textarea
                value={editedUser.bio}
                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-900">{user.bio}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};`,
        language: 'typescript',
        explanation: 'Complete React component with TypeScript, proper state management, and error handling.',
        duration: 6000
      },
      {
        id: 'test-generation',
        title: 'Automated Test Generation',
        description: 'Generate comprehensive test suites for the generated code.',
        code: `// UserProfileCard.test.tsx - Generated Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfileCard } from './UserProfileCard';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Developer',
  bio: 'Full-stack developer with 5 years experience'
};

const mockOnUpdate = jest.fn();

describe('UserProfileCard', () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders user information correctly', () => {
    render(<UserProfileCard user={mockUser} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('Full-stack developer with 5 years experience')).toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    render(<UserProfileCard user={mockUser} onUpdate={mockOnUpdate} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('saves changes when save button is clicked', async () => {
    render(<UserProfileCard user={mockUser} onUpdate={mockOnUpdate} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    // Change name
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    
    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...mockUser,
        name: 'Jane Doe'
      });
    });
  });

  it('cancels edit mode when cancel button is clicked', () => {
    render(<UserProfileCard user={mockUser} onUpdate={mockOnUpdate} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    // Change name
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
    
    // Cancel changes
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Should show original name
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('disables edit functionality when not editable', () => {
    render(<UserProfileCard user={mockUser} onUpdate={mockOnUpdate} editable={false} />);
    
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});`,
        language: 'typescript',
        explanation: 'Comprehensive test suite covering all functionality and edge cases.',
        duration: 4000
      }
    ],
    demoUrl: '/demos/code-generator',
    githubUrl: 'https://github.com/zoptal/ai-code-generator'
  },

  {
    id: 'web-app-builder',
    title: 'Rapid Web App Builder',
    description: 'Build a complete web application in minutes with our visual development platform.',
    category: 'web',
    difficulty: 'beginner',
    estimatedTime: '4 minutes',
    tags: ['Web Development', 'No-Code', 'Visual Builder', 'React'],
    benefits: [
      'Build apps 5x faster',
      'No coding required',
      'Professional templates',
      'Automatic responsive design',
      'One-click deployment'
    ],
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel', 'Supabase'],
    icon: '🌐',
    steps: [
      {
        id: 'template-selection',
        title: 'Choose Your Template',
        description: 'Select from professionally designed templates optimized for your industry.',
        explanation: 'Our templates are built with modern web standards and best practices.',
        duration: 2000
      },
      {
        id: 'visual-editing',
        title: 'Visual Drag & Drop Editor',
        description: 'Customize your app with our intuitive visual editor.',
        explanation: 'Real-time preview with instant updates as you build.',
        duration: 3000
      },
      {
        id: 'data-integration',
        title: 'Connect Your Data',
        description: 'Integrate with databases and APIs without writing code.',
        explanation: 'Visual database designer with automatic API generation.',
        duration: 2500
      },
      {
        id: 'deployment',
        title: 'One-Click Deployment',
        description: 'Deploy your app to production with a single click.',
        explanation: 'Automatic SSL, CDN, and global distribution included.',
        duration: 2000
      }
    ]
  }
];

export function getDemoById(id: string): DemoScenario | undefined {
  return demoScenarios.find(demo => demo.id === id);
}

export function getDemosByCategory(category: string): DemoScenario[] {
  return demoScenarios.filter(demo => demo.category === category);
}

export function getFeaturedDemos(): DemoScenario[] {
  return demoScenarios.slice(0, 3);
}