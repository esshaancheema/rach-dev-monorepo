'use client';

import React, { useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface HelpfulFeedbackProps {
  articleId: string;
}

export default function HelpfulFeedback({ articleId }: HelpfulFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackClick = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    
    if (type === 'not-helpful') {
      setShowFeedbackForm(true);
    } else {
      // For helpful feedback, just track it
      trackFeedback(type, '');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await trackFeedback(feedback!, feedbackText);
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setShowFeedbackForm(false);
  };

  const trackFeedback = async (type: 'helpful' | 'not-helpful', comments: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you'd send this to your analytics/feedback system
    console.info('Feedback tracked:', {
      articleId,
      type,
      comments,
      timestamp: new Date().toISOString()
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HandThumbUpSolidIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Thank you for your feedback!
        </h3>
        <p className="text-gray-600">
          Your input helps us improve our documentation and better serve our community.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Was this article helpful?
      </h3>
      <p className="text-gray-600 mb-6">
        Let us know so we can improve our documentation.
      </p>

      {!feedback ? (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handleFeedbackClick('helpful')}
            className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 font-medium rounded-xl hover:bg-green-200 transition-colors"
          >
            <HandThumbUpIcon className="h-5 w-5 mr-2" />
            Yes, this was helpful
          </button>
          
          <button
            onClick={() => handleFeedbackClick('not-helpful')}
            className="inline-flex items-center px-6 py-3 bg-red-100 text-red-800 font-medium rounded-xl hover:bg-red-200 transition-colors"
          >
            <HandThumbDownIcon className="h-5 w-5 mr-2" />
            No, this wasn't helpful
          </button>
        </div>
      ) : feedback === 'helpful' ? (
        <div className="py-4">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 font-medium rounded-xl">
            <HandThumbUpSolidIcon className="h-5 w-5 mr-2" />
            Thanks for your feedback!
          </div>
        </div>
      ) : showFeedbackForm ? (
        <form onSubmit={handleFeedbackSubmit} className="max-w-md mx-auto">
          <div className="text-left mb-4">
            <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 mb-2">
              How can we improve this article? (Optional)
            </label>
            <textarea
              id="feedback-text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us what was missing or confusing..."
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setShowFeedbackForm(false);
                trackFeedback('not-helpful', '');
                setIsSubmitted(true);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}