import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string, formatString: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    throw new Error('Invalid date provided');
  }
  return format(dateObj, formatString);
};

/**
 * Get current timestamp in ISO format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Check if a date string is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = parseISO(dateString);
  return isValid(date);
};