export const MATCH_FORMATS = [
  { value: 'TEST', label: 'Test' },
  { value: 'ODI', label: 'ODI' },
  { value: 'T20I', label: 'T20 International' },
];

export const OPPONENTS = [
  'Australia', 'England', 'South Africa', 'New Zealand',
  'Pakistan', 'Sri Lanka', 'Bangladesh', 'West Indies',
  'Afghanistan', 'Ireland', 'Zimbabwe',
];

/**
 * Format a date string for display.
 * TODO: Add timezone support for match dates.
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format decimal to percentage string.
 */
export function formatPercentage(value) {
  if (value == null) return '—';
  return `${(value * 100).toFixed(1)}%`;
}
