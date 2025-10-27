import * as React from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that returns a debounced callback
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = React.useRef(callback);

  // Update callback ref when callback changes
  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Custom hook for debounced state
 * @param initialValue - The initial state value
 * @param delay - The delay in milliseconds
 * @returns [value, debouncedValue, setValue]
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, debouncedValue, setValue];
}

/**
 * Custom hook that provides a loading state while debouncing
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns Object with debouncedValue and isDebouncing state
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number
): { debouncedValue: T; isDebouncing: boolean } {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const [isDebouncing, setIsDebouncing] = React.useState(false);

  React.useEffect(() => {
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return { debouncedValue, isDebouncing };
}

/**
 * Custom hook for debounced search with loading state
 * @param searchTerm - The search term to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns Object with debouncedSearchTerm and isSearching state
 */
export function useDebouncedSearch(
  searchTerm: string,
  delay: number = 500
): { debouncedSearchTerm: string; isSearching: boolean } {
  const { debouncedValue: debouncedSearchTerm, isDebouncing: isSearching } = 
    useDebouncedValue(searchTerm, delay);

  return { debouncedSearchTerm, isSearching };
}

/**
 * Custom hook that cancels the previous debounced callback
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @returns Object with debouncedCallback and cancel function
 */
export function useCancellableDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = React.useRef(callback);

  React.useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedCallback = React.useCallback(
    (...args: Parameters<T>) => {
      cancel();

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel]
  );

  React.useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debouncedCallback, cancel };
}