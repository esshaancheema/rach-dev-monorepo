'use client';

import { useState } from 'react';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function BlogNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {!isSubmitted ? (
          <>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with Tech Insights
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest articles, tutorials, and industry insights delivered to your inbox. 
              Join 5,000+ developers and tech leaders who trust our content.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex space-x-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="text-blue-100">
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-sm">Subscribers</div>
              </div>
              <div className="text-blue-100">
                <div className="text-2xl font-bold text-white">Weekly</div>
                <div className="text-sm">Newsletter</div>
              </div>
              <div className="text-blue-100">
                <div className="text-2xl font-bold text-white">No Spam</div>
                <div className="text-sm">Unsubscribe anytime</div>
              </div>
            </div>

            <p className="text-blue-200 text-sm mt-6">
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-white">
                Privacy Policy
              </a>{' '}
              and consent to receive updates from our team.
            </p>
          </>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Our Community! 🎉
            </h2>
            
            <p className="text-xl text-blue-100 mb-6">
              Thanks for subscribing! You'll receive our latest tech insights and tutorials 
              straight to your inbox.
            </p>

            <div className="bg-white bg-opacity-10 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">What's Next?</h3>
              <ul className="text-blue-100 text-sm space-y-2">
                <li>✅ Check your email for a welcome message</li>
                <li>✅ Browse our latest articles below</li>
                <li>✅ Follow us on social media for updates</li>
              </ul>
            </div>

            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-blue-200 hover:text-white transition-colors underline"
            >
              Subscribe another email
            </button>
          </div>
        )}
      </div>
    </section>
  );
}