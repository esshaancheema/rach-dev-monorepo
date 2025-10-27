import React from 'react';

/**
 * SVG Color Blindness Filters
 * Provides SVG filters to simulate different types of color blindness
 */
export function ColorBlindnessFilters() {
  return (
    <svg
      className="accessibility-filters"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Protanopia Filter (Red-blind) */}
        <filter id="protanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0
                    0.558 0.442 0 0 0
                    0 0.242 0.758 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Deuteranopia Filter (Green-blind) */}
        <filter id="deuteranopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0
                    0.7 0.3 0 0 0
                    0 0.3 0.7 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Tritanopia Filter (Blue-blind) */}
        <filter id="tritanopia-filter">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0
                    0 0.433 0.567 0 0
                    0 0.475 0.525 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Protanomaly Filter (Red-weak) */}
        <filter id="protanomaly-filter">
          <feColorMatrix
            type="matrix"
            values="0.817 0.183 0 0 0
                    0.333 0.667 0 0 0
                    0 0.125 0.875 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Deuteranomaly Filter (Green-weak) */}
        <filter id="deuteranomaly-filter">
          <feColorMatrix
            type="matrix"
            values="0.8 0.2 0 0 0
                    0.258 0.742 0 0 0
                    0 0.142 0.858 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Tritanomaly Filter (Blue-weak) */}
        <filter id="tritanomaly-filter">
          <feColorMatrix
            type="matrix"
            values="0.967 0.033 0 0 0
                    0 0.733 0.267 0 0
                    0 0.183 0.817 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Achromatopsia Filter (Total color blindness) */}
        <filter id="achromatopsia-filter">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
        </filter>

        {/* Blue Cone Monochromacy */}
        <filter id="blue-cone-monochromacy-filter">
          <feColorMatrix
            type="matrix"
            values="0.01775 0.10945 0.87262 0 0
                    0.01775 0.10945 0.87262 0 0
                    0.01775 0.10945 0.87262 0 0
                    0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Color Blindness Test Component
 * Provides a simple test to help users identify if they need color blindness filters
 */
export interface ColorBlindnessTestProps {
  onTestResult?: (type: string) => void;
}

export function ColorBlindnessTest({ onTestResult }: ColorBlindnessTestProps) {
  const testColors = [
    {
      id: 'red-green-test',
      colors: ['#ff0000', '#00ff00'],
      question: 'Can you clearly distinguish between these two colors?',
      type: 'red-green'
    },
    {
      id: 'blue-yellow-test',
      colors: ['#0000ff', '#ffff00'],
      question: 'Can you clearly distinguish between these two colors?',
      type: 'blue-yellow'
    },
    {
      id: 'ishihara-simulation',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
      question: 'Do all these colors appear distinctly different?',
      type: 'general'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Color Vision Test</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This quick test can help determine if you might benefit from color blindness filters.
          For a complete diagnosis, please consult an eye care professional.
        </p>
      </div>

      {testColors.map((test) => (
        <div key={test.id} className="space-y-3">
          <p className="text-sm font-medium">{test.question}</p>
          <div className="flex gap-4 mb-3">
            {test.colors.map((color, index) => (
              <div
                key={index}
                className="w-16 h-16 rounded-lg border-2 border-border"
                style={{ backgroundColor: color }}
                aria-label={`Color sample ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded"
              onClick={() => onTestResult?.(`${test.type}-normal`)}
            >
              Yes, clearly
            </button>
            <button
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded"
              onClick={() => onTestResult?.(`${test.type}-difficulty`)}
            >
              Somewhat difficult
            </button>
            <button
              className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded"
              onClick={() => onTestResult?.(`${test.type}-unable`)}
            >
              Cannot distinguish
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}