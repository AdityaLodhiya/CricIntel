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

/**
 * Get country flag URL from flagcdn.
 */
export function getFlagUrl(country) {
 const codes = {
  'India': 'in',
  'Australia': 'au',
  'England': 'gb-eng',
  'New Zealand': 'nz',
  'South Africa': 'za',
  'Pakistan': 'pk',
  'Sri Lanka': 'lk',
  'West Indies': 'jm',
  'Bangladesh': 'bd',
  'Afghanistan': 'af',
  'Ireland': 'ie',
  'Zimbabwe': 'zw',
 };
 const code = codes[country] || 'in'; // default to india if not found
 return `https://flagcdn.com/w160/${code}.png`;
}
