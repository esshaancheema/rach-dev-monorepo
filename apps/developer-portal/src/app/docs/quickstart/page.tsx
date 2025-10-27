'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  CheckIcon, 
  DocumentDuplicateIcon,
  PlayIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  KeyIcon,
  CodeBracketIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

const QuickStartPage = () => {
  const [copiedSteps, setCopiedSteps] = useState<Record<string, boolean>>({});
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const copyToClipboard = async (text: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSteps(prev => ({ ...prev, [stepId]: true }));
      setTimeout(() => {
        setCopiedSteps(prev => ({ ...prev, [stepId]: false }));
      }, 2000);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const codeExamples = {
    javascript: {
      install: 'npm install @zoptal/sdk',
      initialize: `import { ZoptalClient } from '@zoptal/sdk';

const client = new ZoptalClient({
  apiKey: 'your-api-key-here',
  baseURL: 'https://api.zoptal.com'
});`,
      authenticate: `// Authenticate a user
const authResult = await client.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

console.log('Access token:', authResult.accessToken);`,
      createProject: `// Create a new project
const project = await client.projects.create({
  name: 'My First Project',
  description: 'Learning the Zoptal API',
  visibility: 'private'
});

console.log('Project created:', project.id);`,
      aiChat: `// Start an AI chat session
const chat = await client.ai.createChat({
  title: 'Help with React',
  model: 'gpt-4'
});

// Send a message
const response = await client.ai.sendMessage(chat.id, {
  content: 'How do I create a React component?'
});

console.log('AI Response:', response.content);`
    },
    python: {
      install: 'pip install zoptal-sdk',
      initialize: `from zoptal import ZoptalClient

client = ZoptalClient(
    api_key='your-api-key-here',
    base_url='https://api.zoptal.com'
)`,
      authenticate: `# Authenticate a user
auth_result = client.auth.login(
    email='user@example.com',
    password='password123'
)

print(f'Access token: {auth_result.access_token}')`,
      createProject: `# Create a new project
project = client.projects.create(
    name='My First Project',
    description='Learning the Zoptal API',
    visibility='private'
)

print(f'Project created: {project.id}')`,
      aiChat: `# Start an AI chat session
chat = client.ai.create_chat(
    title='Help with Python',
    model='gpt-4'
)

# Send a message
response = client.ai.send_message(
    chat_id=chat.id,
    content='How do I create a Python class?'
)

print(f'AI Response: {response.content}')`
    },
    curl: {
      install: '# No installation required - cURL is built into most systems',
      initialize: `# Set your API key as an environment variable
export ZOPTAL_API_KEY="your-api-key-here"`,
      authenticate: `curl -X POST "https://api.zoptal.com/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'`,
      createProject: `curl -X POST "https://api.zoptal.com/projects" \\
  -H "Authorization: Bearer $ZOPTAL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First Project",
    "description": "Learning the Zoptal API",
    "visibility": "private"
  }'`,
      aiChat: `# Create chat session
curl -X POST "https://api.zoptal.com/ai/chat" \\
  -H "Authorization: Bearer $ZOPTAL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Help with cURL",
    "model": "gpt-4"
  }'

# Send message (replace CHAT_ID with actual chat ID)
curl -X POST "https://api.zoptal.com/ai/chat/CHAT_ID/messages" \\
  -H "Authorization: Bearer $ZOPTAL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "How do I make HTTP requests with cURL?"
  }'`
    }
  };

  const steps = [
    {
      id: 'setup',
      title: 'Get Your API Key',
      description: 'Sign up for a Zoptal account and get your API key from the dashboard.',
      icon: KeyIcon,
      action: (
        <Link href="https://app.zoptal.com/settings/api-keys">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get API Key
          </motion.button>
        </Link>
      )
    },
    {
      id: 'install',
      title: 'Install the SDK',
      description: 'Install the official Zoptal SDK for your preferred language.',
      icon: CubeIcon,
      code: codeExamples[selectedLanguage as keyof typeof codeExamples].install
    },
    {
      id: 'initialize',
      title: 'Initialize the Client',
      description: 'Create a client instance with your API key.',
      icon: CodeBracketIcon,
      code: codeExamples[selectedLanguage as keyof typeof codeExamples].initialize
    },
    {
      id: 'authenticate',
      title: 'Authenticate a User',
      description: 'Learn how to authenticate users and get access tokens.',
      icon: CheckIcon,
      code: codeExamples[selectedLanguage as keyof typeof codeExamples].authenticate
    },
    {
      id: 'create-project',
      title: 'Create Your First Project',
      description: 'Create a project to organize your work.',
      icon: RocketLaunchIcon,
      code: codeExamples[selectedLanguage as keyof typeof codeExamples].createProject
    },
    {
      id: 'ai-chat',
      title: 'Use AI Services',
      description: 'Integrate AI-powered features into your application.',
      icon: PlayIcon,
      code: codeExamples[selectedLanguage as keyof typeof codeExamples].aiChat
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Start Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get up and running with the Zoptal API in just a few minutes. 
            Follow this step-by-step guide to make your first API call.
          </p>
        </motion.div>

        {/* Language Selector */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              {[
                { id: 'javascript', label: 'JavaScript' },
                { id: 'python', label: 'Python' },
                { id: 'curl', label: 'cURL' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md transition-colors
                    ${selectedLanguage === lang.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {step.description}
                    </p>

                    {step.action && (
                      <div className="mb-4">
                        {step.action}
                      </div>
                    )}

                    {step.code && (
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedLanguage === 'javascript' ? 'JavaScript' :
                             selectedLanguage === 'python' ? 'Python' : 'cURL'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(step.code!, step.id)}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            {copiedSteps[step.id] ? (
                              <CheckIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            )}
                            {copiedSteps[step.id] ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        
                        <SyntaxHighlighter
                          language={selectedLanguage === 'curl' ? 'bash' : selectedLanguage}
                          style={vscDarkPlus}
                          className="rounded-lg"
                          customStyle={{ 
                            background: '#1f2937',
                            fontSize: '14px',
                            padding: '16px'
                          }}
                        >
                          {step.code}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Congratulations!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            You've successfully made your first API calls to the Zoptal platform. 
            Now you're ready to build amazing applications!
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/docs/api">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Explore the API
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Dive deeper into our comprehensive API reference.
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  View API Docs
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            </Link>

            <Link href="/docs/guides">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Follow Guides
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Learn with step-by-step tutorials and examples.
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Browse Guides
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            </Link>

            <Link href="/api-explorer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Try the API
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Test endpoints interactively with our API explorer.
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Open Explorer
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Need help getting started?{' '}
            <Link href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our support team
            </Link>{' '}
            or{' '}
            <Link href="/community" className="text-blue-600 hover:text-blue-700 font-medium">
              join our community
            </Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickStartPage;