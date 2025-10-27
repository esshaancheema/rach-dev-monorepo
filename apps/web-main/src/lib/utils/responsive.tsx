// Responsive design utilities and mobile-first design system

// Breakpoint definitions (mobile-first approach)
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (phones)
  sm: 640,    // Small devices (large phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (laptops)
  xl: 1280,   // Extra large devices (desktops)
  '2xl': 1536, // 2X Extra large devices (large desktops)
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Responsive design system configuration
export const RESPONSIVE_CONFIG = {
  // Container max widths for each breakpoint
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Grid system
  grid: {
    columns: 12,
    gap: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '2.5rem',
    },
  },
  
  // Typography scaling
  typography: {
    scales: {
      xs: 0.75,
      sm: 0.875,
      base: 1,
      lg: 1.125,
      xl: 1.25,
      '2xl': 1.5,
      '3xl': 1.875,
      '4xl': 2.25,
      '5xl': 3,
      '6xl': 3.75,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  
  // Spacing system (based on 4px grid)
  spacing: {
    base: 4, // Base unit in pixels
    scale: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96],
  },
} as const;

// Media query utilities
export const mediaQueries = {
  up: (breakpoint: Breakpoint) => `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`,
  down: (breakpoint: Breakpoint) => {
    const nextBreakpoint = Object.values(BREAKPOINTS).find(bp => bp > BREAKPOINTS[breakpoint]);
    return nextBreakpoint ? `@media (max-width: ${nextBreakpoint - 1}px)` : '';
  },
  between: (min: Breakpoint, max: Breakpoint) => 
    `@media (min-width: ${BREAKPOINTS[min]}px) and (max-width: ${BREAKPOINTS[max] - 1}px)`,
  only: (breakpoint: Breakpoint) => {
    const breakpointKeys = Object.keys(BREAKPOINTS) as Breakpoint[];
    const currentIndex = breakpointKeys.indexOf(breakpoint);
    const nextBreakpoint = breakpointKeys[currentIndex + 1];
    
    if (!nextBreakpoint) return mediaQueries.up(breakpoint);
    return mediaQueries.between(breakpoint, nextBreakpoint);
  },
};

// Responsive value utilities
export type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

export function getResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: Breakpoint
): T | undefined {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }

  const breakpointKeys = Object.keys(BREAKPOINTS) as Breakpoint[];
  const currentIndex = breakpointKeys.indexOf(currentBreakpoint);

  // Find the closest defined value at or below current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const key = breakpointKeys[i];
    if (key in value && value[key] !== undefined) {
      return value[key];
    }
  }

  return undefined;
}

// Component responsive utilities
export class ResponsiveUtils {
  static getCurrentBreakpoint(): Breakpoint {
    if (typeof window === 'undefined') return 'lg'; // SSR default

    const width = window.innerWidth;
    const breakpointEntries = Object.entries(BREAKPOINTS) as [Breakpoint, number][];
    
    // Find the largest breakpoint that fits
    for (let i = breakpointEntries.length - 1; i >= 0; i--) {
      const [key, value] = breakpointEntries[i];
      if (width >= value) {
        return key;
      }
    }
    
    return 'xs';
  }

  static isMobile(): boolean {
    const breakpoint = this.getCurrentBreakpoint();
    return breakpoint === 'xs' || breakpoint === 'sm';
  }

  static isTablet(): boolean {
    const breakpoint = this.getCurrentBreakpoint();
    return breakpoint === 'md';
  }

  static isDesktop(): boolean {
    const breakpoint = this.getCurrentBreakpoint();
    return ['lg', 'xl', '2xl'].includes(breakpoint);
  }

  static getContainerWidth(breakpoint?: Breakpoint): string {
    const currentBreakpoint = breakpoint || this.getCurrentBreakpoint();
    return RESPONSIVE_CONFIG.containers[currentBreakpoint] || '100%';
  }

  static generateResponsiveClasses(
    baseClass: string,
    values: ResponsiveValue<string>
  ): string {
    if (typeof values === 'string') {
      return `${baseClass}-${values}`;
    }

    const classes: string[] = [];
    Object.entries(values).forEach(([breakpoint, value]) => {
      if (value !== undefined) {
        const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
        classes.push(`${prefix}${baseClass}-${value}`);
      }
    });

    return classes.join(' ');
  }
}

// React hooks for responsive design
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('lg');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(ResponsiveUtils.getCurrentBreakpoint());
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useResponsiveValue<T>(value: ResponsiveValue<T>): T | undefined {
  const breakpoint = useBreakpoint();
  return getResponsiveValue(value, breakpoint);
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
}

export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}

// Responsive component wrappers
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: Breakpoint;
  padding?: ResponsiveValue<string>;
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = '2xl',
  padding = { xs: '4', sm: '6', lg: '8' },
}: ResponsiveContainerProps) {
  const paddingClasses = ResponsiveUtils.generateResponsiveClasses('px', padding);
  
  return (
    <div className={`mx-auto max-w-${RESPONSIVE_CONFIG.containers[maxWidth]} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<string>;
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = { xs: '4', sm: '6', lg: '8' },
  className = '',
}: ResponsiveGridProps) {
  const columnClasses = ResponsiveUtils.generateResponsiveClasses('grid-cols', columns);
  const gapClasses = ResponsiveUtils.generateResponsiveClasses('gap', gap);
  
  return (
    <div className={`grid ${columnClasses} ${gapClasses} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: ResponsiveValue<keyof typeof RESPONSIVE_CONFIG.typography.scales>;
  weight?: ResponsiveValue<string>;
  lineHeight?: keyof typeof RESPONSIVE_CONFIG.typography.lineHeights;
  className?: string;
}

export function ResponsiveText({
  children,
  size = { xs: 'sm', md: 'base', lg: 'lg' },
  weight = 'normal',
  lineHeight = 'normal',
  className = '',
}: ResponsiveTextProps) {
  const sizeClasses = ResponsiveUtils.generateResponsiveClasses('text', size);
  const weightClasses = ResponsiveUtils.generateResponsiveClasses('font', weight);
  
  return (
    <span className={`leading-${lineHeight} ${sizeClasses} ${weightClasses} ${className}`}>
      {children}
    </span>
  );
}

// Responsive design validation
export class ResponsiveValidator {
  static validateTouchTargets(): Array<{ element: Element; size: number; recommended: number }> {
    const issues: Array<{ element: Element; size: number; recommended: number }> = [];
    const minTouchTarget = 44; // 44px minimum for accessibility

    if (typeof document === 'undefined') return issues;

    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]'
    );

    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      
      if (size < minTouchTarget && size > 0) {
        issues.push({
          element,
          size,
          recommended: minTouchTarget,
        });
      }
    });

    return issues;
  }

  static validateTextReadability(): Array<{ element: Element; fontSize: number; recommended: number }> {
    const issues: Array<{ element: Element; fontSize: number; recommended: number }> = [];
    const minFontSize = 16; // 16px minimum for mobile readability

    if (typeof document === 'undefined' || !ResponsiveUtils.isMobile()) return issues;

    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');

    textElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      if (fontSize < minFontSize && element.textContent?.trim()) {
        issues.push({
          element,
          fontSize,
          recommended: minFontSize,
        });
      }
    });

    return issues;
  }

  static validateHorizontalScrolling(): boolean {
    if (typeof document === 'undefined') return false;
    
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  }

  static validateViewportMeta(): boolean {
    if (typeof document === 'undefined') return false;
    
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) return false;
    
    const content = viewportMeta.getAttribute('content') || '';
    return content.includes('width=device-width') && content.includes('initial-scale=1');
  }

  static generateResponsiveReport(): {
    touchTargets: ReturnType<typeof ResponsiveValidator.validateTouchTargets>;
    textReadability: ReturnType<typeof ResponsiveValidator.validateTextReadability>;
    hasHorizontalScroll: boolean;
    hasViewportMeta: boolean;
    score: number;
  } {
    const touchTargets = this.validateTouchTargets();
    const textReadability = this.validateTextReadability();
    const hasHorizontalScroll = this.validateHorizontalScrolling();
    const hasViewportMeta = this.validateViewportMeta();

    // Calculate score
    let score = 100;
    score -= touchTargets.length * 10; // -10 points per touch target issue
    score -= textReadability.length * 5; // -5 points per text readability issue
    if (hasHorizontalScroll) score -= 20; // -20 points for horizontal scroll
    if (!hasViewportMeta) score -= 30; // -30 points for missing viewport meta

    return {
      touchTargets,
      textReadability,
      hasHorizontalScroll,
      hasViewportMeta,
      score: Math.max(0, score),
    };
  }
}

// CSS-in-JS responsive utilities
export const responsiveStyles = {
  container: (maxWidth: Breakpoint = '2xl') => ({
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: RESPONSIVE_CONFIG.containers[maxWidth],
  }),

  grid: (columns: ResponsiveValue<number>, gap: ResponsiveValue<string> = '4') => {
    const styles: Record<string, any> = {
      display: 'grid',
    };

    if (typeof columns === 'number') {
      styles.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    } else {
      Object.entries(columns).forEach(([breakpoint, cols]) => {
        const mediaQuery = breakpoint === 'xs' ? '' : mediaQueries.up(breakpoint as Breakpoint);
        if (mediaQuery) {
          styles[mediaQuery] = {
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          };
        } else {
          styles.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        }
      });
    }

    return styles;
  },

  spacing: (property: string, value: ResponsiveValue<string | number>) => {
    const styles: Record<string, any> = {};

    if (typeof value === 'string' || typeof value === 'number') {
      styles[property] = typeof value === 'number' ? `${value * 4}px` : value;
    } else {
      Object.entries(value).forEach(([breakpoint, val]) => {
        const mediaQuery = breakpoint === 'xs' ? '' : mediaQueries.up(breakpoint as Breakpoint);
        const pixelValue = typeof val === 'number' ? `${val * 4}px` : val;
        
        if (mediaQuery) {
          styles[mediaQuery] = { [property]: pixelValue };
        } else {
          styles[property] = pixelValue;
        }
      });
    }

    return styles;
  },
};

// Initialize responsive design monitoring
export function initResponsiveMonitoring() {
  if (typeof window === 'undefined') return;

  // Monitor for responsive design issues
  const checkResponsiveIssues = () => {
    const report = ResponsiveValidator.generateResponsiveReport();
    
    if (report.score < 80) {
      console.warn('Responsive design issues detected:', report);
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'responsive_issues', {
          event_category: 'UX',
          value: report.score,
          custom_parameter_1: report.touchTargets.length,
          custom_parameter_2: report.textReadability.length,
        });
      }
    }
  };

  // Check on load and resize
  window.addEventListener('load', checkResponsiveIssues);
  window.addEventListener('resize', debounce(checkResponsiveIssues, 1000));
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}