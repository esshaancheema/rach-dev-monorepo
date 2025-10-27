import React from 'react';

interface ServiceFAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  faq: ServiceFAQItem[];
  title: string;
}

export default function ServiceFAQ({ faq, title }: ServiceFAQProps) {
  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Get answers to common questions about our {title.toLowerCase()} services.
          </p>
        </div>

        <div className="space-y-8">
          {faq.map((item, index) => (
            <details key={index} className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <summary className="flex justify-between items-center cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                <span className="ml-6 flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}