import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock AI responses for the demo (in production, this would use OpenAI/Claude API)
const demoResponses = {
  greeting: [
    "Hello! I'm Zoptal's AI assistant. I'm here to help you learn about our software development services. What would you like to know?",
    "Hi there! Welcome to Zoptal's AI chatbot demo. I can answer questions about our development services, pricing, or help you get started with a project. How can I assist you?",
    "Greetings! I'm an AI-powered assistant built by Zoptal. I can help you explore our capabilities in web development, mobile apps, AI solutions, and more. What interests you most?"
  ],
  pricing: [
    "Great question! Our pricing varies based on project complexity and requirements:\n\n• Web Development: $5,000 - $50,000+\n• Mobile Apps: $15,000 - $100,000+\n• AI Solutions: $25,000 - $200,000+\n• Custom Software: $20,000 - $500,000+\n\nWould you like a detailed quote for your specific project?",
    "I'd be happy to discuss pricing! Our rates depend on several factors:\n\n📊 Project scope and complexity\n⏱️ Timeline requirements\n🛠️ Technology stack needed\n👥 Team size required\n\nFor a personalized quote, I can connect you with our team. What type of project are you considering?"
  ],
  services: [
    "Zoptal offers comprehensive software development services:\n\n🌐 **Web Development**\n- Custom web applications\n- E-commerce platforms\n- Progressive web apps\n\n📱 **Mobile Development**\n- Native iOS & Android apps\n- Cross-platform solutions\n- App Store optimization\n\n🤖 **AI & Machine Learning**\n- Chatbots & virtual assistants\n- Predictive analytics\n- Computer vision\n\n☁️ **Cloud Solutions**\n- AWS, Azure, GCP deployment\n- DevOps & automation\n- Scalable architecture\n\nWhich service interests you most?",
    "We specialize in cutting-edge technology solutions:\n\n✨ **Custom Software Development**\n✨ **AI-Powered Applications**\n✨ **Enterprise Web Platforms**\n✨ **Mobile App Development**\n✨ **Cloud Infrastructure**\n✨ **API Development & Integration**\n\nOur team has delivered 500+ successful projects. What kind of solution are you looking to build?"
  ],
  process: [
    "Our development process is designed for success:\n\n**1. Discovery & Planning** (1-2 weeks)\n- Requirements gathering\n- Technical architecture\n- Project roadmap\n\n**2. Design & Prototyping** (2-3 weeks)\n- UI/UX design\n- Interactive prototypes\n- User testing\n\n**3. Development** (4-16 weeks)\n- Agile development sprints\n- Regular demos\n- Continuous testing\n\n**4. Launch & Support** (Ongoing)\n- Deployment & monitoring\n- Training & documentation\n- Maintenance & updates\n\nWould you like to start with a free consultation?",
    "We follow a proven development methodology:\n\n🎯 **Strategic Planning** - Understanding your business goals\n🎨 **User-Centered Design** - Creating intuitive experiences\n⚡ **Agile Development** - Fast, iterative building\n🚀 **Quality Assurance** - Rigorous testing protocols\n📈 **Performance Optimization** - Speed & scalability focus\n🛠️ **Ongoing Support** - Post-launch maintenance\n\nOur approach ensures 98% project success rate. Ready to get started?"
  ],
  technology: [
    "We work with the latest technologies:\n\n**Frontend:**\nReact, Vue.js, Angular, Next.js, TypeScript\n\n**Backend:**\nNode.js, Python, Java, C#, PHP, Go\n\n**Mobile:**\nReact Native, Flutter, Swift, Kotlin\n\n**AI/ML:**\nTensorFlow, PyTorch, OpenAI, Hugging Face\n\n**Cloud:**\nAWS, Azure, Google Cloud, Docker, Kubernetes\n\n**Databases:**\nPostgreSQL, MongoDB, Redis, MySQL\n\nWhat technology stack fits your project best?",
    "Our tech expertise spans the entire development ecosystem:\n\n🔧 **Modern Frameworks** - React, Vue, Angular, Next.js\n🐍 **AI/ML Stack** - Python, TensorFlow, PyTorch, OpenAI\n☁️ **Cloud Native** - AWS, Kubernetes, Docker, Serverless\n📱 **Mobile First** - React Native, Flutter, Native development\n🗄️ **Scalable Databases** - PostgreSQL, MongoDB, Redis\n⚡ **Performance** - CDN, caching, optimization\n\nWe choose the right tech for your specific needs and goals."
  ],
  timeline: [
    "Project timelines depend on complexity:\n\n⚡ **Simple Website/App:** 4-8 weeks\n🏢 **Business Application:** 8-16 weeks\n🚀 **Complex Platform:** 16-32 weeks\n🤖 **AI Solution:** 12-24 weeks\n\nWe provide detailed timelines during planning, with:\n- Weekly progress updates\n- Milestone deliverables\n- Transparent communication\n- Flexible scope adjustments\n\nWhat's your target launch date?",
    "Here's how we approach project timelines:\n\n📅 **Planning Phase:** 1-2 weeks\n🎨 **Design Phase:** 2-4 weeks\n💻 **Development:** 6-20 weeks (varies by scope)\n🧪 **Testing & QA:** 1-2 weeks\n🚀 **Launch:** 1 week\n\nWe break projects into 2-week sprints with regular demos. This ensures you see progress constantly and can provide feedback. Most clients love this approach!\n\nWhat type of project are you planning?"
  ],
  team: [
    "Our team includes world-class experts:\n\n👨‍💻 **Senior Developers** - 5+ years experience\n🎨 **UI/UX Designers** - Award-winning portfolios\n🤖 **AI Specialists** - PhD-level expertise\n☁️ **DevOps Engineers** - Scalability focused\n📊 **Project Managers** - Agile certified\n🔍 **QA Engineers** - Quality obsessed\n\nWe assign dedicated teams to each project for consistency and accountability. Want to meet your potential team?",
    "Meet the experts who'll build your project:\n\n🌟 **Team Leads** with 10+ years experience\n🎓 **University-trained** engineers and designers\n🏆 **Award-winning** projects and recognition\n🌍 **Global talent** from top tech companies\n📚 **Continuous learning** with latest technologies\n🤝 **Collaborative approach** with your team\n\nEvery team member is carefully selected for your project's needs. Quality is our top priority!"
  ],
  contact: [
    "I'd love to help you get started! Here are the next steps:\n\n📞 **Schedule a Free Consultation**\n- 30-minute strategy session\n- No commitment required\n- Get expert advice\n\n📧 **Email us:** hello@zoptal.com\n📱 **Call us:** +1 (555) 123-4567\n💬 **Live chat:** Available 24/7\n\n🎁 **Free Project Assessment:**\nWe'll analyze your requirements and provide:\n- Technical recommendations\n- Rough timeline estimate\n- Ballpark pricing\n\nShall I connect you with our team now?",
    "Ready to turn your ideas into reality? Let's connect:\n\n🚀 **Free Strategy Call** - Book a 30-min session\n📋 **Project Questionnaire** - Share your requirements\n💡 **Proposal & Quote** - Get detailed pricing\n🤝 **Team Introduction** - Meet your developers\n\n**Contact Options:**\n• Website: zoptal.com/contact\n• Email: hello@zoptal.com\n• Phone: +1 (555) 123-4567\n\nWe typically respond within 2 hours. What's the best way to reach you?"
  ],
  default: [
    "That's an interesting question! While I'm a demo chatbot, I can help you learn about Zoptal's services. Our real AI assistants are much more sophisticated and can handle complex queries about software development, project planning, and technical solutions.\n\nTry asking me about:\n• Our services and capabilities\n• Pricing and project timelines\n• Our development process\n• Technologies we use\n• How to get started\n\nWhat would you like to know?",
    "I appreciate your question! As a demo bot, I have limited knowledge, but I'm here to showcase how AI can enhance customer service. Our production chatbots are trained on extensive knowledge bases and can provide detailed, contextual responses.\n\nI can help you explore:\n💼 Zoptal's service offerings\n💰 Pricing information\n⏱️ Project timelines\n🛠️ Technology expertise\n📞 How to get in touch\n\nWhat interests you most about our development services?"
  ]
};

const chatbotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userId } = chatbotSchema.parse(body);

    // Simulate processing time for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Simple intent classification based on keywords
    const intent = classifyIntent(message.toLowerCase());
    const response = generateResponse(intent, message);
    
    // Generate suggestions based on intent
    const suggestions = generateSuggestions(intent);

    // Mock metadata (in production, this would come from actual AI)
    const metadata = {
      confidence: 0.85 + Math.random() * 0.1,
      intent: intent,
      responseTime: `${(800 + Math.random() * 1200).toFixed(0)}ms`,
      processingSteps: [
        'Intent classification',
        'Context analysis',
        'Response generation',
        'Quality scoring'
      ]
    };

    // Track demo interaction
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      // In production, you'd track this to analytics
      console.info('Demo chatbot interaction:', { intent, message, response });
    }

    return NextResponse.json({
      response,
      intent,
      confidence: metadata.confidence,
      suggestions,
      metadata,
      timestamp: Date.now(),
      conversationId: conversationId || `demo_${Date.now()}`,
      demoNote: "This is a demonstration chatbot. Our production AI assistants provide more sophisticated responses and can integrate with your business systems."
    });

  } catch (error) {
    console.error('Demo chatbot error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      response: "I apologize, but I'm experiencing some technical difficulties. In a real implementation, our AI would have error recovery and fallback responses. Please try asking me about Zoptal's services!",
      intent: 'error',
      confidence: 0,
      suggestions: ['Tell me about your services', 'What are your pricing options?', 'How do I get started?'],
      error: true
    }, { status: 500 });
  }
}

function classifyIntent(message: string): string {
  const intentKeywords = {
    greeting: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
    pricing: ['price', 'cost', 'budget', 'expensive', 'cheap', 'quote', 'estimate', 'how much'],
    services: ['service', 'what do you do', 'capabilities', 'solutions', 'development', 'build', 'create'],
    process: ['process', 'methodology', 'how do you work', 'approach', 'steps', 'workflow'],
    technology: ['technology', 'tech stack', 'programming', 'framework', 'language', 'tools'],
    timeline: ['timeline', 'how long', 'duration', 'time', 'deadline', 'delivery', 'when'],
    team: ['team', 'developers', 'who', 'staff', 'people', 'experience', 'expertise'],
    contact: ['contact', 'reach', 'call', 'email', 'get started', 'begin', 'start']
  };

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }

  return 'default';
}

function generateResponse(intent: string, message: string): string {
  const responses = demoResponses[intent as keyof typeof demoResponses] || demoResponses.default;
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

function generateSuggestions(intent: string): string[] {
  const suggestionMap: Record<string, string[]> = {
    greeting: [
      'Tell me about your services',
      'What are your pricing options?',
      'How do I get started?'
    ],
    pricing: [
      'What services do you offer?',
      'What\'s your development process?',
      'Can I schedule a consultation?'
    ],
    services: [
      'What technologies do you use?',
      'How long do projects take?',
      'Can I see your portfolio?'
    ],
    process: [
      'What are your pricing options?',
      'What technologies do you use?',
      'How do I get started?'
    ],
    technology: [
      'What\'s your development process?',
      'How long do projects take?',
      'What are your pricing options?'
    ],
    timeline: [
      'What\'s your development process?',
      'What are your pricing options?',
      'How do I get started?'
    ],
    team: [
      'What services do you offer?',
      'Can I schedule a consultation?',
      'What\'s your development process?'
    ],
    contact: [
      'What services do you offer?',
      'What are your pricing options?',
      'Tell me about your team'
    ],
    default: [
      'What services do you offer?',
      'What are your pricing options?',
      'How do I get started?'
    ]
  };

  return suggestionMap[intent] || suggestionMap.default;
}