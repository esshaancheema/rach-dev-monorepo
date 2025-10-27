// Advanced AI Chatbot System for Zoptal Platform
import { ChatMessage, ChatContext, ChatIntent, ChatResponse } from './types';

export interface ChatbotConfig {
  apiKey?: string;
  apiEndpoint: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'custom';
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  knowledgeBase: string[];
  enableSentimentAnalysis: boolean;
  enableIntentRecognition: boolean;
  enableContextMemory: boolean;
  maxContextHistory: number;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  context: ChatContext;
  metadata: {
    startTime: Date;
    lastActivity: Date;
    userAgent: string;
    page: string;
    intent?: ChatIntent;
    sentiment?: 'positive' | 'negative' | 'neutral';
    satisfaction?: number;
  };
}

export class ZoptalChatbot {
  private config: ChatbotConfig;
  private sessions: Map<string, ChatSession> = new Map();
  private knowledgeBase: Map<string, string> = new Map();

  constructor(config: ChatbotConfig) {
    this.config = config;
    this.initializeKnowledgeBase();
  }

  /**
   * Initialize the knowledge base with Zoptal-specific information
   */
  private initializeKnowledgeBase(): void {
    const knowledge = {
      // Company Information
      'company_overview': `Zoptal is a leading AI-powered software development company specializing in web development, mobile applications, cloud solutions, and digital transformation. We combine cutting-edge technology with innovative design to deliver exceptional software solutions.`,
      
      'services_web': `Our web development services include:
      - Custom web applications using React, Next.js, Vue.js
      - E-commerce platforms and marketplaces
      - Progressive Web Apps (PWAs)
      - API development and integration
      - Performance optimization and SEO`,
      
      'services_mobile': `Mobile development services:
      - Native iOS and Android applications
      - Cross-platform development with React Native and Flutter
      - Mobile UI/UX design
      - App store optimization
      - Push notifications and offline support`,
      
      'services_ai': `AI and machine learning services:
      - Custom AI model development
      - Natural language processing solutions
      - Computer vision applications
      - Predictive analytics
      - AI integration and automation`,
      
      'services_cloud': `Cloud solutions:
      - Cloud architecture design
      - AWS, Azure, and GCP deployment
      - Serverless applications
      - DevOps and CI/CD pipelines
      - Cloud migration services`,
      
      'process': `Our development process:
      1. Discovery & Requirements Gathering
      2. System Architecture & Design
      3. Agile Development with 2-week sprints
      4. Quality Assurance & Testing
      5. Deployment & Launch
      6. Ongoing Support & Maintenance`,
      
      'technologies': `Technologies we specialize in:
      - Frontend: React, Next.js, Vue.js, TypeScript, Tailwind CSS
      - Backend: Node.js, Python, Java, .NET, Go
      - Mobile: React Native, Flutter, Swift, Kotlin
      - AI/ML: TensorFlow, PyTorch, OpenAI, Anthropic
      - Cloud: AWS, Azure, GCP, Docker, Kubernetes
      - Databases: PostgreSQL, MongoDB, Redis, Elasticsearch`,
      
      'pricing': `Our pricing is project-based and depends on:
      - Project complexity and scope
      - Technology requirements
      - Timeline and urgency
      - Team size needed
      - Ongoing support requirements
      We offer free consultations to provide accurate estimates.`,
      
      'timeline': `Typical project timelines:
      - Simple websites: 2-4 weeks
      - Complex web applications: 2-6 months
      - Mobile apps: 3-8 months
      - AI/ML projects: 4-12 months
      - Enterprise solutions: 6-18 months`,
      
      'team': `Our team includes:
      - Senior software engineers
      - AI/ML specialists
      - UI/UX designers
      - DevOps engineers
      - Project managers
      - Quality assurance specialists`,
      
      'support': `We provide:
      - 24/7 technical support
      - Regular maintenance and updates
      - Performance monitoring
      - Security updates
      - Feature enhancements
      - Training and documentation`,
      
      'contact': `Contact information:
      - Email: hello@zoptal.com
      - Phone: +1-555-ZOPTAL-1
      - Schedule a consultation: zoptal.com/contact
      - Live chat available 24/7`
    };

    Object.entries(knowledge).forEach(([key, value]) => {
      this.knowledgeBase.set(key, value);
    });
  }

  /**
   * Start a new chat session
   */
  async startSession(userId?: string, context?: Partial<ChatContext>): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      context: {
        page: context?.page || '/',
        userAgent: context?.userAgent || '',
        referrer: context?.referrer || '',
        sessionStartTime: new Date(),
        ...context
      },
      metadata: {
        startTime: new Date(),
        lastActivity: new Date(),
        userAgent: context?.userAgent || '',
        page: context?.page || '/'
      }
    };

    this.sessions.set(sessionId, session);

    // Send welcome message
    const welcomeMessage = await this.generateWelcomeMessage(session);
    session.messages.push(welcomeMessage);

    return sessionId;
  }

  /**
   * Process user message and generate response
   */
  async processMessage(
    sessionId: string, 
    message: string, 
    attachments?: any[]
  ): Promise<ChatResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message to session
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments
    };
    session.messages.push(userMessage);

    // Update session activity
    session.metadata.lastActivity = new Date();

    try {
      // Analyze message intent
      const intent = await this.analyzeIntent(message, session);
      session.metadata.intent = intent;

      // Analyze sentiment
      if (this.config.enableSentimentAnalysis) {
        const sentiment = await this.analyzeSentiment(message);
        session.metadata.sentiment = sentiment;
      }

      // Generate response
      const response = await this.generateResponse(message, session);

      // Add assistant message to session
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence,
        suggestedActions: response.suggestedActions
      };
      session.messages.push(assistantMessage);

      // Manage context window
      if (session.messages.length > this.config.maxContextHistory) {
        session.messages = session.messages.slice(-this.config.maxContextHistory);
      }

      return {
        message: response.message,
        intent: response.intent,
        confidence: response.confidence,
        suggestedActions: response.suggestedActions,
        sessionId,
        messageId: assistantMessage.id
      };

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Return fallback response
      const fallbackMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment, or feel free to contact our support team directly at hello@zoptal.com for immediate assistance.",
        timestamp: new Date()
      };
      session.messages.push(fallbackMessage);

      return {
        message: fallbackMessage.content,
        intent: 'error',
        confidence: 0,
        sessionId,
        messageId: fallbackMessage.id
      };
    }
  }

  /**
   * Generate welcome message based on context
   */
  private async generateWelcomeMessage(session: ChatSession): Promise<ChatMessage> {
    let welcomeText = "👋 Hello! I'm Zoptal's AI assistant. I'm here to help you learn about our software development services and answer any questions you might have.";

    // Customize based on page context
    if (session.context.page?.includes('/services')) {
      welcomeText += " I see you're looking at our services. What type of project are you interested in?";
    } else if (session.context.page?.includes('/portfolio')) {
      welcomeText += " I see you're checking out our portfolio. Would you like to know more about any specific project?";
    } else if (session.context.page?.includes('/blog')) {
      welcomeText += " I see you're reading our blog. Do you have any questions about the technologies or concepts discussed?";
    } else {
      welcomeText += " How can I assist you today?";
    }

    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
      intent: 'welcome'
    };
  }

  /**
   * Analyze user message intent
   */
  private async analyzeIntent(message: string, session: ChatSession): Promise<ChatIntent> {
    const messageLower = message.toLowerCase();

    // Intent patterns
    const intentPatterns = {
      'services_inquiry': [
        'what services', 'what do you do', 'services', 'capabilities',
        'web development', 'mobile app', 'ai development', 'cloud'
      ],
      'pricing_inquiry': [
        'cost', 'price', 'pricing', 'budget', 'how much', 'quote', 'estimate'
      ],
      'project_inquiry': [
        'project', 'build', 'develop', 'create', 'need help', 'looking for'
      ],
      'timeline_inquiry': [
        'how long', 'timeline', 'duration', 'when', 'delivery', 'deadline'
      ],
      'technology_inquiry': [
        'technology', 'tech stack', 'framework', 'programming', 'language'
      ],
      'portfolio_inquiry': [
        'portfolio', 'examples', 'case studies', 'previous work', 'projects'
      ],
      'contact_inquiry': [
        'contact', 'get in touch', 'meeting', 'consultation', 'call', 'email'
      ],
      'support_inquiry': [
        'support', 'help', 'problem', 'issue', 'bug', 'error'
      ]
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => messageLower.includes(pattern))) {
        return intent as ChatIntent;
      }
    }

    return 'general_inquiry';
  }

  /**
   * Analyze message sentiment
   */
  private async analyzeSentiment(message: string): Promise<'positive' | 'negative' | 'neutral'> {
    const positiveWords = ['great', 'excellent', 'awesome', 'love', 'amazing', 'perfect', 'good', 'nice', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'poor', 'disappointing', 'frustrated'];

    const messageLower = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Generate AI response
   */
  private async generateResponse(message: string, session: ChatSession): Promise<{
    message: string;
    intent: ChatIntent;
    confidence: number;
    suggestedActions?: string[];
  }> {
    const intent = session.metadata.intent || 'general_inquiry';
    
    // Get relevant knowledge base information
    const relevantInfo = this.getRelevantKnowledge(intent, message);
    
    // Build context for AI model
    const context = this.buildContext(session, relevantInfo);
    
    // For demo purposes, we'll use rule-based responses
    // In production, this would call the actual AI API
    const response = await this.generateRuleBasedResponse(intent, message, relevantInfo);
    
    return {
      message: response.message,
      intent,
      confidence: response.confidence,
      suggestedActions: response.suggestedActions
    };
  }

  /**
   * Get relevant knowledge base information
   */
  private getRelevantKnowledge(intent: ChatIntent, message: string): string[] {
    const relevantKeys: string[] = [];
    
    switch (intent) {
      case 'services_inquiry':
        relevantKeys.push('company_overview', 'services_web', 'services_mobile', 'services_ai', 'services_cloud');
        break;
      case 'pricing_inquiry':
        relevantKeys.push('pricing', 'process');
        break;
      case 'timeline_inquiry':
        relevantKeys.push('timeline', 'process');
        break;
      case 'technology_inquiry':
        relevantKeys.push('technologies');
        break;
      case 'contact_inquiry':
        relevantKeys.push('contact');
        break;
      default:
        relevantKeys.push('company_overview');
    }
    
    return relevantKeys.map(key => this.knowledgeBase.get(key) || '').filter(Boolean);
  }

  /**
   * Build context for AI model
   */
  private buildContext(session: ChatSession, relevantInfo: string[]): string {
    const recentMessages = session.messages.slice(-6); // Last 6 messages
    const messageHistory = recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    return `
Context: User is on page ${session.context.page}
Recent conversation:
${messageHistory}

Relevant information:
${relevantInfo.join('\n\n')}

System: You are Zoptal's AI assistant. Be helpful, professional, and focus on Zoptal's services.
`;
  }

  /**
   * Generate rule-based response (fallback for demo)
   */
  private async generateRuleBasedResponse(
    intent: ChatIntent, 
    message: string, 
    relevantInfo: string[]
  ): Promise<{ message: string; confidence: number; suggestedActions?: string[] }> {
    
    switch (intent) {
      case 'services_inquiry':
        return {
          message: `${relevantInfo[0]}\n\nOur main services include:\n• Web Development (React, Next.js)\n• Mobile Apps (React Native, Flutter)\n• AI/ML Solutions\n• Cloud Infrastructure\n\nWould you like to know more about any specific service?`,
          confidence: 0.9,
          suggestedActions: ['Learn about Web Development', 'Explore AI Services', 'View Portfolio', 'Get a Quote']
        };
        
      case 'pricing_inquiry':
        return {
          message: `${relevantInfo[0]}\n\nTo provide you with an accurate estimate, I'd love to learn more about your project. Could you tell me:\n• What type of application do you need?\n• What's your timeline?\n• Any specific features or requirements?\n\nWould you like to schedule a free consultation to discuss your project in detail?`,
          confidence: 0.85,
          suggestedActions: ['Schedule Consultation', 'Describe My Project', 'View Sample Pricing']
        };
        
      case 'timeline_inquiry':
        return {
          message: `${relevantInfo[0]}\n\nProject timelines vary based on complexity and requirements. To give you a more accurate timeline, could you share:\n• What type of project you're planning?\n• Key features you need?\n• Your preferred launch date?\n\nI'd be happy to connect you with our project team for a detailed timeline discussion.`,
          confidence: 0.8,
          suggestedActions: ['Schedule Planning Call', 'Describe Project Scope', 'View Case Studies']
        };
        
      case 'contact_inquiry':
        return {
          message: `${relevantInfo[0]}\n\nI'd be happy to connect you with our team! Here are the best ways to reach us:\n\n📧 Email: hello@zoptal.com\n📞 Phone: +1-555-ZOPTAL-1\n💬 Schedule a free consultation\n\nWhat would work best for you?`,
          confidence: 0.95,
          suggestedActions: ['Schedule Consultation', 'Send Email', 'Call Now', 'Continue Chat']
        };
        
      default:
        return {
          message: "I'd be happy to help you learn more about Zoptal's software development services. We specialize in web development, mobile apps, AI solutions, and cloud infrastructure. What specific area interests you most?",
          confidence: 0.7,
          suggestedActions: ['Our Services', 'View Portfolio', 'Get Quote', 'Schedule Call']
        };
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * End chat session
   */
  async endSession(sessionId: string, feedback?: { rating: number; comment?: string }): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && feedback) {
      session.metadata.satisfaction = feedback.rating;
    }
    
    // In production, save session to database
    this.sessions.delete(sessionId);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}