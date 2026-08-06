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
  if (!country) return 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Missing_flag.png';
  // Normalize country name (remove " Men", " Women", "(Men)", "(Women)", etc.)
  const cleanCountry = country.replace(/\s*(Men|Women)\s*/i, '').replace(/\(\s*(Men|Women)\s*\)/i, '').trim();

  const codes = {
    'India': 'in',
    'Australia': 'au',
    'England': 'gb-eng',
    'New Zealand': 'nz',
    'South Africa': 'za',
    'Pakistan': 'pk',
    'Sri Lanka': 'lk',
    'West Indies': 'jm', // Jamaica as a proxy, or an ICC flag, but jm is commonly used here as placeholder
    'Bangladesh': 'bd',
    'Afghanistan': 'af',
    'Ireland': 'ie',
    'Zimbabwe': 'zw',
    'Netherlands': 'nl',
    'Scotland': 'gb-sct',
    'UAE': 'ae',
    'United Arab Emirates': 'ae',
    'Nepal': 'np',
    'Oman': 'om',
    'Namibia': 'na',
    'USA': 'us',
    'United States': 'us',
    'Papua New Guinea': 'pg',
    'Uganda': 'ug',
  };
  const code = codes[cleanCountry];
  if (!code) {
    // Neutral placeholder
    return 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Missing_flag.png';
  }
  return `https://flagcdn.com/w160/${code}.png`;
}
