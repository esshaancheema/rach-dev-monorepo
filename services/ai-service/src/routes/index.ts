import { FastifyInstance } from 'fastify';
import { chatRoutes } from './chat.routes';
import { codeRoutes } from './code.routes';
import { imageRoutes } from './image.routes';
import { conversationRoutes } from './conversation.routes';
import { modelRoutes } from './model.routes';
import { analysisRoutes } from './analysis.routes';
import { assistantRoutes } from './assistant.routes';

export async function registerRoutes(app: FastifyInstance) {
  // Health check route (no prefix)
  app.get('/health', async () => ({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // API routes
  await app.register(async (app) => {
    // Chat completion routes
    await app.register(chatRoutes, { prefix: '/chat' });
    
    // Code generation and analysis routes
    await app.register(codeRoutes, { prefix: '/code' });
    
    // Image generation routes
    await app.register(imageRoutes, { prefix: '/images' });
    
    // Conversation management
    await app.register(conversationRoutes, { prefix: '/conversations' });
    
    // Model management and stats
    await app.register(modelRoutes, { prefix: '/models' });
    
    // Code analysis and review
    await app.register(analysisRoutes, { prefix: '/analysis' });
    
    // AI assistant features
    await app.register(assistantRoutes, { prefix: '/assistant' });
  }, { prefix: '/api' });
}