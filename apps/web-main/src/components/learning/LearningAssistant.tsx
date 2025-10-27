'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  LightBulbIcon,
  BookOpenIcon,
  PlayIcon,
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  UserIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { 
  LearningAssistant as Assistant, 
  LearningTip, 
  InteractiveTutorial, 
  PersonalizedRecommendation, 
  CodeExplanation,
  UserProgress
} from '@/lib/ai/learning-assistant';
import { ProjectFile } from '@/lib/ai/enhanced-code-generator';
import { AnalysisResult } from '@/lib/ai/code-analyzer';

interface LearningAssistantProps {
  files: ProjectFile[];
  framework: string;
  userId: string;
  analysisResult?: AnalysisResult;
  selectedFile?: ProjectFile;
  selectedLine?: number;
  onTutorialStart?: (tutorialId: string) => void;
  className?: string;
}

type ActiveTab = 'tips' | 'tutorials' | 'recommendations' | 'progress' | 'explanation';

export default function LearningAssistant({
  files,
  framework,
  userId,
  analysisResult,
  selectedFile,
  selectedLine,
  onTutorialStart,
  className
}: LearningAssistantProps) {
  const [assistant] = useState(() => new Assistant());
  const [activeTab, setActiveTab] = useState<ActiveTab>('tips');
  const [tips, setTips] = useState<LearningTip[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [codeExplanation, setCodeExplanation] = useState<CodeExplanation | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<InteractiveTutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [stepValidation, setStepValidation] = useState<{ isValid: boolean; feedback: string; hints?: string[] } | null>(null);

  useEffect(() => {
    loadLearningData();
  }, [files, framework, analysisResult]);

  useEffect(() => {
    if (selectedFile) {
      explainSelectedCode();
    }
  }, [selectedFile, selectedLine]);

  const loadLearningData = async () => {
    setIsLoading(true);
    try {
      const [tipsData, recommendationsData] = await Promise.all([
        assistant.generateContextualTips(files, framework, analysisResult),
        assistant.getPersonalizedRecommendations(userId, files, framework)
      ]);

      setTips(tipsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Failed to load learning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const explainSelectedCode = async () => {
    if (!selectedFile) return;

    try {
      const explanation = await assistant.explainCode(selectedFile, selectedLine);
      setCodeExplanation(explanation);
      setActiveTab('explanation');
    } catch (error) {
      console.error('Failed to explain code:', error);
    }
  };

  const startTutorial = async (tutorialId: string) => {
    try {
      const tutorial = await assistant.startInteractiveTutorial(tutorialId, userId);
      if (tutorial) {
        setActiveTutorial(tutorial);
        setCurrentStep(0);
        setUserCode('');
        setStepValidation(null);
        onTutorialStart?.(tutorialId);
      }
    } catch (error) {
      console.error('Failed to start tutorial:', error);
    }
  };

  const validateStep = async () => {
    if (!activeTutorial) return;

    const step = activeTutorial.steps[currentStep];
    if (!step) return;

    try {
      const validation = await assistant.validateTutorialStep(
        activeTutorial.id,
        step.id,
        userCode
      );
      
      setStepValidation(validation);

      if (validation.isValid) {
        await assistant.completeTutorialStep(activeTutorial.id, step.id, userId);
        
        // Move to next step after delay
        setTimeout(() => {
          if (currentStep < activeTutorial.steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setUserCode('');
            setStepValidation(null);
          } else {
            // Tutorial completed
            setActiveTutorial(null);
            loadLearningData(); // Refresh data
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to validate step:', error);
    }
  };

  const getTipIcon = (tip: LearningTip) => {
    switch (tip.type) {
      case 'concept':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'best-practice':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'pattern':
        return <BeakerIcon className="h-5 w-5" />;
      case 'security':
        return <ExclamationCircleIcon className="h-5 w-5" />;
      case 'performance':
        return <RocketLaunchIcon className="h-5 w-5" />;
      case 'accessibility':
        return <UserIcon className="h-5 w-5" />;
      default:
        return <LightBulbIcon className="h-5 w-5" />;
    }
  };

  const getTipColor = (tip: LearningTip) => {
    switch (tip.type) {
      case 'security':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'performance':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'accessibility':
        return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'best-practice':
        return 'text-green-500 bg-green-50 border-green-200';
      default:
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Learning Assistant</h2>
              <p className="text-purple-100 text-sm">
                Personalized learning for {framework} development
              </p>
            </div>
          </div>
          
          {userProgress && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <TrophyIcon className="h-5 w-5" />
                <span className="font-semibold">Level {userProgress.level}</span>
              </div>
              <div className="text-sm text-purple-100">
                {userProgress.experiencePoints} XP
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 px-6">
          {[
            { id: 'tips', label: 'Smart Tips', icon: LightBulbIcon, count: tips.length },
            { id: 'recommendations', label: 'For You', icon: StarIcon, count: recommendations.length },
            { id: 'tutorials', label: 'Tutorials', icon: PlayIcon },
            { id: 'explanation', label: 'Code Explain', icon: BookOpenIcon },
            { id: 'progress', label: 'Progress', icon: ChartBarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={cn(
                "flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Analyzing your code...</span>
          </div>
        )}

        {/* Smart Tips Tab */}
        {activeTab === 'tips' && !isLoading && (
          <div className="space-y-4">
            {tips.length === 0 ? (
              <div className="text-center py-8">
                <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tips Available</h3>
                <p className="text-gray-600">Keep coding! Tips will appear as you work.</p>
              </div>
            ) : (
              tips.map(tip => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("p-4 rounded-lg border-2", getTipColor(tip))}
                >
                  <div className="flex items-start space-x-3">
                    {getTipIcon(tip)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                        <span className={cn("px-2 py-1 text-xs font-medium rounded", getCategoryColor(tip.category))}>
                          {tip.category}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{tip.description}</p>
                      
                      {tip.codeExample && (
                        <div className="space-y-2">
                          {tip.codeExample.before && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-1">Before:</div>
                              <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                                <code>{tip.codeExample.before}</code>
                              </pre>
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              {tip.codeExample.before ? 'After:' : 'Example:'}
                            </div>
                            <pre className="bg-green-50 border border-green-200 p-2 rounded text-sm overflow-x-auto">
                              <code>{tip.codeExample.after}</code>
                            </pre>
                          </div>
                          <p className="text-sm text-gray-600 italic">{tip.codeExample.explanation}</p>
                        </div>
                      )}
                      
                      {tip.relatedConcepts.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">Related Concepts:</div>
                          <div className="flex flex-wrap gap-1">
                            {tip.relatedConcepts.map(concept => (
                              <span key={concept} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && !isLoading && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations</h3>
                <p className="text-gray-600">Keep learning! Recommendations will appear based on your progress.</p>
              </div>
            ) : (
              recommendations.map(rec => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("p-4 bg-white border rounded-lg", getPriorityColor(rec.priority))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded",
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        )}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{rec.description}</p>
                      <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{rec.timeToComplete}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrophyIcon className="h-4 w-4" />
                          <span>{rec.skillsToGain.length} skills</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {rec.skillsToGain.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (rec.action.type === 'start-tutorial') {
                          startTutorial(rec.action.target);
                        }
                      }}
                      className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            {activeTutorial ? (
              /* Active Tutorial */
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTutorial.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Step {currentStep + 1} of {activeTutorial.steps.length}</span>
                    <span>•</span>
                    <span>{activeTutorial.difficulty}</span>
                    <span>•</span>
                    <span>{activeTutorial.estimatedTime}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / activeTutorial.steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Current Step */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {activeTutorial.steps[currentStep].title}
                  </h4>
                  <p className="text-gray-700 mb-4">
                    {activeTutorial.steps[currentStep].instruction}
                  </p>

                  {/* Code Editor */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Code:
                    </label>
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Write your code here..."
                    />
                  </div>

                  {/* Validation Results */}
                  {stepValidation && (
                    <div className={cn(
                      "p-3 rounded-lg mb-4",
                      stepValidation.isValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    )}>
                      <div className="flex items-center space-x-2">
                        {stepValidation.isValid ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                        <span className={cn(
                          "font-medium",
                          stepValidation.isValid ? "text-green-800" : "text-red-800"
                        )}>
                          {stepValidation.feedback}
                        </span>
                      </div>
                      
                      {stepValidation.hints && stepValidation.hints.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Hints:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {stepValidation.hints.map((hint, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <LightBulbIcon className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <span>{hint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => setActiveTutorial(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Exit Tutorial
                    </button>
                    <button
                      onClick={validateStep}
                      disabled={!userCode.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Check Solution
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Tutorial Library */
              <div className="text-center py-8">
                <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Tutorials</h3>
                <p className="text-gray-600 mb-6">Hands-on learning experiences tailored to your skill level</p>
                
                <button
                  onClick={() => startTutorial('react-fundamentals')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start React Fundamentals
                </button>
              </div>
            )}
          </div>
        )}

        {/* Code Explanation Tab */}
        {activeTab === 'explanation' && (
          <div>
            {codeExplanation ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Explanation</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {codeExplanation.file} {codeExplanation.line !== undefined && `(line ${codeExplanation.line + 1})`}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Code:</h4>
                  <pre className="text-sm font-mono text-gray-800 overflow-x-auto">
                    <code>{codeExplanation.codeSnippet}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Explanation:</h4>
                  <p className="text-gray-700">{codeExplanation.explanation}</p>
                </div>

                {codeExplanation.keyConCepts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Concepts:</h4>
                    <div className="flex flex-wrap gap-2">
                      {codeExplanation.keyConCepts.map(concept => (
                        <span key={concept} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {codeExplanation.bestPractices.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Best Practices:</h4>
                    <ul className="space-y-2">
                      {codeExplanation.bestPractices.map((practice, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {codeExplanation.improvementSuggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Improvement Suggestions:</h4>
                    <ul className="space-y-2">
                      {codeExplanation.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <SparklesIcon className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Code to Explain</h3>
                <p className="text-gray-600">Click on a file or line of code to get a detailed explanation</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="text-center py-8">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Progress</h3>
            <p className="text-gray-600">Track your learning journey and achievements</p>
          </div>
        )}
      </div>
    </div>
  );
}