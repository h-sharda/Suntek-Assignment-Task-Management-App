import { format, formatDistanceToNow, formatDistance } from 'date-fns';

/**
 * Format a duration in milliseconds to HH:MM:SS
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (ms) => {
  if (!ms) return '00:00:00';
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Format a duration in milliseconds to human-readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration string (e.g., "2h 30m")
 */
export const formatDurationHuman = (ms) => {
  if (!ms) return '0m';
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m`;
  } else {
    result += `${seconds}s`;
  }
  
  return result.trim();
};

/**
 * Format a date to a readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

/**
 * Format a date to a readable string with time
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

/**
 * Get relative time from now
 * @param {string|Date} date - Date to compare
 * @returns {string} - Relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Get time between two dates
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date
 * @returns {string} - Time between dates
 */
export const getTimeBetween = (start, end) => {
  if (!start || !end) return '';
  return formatDistance(new Date(start), new Date(end));
}; 