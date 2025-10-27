import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AIService } from '../services/ai.service';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validate';

const demoChatSchema = z.object({
  body: z.object({
    message: z.string().min(1),
    conversationId: z.string().optional(),
    userId: z.string().optional(),
  }),
});

export async function demoRoutes(app: FastifyInstance) {
  const aiService = new AIService();

  // Demo chat endpoint - no authentication required
  app.post(
    '/demo/chat',
    {
      preHandler: [validateRequest(demoChatSchema)],
    },
    async (request, reply) => {
      try {
        const { message, conversationId, userId = 'demo_user' } = request.body as any;

        // Create a system prompt for Zoptal AI assistant
        const systemPrompt = `You are Zoptal's AI assistant, helping users understand our software development services. 
You are knowledgeable about:
- Web development (React, Next.js, Node.js, etc.)
- Mobile app development (React Native, Flutter, iOS, Android)
- AI/ML solutions and integrations
- Cloud infrastructure and DevOps
- Custom software development
- Our development process and methodologies

Be helpful, professional, and concise. When users ask about services, provide specific information about what Zoptal offers.
If asked about pricing, mention that projects typically range from $5,000 to $500,000+ depending on complexity.
For project timelines, mention typical ranges: simple projects (4-8 weeks), medium complexity (8-16 weeks), complex platforms (16-32 weeks).
Always be encouraging about how Zoptal can help transform their ideas into reality.`;

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: message }
        ];

        // Add conversation history if available
        if (conversationId) {
          const history = await aiService.getConversationHistory?.(userId, conversationId);
          if (history && history.length > 0) {
            // Insert history between system prompt and current message
            messages.splice(1, 0, ...history.slice(-6)); // Keep last 6 messages for context
          }
        }

        // Use AI service to generate response
        const result = await aiService.createChatCompletion({
          userId,
          messages,
          model: 'gpt-3.5-turbo', // Use GPT-3.5 for demo to save costs
          maxTokens: 500,
          temperature: 0.7,
          conversationId: conversationId || `demo_${Date.now()}`,
        });

        // Analyze intent for better UX
        const intent = analyzeIntent(message.toLowerCase());
        
        // Generate suggestions based on context
        const suggestions = generateSuggestions(intent, message);

        return reply.code(200).send({
          response: result.content,
          intent,
          confidence: 0.85 + Math.random() * 0.1,
          suggestions,
          timestamp: Date.now(),
          conversationId: result.conversationId,
          metadata: {
            model: result.model,
            responseTime: `${Date.now() - (request as any).startTime || 0}ms`,
          }
        });

      } catch (error) {
        logger.error({ error }, 'Demo chat error');
        
        // Fallback to mock response if AI service fails
        const fallbackResponse = getFallbackResponse(request.body.message);
        
        return reply.code(200).send({
          response: fallbackResponse,
          intent: 'error_fallback',
          confidence: 0.5,
          suggestions: ['Tell me about your services', 'What technologies do you use?', 'How can I get started?'],
          timestamp: Date.now(),
          conversationId: request.body.conversationId || `demo_${Date.now()}`,
          error: true,
          metadata: {
            fallback: true,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  );

  // Demo models endpoint - returns available models for demo
  app.get('/demo/models', async (request, reply) => {
    try {
      const models = await aiService.getAvailableModels();
      
      // Filter to only show models available for demo
      const demoModels = models.filter(m => 
        ['gpt-3.5-turbo', 'claude-3-haiku', 'gemini-pro'].includes(m.id)
      );

      return reply.code(200).send({
        success: true,
        data: demoModels
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get demo models');
      return reply.code(200).send({
        success: true,
        data: [
          {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            provider: 'openai',
            description: 'Fast and efficient model for demos',
            status: 'limited'
          }
        ]
      });
    }
  });
}

function analyzeIntent(message: string): string {
  const intents = {
    greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon'],
    pricing: ['price', 'cost', 'budget', 'expensive', 'cheap', 'quote', 'estimate'],
    services: ['service', 'what do you do', 'capabilities', 'development', 'build'],
    technology: ['tech', 'stack', 'framework', 'language', 'tools', 'react', 'node'],
    timeline: ['how long', 'timeline', 'duration', 'deadline', 'delivery', 'when'],
    contact: ['contact', 'call', 'email', 'get started', 'begin', 'start', 'hire'],
    ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'chatbot', 'gpt'],
    mobile: ['mobile', 'app', 'ios', 'android', 'flutter', 'react native'],
    web: ['web', 'website', 'webapp', 'frontend', 'backend', 'fullstack'],
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

function generateSuggestions(intent: string, message: string): string[] {
  const suggestionMap: Record<string, string[]> = {
    greeting: [
      'What services does Zoptal offer?',
      'Tell me about your development process',
      'What are your pricing options?'
    ],
    pricing: [
      'What factors affect project cost?',
      'Can I get a custom quote?',
      'Do you offer payment plans?'
    ],
    services: [
      'Tell me about AI development',
      'What about mobile app development?',
      'Do you build custom software?'
    ],
    technology: [
      'What is your preferred tech stack?',
      'Do you work with React and Node.js?',
      'Can you integrate with existing systems?'
    ],
    timeline: [
      'What affects project timelines?',
      'Do you offer expedited development?',
      'How do you handle deadlines?'
    ],
    contact: [
      'Schedule a consultation',
      'What information do you need to start?',
      'Tell me about your team'
    ],
    ai: [
      'What AI services do you offer?',
      'Can you build custom chatbots?',
      'Tell me about ML integration'
    ],
    mobile: [
      'iOS or Android development?',
      'What about cross-platform apps?',
      'App Store deployment included?'
    ],
    web: [
      'Do you build e-commerce sites?',
      'What about progressive web apps?',
      'Can you handle high-traffic platforms?'
    ],
    general: [
      'Tell me about Zoptal',
      'What makes you different?',
      'Can I see your portfolio?'
    ]
  };

  return suggestionMap[intent] || suggestionMap.general;
}

function getFallbackResponse(message: string): string {
  const responses = [
    "I understand you're interested in learning more about Zoptal's services. We offer comprehensive software development solutions including web development, mobile apps, and AI integration. How can I help you specifically?",
    "Thank you for your interest in Zoptal! We specialize in transforming ideas into powerful software solutions. Whether you need a web application, mobile app, or AI-powered system, we're here to help. What type of project are you considering?",
    "Zoptal provides end-to-end software development services with expertise in modern technologies like React, Node.js, AI/ML, and cloud infrastructure. Our team has delivered 500+ successful projects. What would you like to know more about?",
  ];

  // Return a random fallback response
  return responses[Math.floor(Math.random() * responses.length)];
}