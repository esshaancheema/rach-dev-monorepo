# AI Integration Setup Guide for Zoptal Platform

## Quick Start

To test the AI-powered chatbot demo immediately:

```bash
# 1. Add your OpenAI API key to .env file
# Edit .env and replace OPENAI_API_KEY with your actual key

# 2. Start the AI demo
./start-ai-demo.sh

# 3. Open in browser
# Navigate to: http://localhost:3000/demos/ai-chatbot-live
```

## Detailed Setup Instructions

### 1. Configure API Keys

#### Required: OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Update `.env` file:
   ```
   OPENAI_API_KEY="sk-proj-YOUR_ACTUAL_KEY_HERE"
   ```

#### Optional: Anthropic Claude API Key
1. Go to https://console.anthropic.com/
2. Create an API key
3. Update `.env` file:
   ```
   ANTHROPIC_API_KEY="sk-ant-YOUR_ACTUAL_KEY_HERE"
   ```

#### Optional: Google AI API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key
3. Update `.env` file:
   ```
   GOOGLE_AI_API_KEY="YOUR_ACTUAL_KEY_HERE"
   ```

### 2. Start Services Manually

If you prefer to start services individually:

```bash
# Terminal 1: Start AI Service
cd services/ai-service
npm run dev
# Running on http://localhost:4003

# Terminal 2: Start Auth Service (optional but recommended)
cd services/auth-service
OTP_SECRET="mock-otp-secret-32-chars-for-development-environment" npm run dev
# Running on http://localhost:4001

# Terminal 3: Start Frontend
cd apps/web-main
npm run dev
# Running on http://localhost:3000
```

### 3. Test the AI Integration

#### Via Demo Page
1. Navigate to http://localhost:3000/demos/ai-chatbot-live
2. Try asking questions like:
   - "What services does Zoptal offer?"
   - "Tell me about your development process"
   - "What technologies do you use?"
   - "How much does a typical project cost?"

#### Via API (Direct Testing)
```bash
# Test the AI demo endpoint directly
curl -X POST http://localhost:4003/api/v1/demo/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, what services does Zoptal offer?",
    "conversationId": "test_123"
  }'
```

#### Check Service Health
```bash
# AI Service Health
curl http://localhost:4003/health

# Available Models
curl http://localhost:4003/api/v1/demo/models
```

## Architecture Overview

### AI Service Flow
```
User Message → Frontend (port 3000)
    ↓
Next.js API Route (/api/demos/chatbot)
    ↓
AI Service (port 4003)
    ↓
OpenAI/Anthropic/Google AI API
    ↓
Response with suggestions & metadata
```

### Key Components

1. **Frontend Component**: `apps/web-main/src/components/demos/AIChatbotDemo.tsx`
   - Interactive chat UI
   - Real-time typing indicators
   - Suggestion buttons
   - Confidence scores

2. **API Route**: `apps/web-main/src/app/api/demos/chatbot/route.ts`
   - Connects frontend to AI service
   - Fallback responses if AI unavailable
   - Intent classification

3. **AI Service Demo Route**: `services/ai-service/src/routes/demo.routes.ts`
   - No authentication required for demos
   - Conversation memory
   - Multiple AI provider support

4. **AI Service Core**: `services/ai-service/src/services/ai.service.ts`
   - Provider abstraction (OpenAI, Anthropic, Google)
   - Token tracking
   - Response caching
   - Rate limiting

## Cost Management

### Development Tips
- Demo uses GPT-3.5 Turbo by default (cheaper than GPT-4)
- Responses limited to 500 tokens for demos
- Implement caching to reduce API calls
- Rate limiting: 60 requests/hour per user

### Production Recommendations
- Use GPT-3.5 Turbo for general queries
- Reserve GPT-4 for complex tasks
- Implement user-based quotas
- Cache frequent responses
- Monitor usage via OpenAI dashboard

## Troubleshooting

### AI Service Not Responding
```bash
# Check if service is running
lsof -i :4003

# Check logs
cd services/ai-service
npm run dev

# Test health endpoint
curl http://localhost:4003/health
```

### API Key Issues
```bash
# Verify environment variables are loaded
cd services/ai-service
node -e "console.log(process.env.OPENAI_API_KEY?.substring(0,10))"
```

### Frontend Not Connecting
```bash
# Check API route is accessible
curl http://localhost:3000/api/demos/chatbot \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test","conversationId":"test"}'
```

## Advanced Configuration

### Enable All AI Providers
Update `.env`:
```env
ENABLE_OPENAI="true"
ENABLE_ANTHROPIC="true"
ENABLE_GOOGLE_AI="true"
```

### Adjust Rate Limits
Update `.env`:
```env
RATE_LIMIT_WINDOW="15m"
RATE_LIMIT_MAX_REQUESTS="100"
```

### Change Default Model
Update `services/ai-service/src/config/index.ts`:
```typescript
OPENAI_DEFAULT_MODEL: z.string().default('gpt-4'), // Change from gpt-3.5-turbo
```

## Security Considerations

1. **API Keys**: Never commit real API keys to git
2. **Rate Limiting**: Implemented at service level
3. **Input Validation**: Zod schemas validate all inputs
4. **Demo Isolation**: Demo endpoints separate from authenticated routes
5. **Token Limits**: Prevent excessive API usage

## Next Steps

### Re-enable Authentication Routes
The following routes are temporarily disabled but ready to re-enable:
- `/api/auth/change-password`
- `/api/2fa/*` (Two-factor authentication)
- `/api/user-preferences`

To re-enable, update `services/auth-service/src/app.ts` and uncomment the route registrations.

### Production Deployment
1. Set production API keys in environment
2. Enable authentication for non-demo endpoints
3. Configure proper CORS settings
4. Set up monitoring (Sentry, DataDog)
5. Implement usage analytics
6. Set up billing integration for API usage

## Support

For issues or questions:
1. Check service logs for errors
2. Verify API keys are correctly set
3. Ensure all dependencies are installed
4. Check network connectivity between services

## API Usage Examples

### With Conversation Memory
```javascript
// Maintains context across messages
const response = await fetch('/api/demos/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What was my previous question?",
    conversationId: "user_session_123",
    userId: "demo_user"
  })
});
```

### With Different Models (Future Enhancement)
```javascript
// Once authenticated endpoints are enabled
const response = await fetch('http://localhost:4003/api/v1/chat/completions', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Generate code for a React component' }
    ],
    model: 'gpt-4', // or 'claude-3-sonnet', 'gemini-pro'
    maxTokens: 1000
  })
});
```

## Monitoring & Analytics

The AI service tracks:
- Token usage per user
- Response times
- Error rates
- Model performance
- Cost analysis

Access metrics at: http://localhost:4003/metrics (when service is running)

---

Ready to test? Run `./start-ai-demo.sh` and navigate to http://localhost:3000/demos/ai-chatbot-live!