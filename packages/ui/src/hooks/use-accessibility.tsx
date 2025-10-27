import { useState, useEffect, useCallback, useRef } from 'react';

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindnessFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface UseAccessibilityReturn {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  focusManagement: {
    trapFocus: (element: HTMLElement) => () => void;
    restoreFocus: (element: HTMLElement | null) => void;
    announcePageChange: (title: string) => void;
  };
}

/**
 * Hook for managing accessibility preferences and utilities
 */
export function useAccessibility(): UseAccessibilityReturn {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    return saved ? JSON.parse(saved) : {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      fontSize: 'medium',
      colorBlindnessFilter: 'none',
      screenReader: false,
      keyboardNavigation: false
    };
  });

  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Initialize accessibility features
  useEffect(() => {
    // Create screen reader announcement element
    if (!announcementRef.current) {
      const element = document.createElement('div');
      element.setAttribute('aria-live', 'polite');
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    // Apply CSS custom properties for accessibility
    document.documentElement.style.setProperty(
      '--font-size-multiplier',
      getFontSizeMultiplier(preferences.fontSize)
    );

    // Apply high contrast mode
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply color blindness filter
    if (preferences.colorBlindnessFilter !== 'none') {
      document.documentElement.classList.add(`filter-${preferences.colorBlindnessFilter}`);
    } else {
      // Remove all filter classes
      document.documentElement.classList.remove(
        'filter-protanopia',
        'filter-deuteranopia',
        'filter-tritanopia',
        'filter-achromatopsia'
      );
    }

    // Save preferences
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));

    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [preferences]);

  // Listen for system preference changes
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const announceToScreenReader = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (announcementRef.current) {
      announcementRef.current.setAttribute('aria-live', priority);
      announcementRef.current.textContent = message;
      
      // Clear the message after a delay to allow for re-announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const focusManagement = {
    trapFocus: useCallback((element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        element.removeEventListener('keydown', handleTabKey);
      };
    }, []),

    restoreFocus: useCallback((element: HTMLElement | null) => {
      if (element && element.focus) {
        element.focus();
      }
    }, []),

    announcePageChange: useCallback((title: string) => {
      announceToScreenReader(`Navigated to ${title}`, 'assertive');
      document.title = `${title} - Zoptal`;
    }, [announceToScreenReader])
  };

  return {
    preferences,
    updatePreference,
    announceToScreenReader,
    isReducedMotion: preferences.reducedMotion,
    isHighContrast: preferences.highContrast,
    focusManagement
  };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape') => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!onNavigate) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onNavigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          onNavigate('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate('right');
          break;
        case 'Enter':
          onNavigate('enter');
          break;
        case 'Escape':
          onNavigate('escape');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);
}

/**
 * Hook for focus management
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  }, []);

  const focusFirst = useCallback((container: HTMLElement) => {
    const focusableElement = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (focusableElement) {
      focusableElement.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusFirst
  };
}

/**
 * Hook for skip links
 */
export function useSkipLink() {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { skipToContent };
}

// Helper functions
function getFontSizeMultiplier(size: AccessibilityPreferences['fontSize']): string {
  switch (size) {
    case 'small': return '0.875';
    case 'medium': return '1';
    case 'large': return '1.125';
    case 'extra-large': return '1.25';
    default: return '1';
  }
}