import * as React from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Custom hook for managing state in localStorage
 * @param key - The localStorage key
 * @param initialValue - The initial value if no value exists in localStorage
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = React.useCallback((): T => {
    // Prevent build error "window is undefined"
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = React.useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValue<T> = React.useCallback(
    (value) => {
      // Prevent build error "window is undefined"
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a browser`
        );
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue));

        // Save state
        setStoredValue(newValue);

        // Dispatch a custom event so every useLocalStorage hook are notified
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = React.useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  React.useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // Listen for changes in other tabs/windows
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    const handleLocalStorageChange = () => {
      setStoredValue(readValue());
    };

    // Listen to storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Listen to custom event from same tab
    window.addEventListener('local-storage', handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Custom hook for managing multiple localStorage values with a namespace
 * @param namespace - The namespace prefix for localStorage keys
 * @returns Object with get, set, remove, and clear methods
 */
export function useLocalStorageNamespace(namespace: string) {
  const get = React.useCallback(
    <T>(key: string, defaultValue: T): T => {
      try {
        const item = window.localStorage.getItem(`${namespace}:${key}`);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${namespace}:${key}":`, error);
        return defaultValue;
      }
    },
    [namespace]
  );

  const set = React.useCallback(
    <T>(key: string, value: T): void => {
      try {
        window.localStorage.setItem(`${namespace}:${key}`, JSON.stringify(value));
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${namespace}:${key}":`, error);
      }
    },
    [namespace]
  );

  const remove = React.useCallback(
    (key: string): void => {
      try {
        window.localStorage.removeItem(`${namespace}:${key}`);
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error removing localStorage key "${namespace}:${key}":`, error);
      }
    },
    [namespace]
  );

  const clear = React.useCallback((): void => {
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`${namespace}:`)) {
          window.localStorage.removeItem(key);
        }
      });
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error clearing localStorage namespace "${namespace}":`, error);
    }
  }, [namespace]);

  return { get, set, remove, clear };
}

/**
 * Custom hook for syncing state with localStorage with expiration
 * @param key - The localStorage key
 * @param initialValue - The initial value if no value exists in localStorage
 * @param expirationMinutes - Optional expiration time in minutes
 * @returns [storedValue, setValue, removeValue, isExpired]
 */
export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  expirationMinutes?: number
): [T, SetValue<T>, () => void, boolean] {
  interface StoredData<T> {
    value: T;
    expiry?: number;
  }

  const readValue = React.useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const data: StoredData<T> = JSON.parse(item);
      
      // Check if expired
      if (data.expiry && Date.now() > data.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return data.value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = React.useState<T>(readValue);
  const [isExpired, setIsExpired] = React.useState(false);

  const setValue: SetValue<T> = React.useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key "${key}" even though environment is not a browser`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        const data: StoredData<T> = {
          value: newValue,
          ...(expirationMinutes && {
            expiry: Date.now() + expirationMinutes * 60 * 1000,
          }),
        };

        window.localStorage.setItem(key, JSON.stringify(data));
        setStoredValue(newValue);
        setIsExpired(false);
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, expirationMinutes]
  );

  const removeValue = React.useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      setIsExpired(false);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Check expiry periodically
  React.useEffect(() => {
    if (!expirationMinutes) return;

    const checkExpiry = () => {
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          const data: StoredData<T> = JSON.parse(item);
          if (data.expiry && Date.now() > data.expiry) {
            setIsExpired(true);
            setStoredValue(initialValue);
            window.localStorage.removeItem(key);
          }
        } catch (error) {
          console.warn(`Error checking expiry for key "${key}":`, error);
        }
      }
    };

    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [key, initialValue, expirationMinutes]);

  return [storedValue, setValue, removeValue, isExpired];
}