'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ExamplePrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'productivity' | 'business' | 'entertainment' | 'utility' | 'education' | 'social';
  framework: 'react' | 'vue' | 'vanilla' | 'auto';
  complexity: 'simple' | 'moderate' | 'advanced';
  icon: string;
  features: string[];
  estimatedTime: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

interface ExamplePromptsCarouselProps {
  onTryExample: (prompt: string) => void;
  className?: string;
  autoPlay?: boolean;
  showCategory?: boolean;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  // Productivity Apps
  {
    id: 'todo-advanced',
    title: 'Advanced Todo Manager',
    description: 'Feature-rich task management with categories, due dates, and drag & drop',
    prompt: 'Create a comprehensive todo list app with categories, due dates, priority levels, drag and drop reordering, and local storage persistence. Include task filtering, search functionality, and completion statistics.',
    category: 'productivity',
    framework: 'react',
    complexity: 'moderate',
    icon: '📋',
    features: ['Drag & Drop', 'Categories', 'Due Dates', 'Search', 'Statistics'],
    estimatedTime: '2-3 min',
    difficulty: 3,
    tags: ['tasks', 'productivity', 'organization']
  },
  {
    id: 'note-taking',
    title: 'Smart Note Taking App',
    description: 'Rich text editor with markdown support and tag organization',
    prompt: 'Build a note-taking application with rich text editing, markdown support, tag system for organization, search functionality, and auto-save. Include note export and import capabilities.',
    category: 'productivity',
    framework: 'vue',
    complexity: 'advanced',
    icon: '📝',
    features: ['Rich Text', 'Markdown', 'Tags', 'Auto-save', 'Export/Import'],
    estimatedTime: '3-4 min',
    difficulty: 4,
    tags: ['notes', 'markdown', 'editor']
  },

  // Business Apps
  {
    id: 'expense-tracker',
    title: 'Expense Tracker Dashboard',
    description: 'Financial tracking with charts, categories, and budget management',
    prompt: 'Create an expense tracking application with expense categories, monthly budgets, spending analytics with charts, receipt capture simulation, and financial goal tracking. Include expense trends and budget alerts.',
    category: 'business',
    framework: 'react',
    complexity: 'advanced',
    icon: '💰',
    features: ['Budget Tracking', 'Charts', 'Categories', 'Analytics', 'Goals'],
    estimatedTime: '3-5 min',
    difficulty: 4,
    tags: ['finance', 'budget', 'analytics']
  },
  {
    id: 'invoice-generator',
    title: 'Invoice Generator',
    description: 'Professional invoice creation with PDF export capability',
    prompt: 'Build an invoice generator with client management, itemized billing, tax calculations, invoice templates, and PDF export simulation. Include invoice status tracking and payment reminders.',
    category: 'business',
    framework: 'react',
    complexity: 'moderate',
    icon: '🧾',
    features: ['Client Management', 'PDF Export', 'Tax Calc', 'Templates', 'Tracking'],
    estimatedTime: '2-3 min',
    difficulty: 3,
    tags: ['invoice', 'billing', 'business']
  },

  // Entertainment Apps
  {
    id: 'trivia-game',
    title: 'Interactive Trivia Game',
    description: 'Multi-category quiz game with scoring and leaderboards',
    prompt: 'Create an interactive trivia game with multiple categories, different difficulty levels, timer functionality, score tracking, and local leaderboard. Include question shuffling and answer feedback.',
    category: 'entertainment',
    framework: 'vanilla',
    complexity: 'moderate',
    icon: '🎯',
    features: ['Multiple Categories', 'Timer', 'Scoring', 'Leaderboard', 'Feedback'],
    estimatedTime: '2-3 min',
    difficulty: 3,
    tags: ['game', 'quiz', 'trivia']
  },
  {
    id: 'memory-card-game',
    title: 'Memory Card Game',
    description: 'Classic memory matching game with animations and difficulty levels',
    prompt: 'Build a memory card matching game with multiple difficulty levels, smooth animations, move counter, timer, best score tracking, and celebration effects when winning.',
    category: 'entertainment',
    framework: 'vue',
    complexity: 'simple',
    icon: '🎮',
    features: ['Animations', 'Difficulty Levels', 'Timer', 'Best Scores', 'Effects'],
    estimatedTime: '1-2 min',
    difficulty: 2,
    tags: ['game', 'memory', 'cards']
  },

  // Utility Apps
  {
    id: 'password-generator',
    title: 'Secure Password Generator',
    description: 'Advanced password generator with strength analysis and secure storage',
    prompt: 'Create a password generator with customizable length, character types, password strength indicator, copy to clipboard, password history, and security tips. Include password strength analysis.',
    category: 'utility',
    framework: 'vanilla',
    complexity: 'simple',
    icon: '🔐',
    features: ['Customizable', 'Strength Check', 'Clipboard', 'History', 'Tips'],
    estimatedTime: '1-2 min',
    difficulty: 2,
    tags: ['security', 'password', 'generator']
  },
  {
    id: 'weather-widget',
    title: 'Weather Widget Dashboard',
    description: 'Beautiful weather display with forecasts and location detection',
    prompt: 'Build a weather widget with current conditions, 5-day forecast, location search, weather alerts simulation, and beautiful animated weather icons. Include temperature unit conversion.',
    category: 'utility',
    framework: 'react',
    complexity: 'moderate',
    icon: '🌤️',
    features: ['Forecasts', 'Location Search', 'Alerts', 'Animations', 'Unit Convert'],
    estimatedTime: '2-3 min',
    difficulty: 3,
    tags: ['weather', 'forecast', 'location']
  },

  // Education Apps
  {
    id: 'flashcard-study',
    title: 'Digital Flashcard System',
    description: 'Spaced repetition flashcard app for effective learning',
    prompt: 'Create a flashcard study system with deck creation, spaced repetition algorithm simulation, progress tracking, study statistics, and multiple study modes (review, quiz, rapid fire).',
    category: 'education',
    framework: 'vue',
    complexity: 'advanced',
    icon: '🎓',
    features: ['Spaced Repetition', 'Progress Track', 'Study Modes', 'Statistics', 'Deck Mgmt'],
    estimatedTime: '3-4 min',
    difficulty: 4,
    tags: ['learning', 'flashcards', 'study']
  },
  {
    id: 'typing-test',
    title: 'Typing Speed Test',
    description: 'WPM testing with accuracy tracking and improvement tips',
    prompt: 'Build a typing speed test with WPM calculation, accuracy tracking, mistake highlighting, progress charts, different text difficulties, and typing improvement suggestions.',
    category: 'education',
    framework: 'vanilla',
    complexity: 'moderate',
    icon: '⌨️',
    features: ['WPM Calc', 'Accuracy Track', 'Highlighting', 'Charts', 'Tips'],
    estimatedTime: '2-3 min',
    difficulty: 3,
    tags: ['typing', 'speed', 'accuracy']
  },

  // Social Apps
  {
    id: 'chat-interface',
    title: 'Modern Chat Interface',
    description: 'Real-time messaging UI with emojis and message reactions',
    prompt: 'Create a modern chat interface with message bubbles, emoji picker, message reactions, typing indicators, online status, message search, and dark/light theme support.',
    category: 'social',
    framework: 'react',
    complexity: 'advanced',
    icon: '💬',
    features: ['Emoji Picker', 'Reactions', 'Typing Indicator', 'Search', 'Themes'],
    estimatedTime: '3-4 min',
    difficulty: 4,
    tags: ['chat', 'messaging', 'social']
  },
  {
    id: 'social-feed',
    title: 'Social Media Feed',
    description: 'Instagram-style feed with posts, likes, and comments simulation',
    prompt: 'Build a social media feed with post creation, image uploads simulation, like and comment functionality, user profiles, infinite scroll, and post filtering options.',
    category: 'social',
    framework: 'vue',
    complexity: 'advanced',
    icon: '📱',
    features: ['Post Creation', 'Image Upload', 'Like/Comment', 'Profiles', 'Infinite Scroll'],
    estimatedTime: '4-5 min',
    difficulty: 5,
    tags: ['social', 'feed', 'posts']
  }
];

const categoryColors = {
  productivity: 'bg-blue-100 text-blue-800',
  business: 'bg-green-100 text-green-800',
  entertainment: 'bg-purple-100 text-purple-800',
  utility: 'bg-orange-100 text-orange-800',
  education: 'bg-indigo-100 text-indigo-800',
  social: 'bg-pink-100 text-pink-800'
};

const categoryIcons = {
  productivity: <LightBulbIcon className="h-4 w-4" />,
  business: <RocketLaunchIcon className="h-4 w-4" />,
  entertainment: <PuzzlePieceIcon className="h-4 w-4" />,
  utility: <SparklesIcon className="h-4 w-4" />,
  education: <LightBulbIcon className="h-4 w-4" />,
  social: <SparklesIcon className="h-4 w-4" />
};

export default function ExamplePromptsCarousel({
  onTryExample,
  className,
  autoPlay = false,
  showCategory = true
}: ExamplePromptsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const filteredPrompts = selectedCategory
    ? EXAMPLE_PROMPTS.filter(prompt => prompt.category === selectedCategory)
    : EXAMPLE_PROMPTS;

  const categories = Array.from(new Set(EXAMPLE_PROMPTS.map(p => p.category)));

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredPrompts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, filteredPrompts.length]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % filteredPrompts.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + filteredPrompts.length) % filteredPrompts.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "w-2 h-2 rounded-full",
          i < difficulty ? "bg-yellow-400" : "bg-gray-200"
        )}
      />
    ));
  };

  const currentPrompt = filteredPrompts[currentIndex];

  if (filteredPrompts.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-500">No examples found for this category.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Filter */}
      {showCategory && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleCategorySelect(null)}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200",
              selectedCategory === null
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-full transition-colors duration-200 flex items-center space-x-1",
                selectedCategory === category
                  ? categoryColors[category]
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {categoryIcons[category]}
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>
      )}

      {/* Carousel Container */}
      <div
        className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            <div className="flex items-start space-x-6">
              {/* Icon */}
              <div className="text-4xl">{currentPrompt.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{currentPrompt.title}</h3>
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full capitalize",
                        categoryColors[currentPrompt.category]
                      )}>
                        {currentPrompt.category}
                      </span>
                    </div>
                    <p className="text-gray-600">{currentPrompt.description}</p>
                  </div>
                </div>

                {/* Prompt Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 italic line-clamp-3">
                    "{currentPrompt.prompt}"
                  </p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentPrompt.features.map(feature => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>Framework:</span>
                      <span className="font-medium capitalize">{currentPrompt.framework}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Time:</span>
                      <span className="font-medium">{currentPrompt.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Difficulty:</span>
                      <div className="flex space-x-1">
                        {getDifficultyStars(currentPrompt.difficulty)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{currentIndex + 1} of {filteredPrompts.length}</span>
                  </div>
                  <button
                    onClick={() => onTryExample(currentPrompt.prompt)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <PlayIcon className="h-5 w-5" />
                    <span>Try This Example</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
          aria-label="Previous example"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors duration-200"
          aria-label="Next example"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {filteredPrompts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                index === currentIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to example ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredPrompts.slice(0, 4).map((prompt, index) => (
          <button
            key={prompt.id}
            onClick={() => goToSlide(index)}
            className={cn(
              "p-3 text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200",
              index === currentIndex && "ring-2 ring-blue-500 border-blue-500"
            )}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{prompt.icon}</span>
              <span className="font-medium text-sm text-gray-900 truncate">
                {prompt.title}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{prompt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}