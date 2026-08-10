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
 * Returns ICC logo placeholder for unmapped countries — never India's flag.
 */
export function getFlagUrl(country) {
  if (!country) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Cricket_Council_logo.svg/200px-International_Cricket_Council_logo.svg.png';
  // Normalize: remove " Men", " Women", "(Men)", "(Women)" suffixes
  const cleanCountry = country
    .replace(/\s*(Men|Women)\s*/gi, '')
    .replace(/\(\s*(Men|Women)\s*\)/gi, '')
    .trim();

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
    'Netherlands': 'nl',
    'Scotland': 'gb-sct',
    'UAE': 'ae',
    'United Arab Emirates': 'ae',
    'Nepal': 'np',
    'Oman': 'om',
    'Namibia': 'na',
    'USA': 'us',
    'United States': 'us',
    'United States of America': 'us',
    'Papua New Guinea': 'pg',
    'Uganda': 'ug',
    'Canada': 'ca',
    'Kenya': 'ke',
    'Nigeria': 'ng',
    'Tanzania': 'tz',
    'Malaysia': 'my',
    'Singapore': 'sg',
    'Bermuda': 'bm',
    'Bahrain': 'bh',
    'Kuwait': 'kw',
    'Qatar': 'qa',
    'Saudi Arabia': 'sa',
    'Hong Kong': 'hk',
    'China': 'cn',
    'Japan': 'jp',
    'South Korea': 'kr',
    'Thailand': 'th',
    'Indonesia': 'id',
    'Philippines': 'ph',
    'Vanuatu': 'vu',
    'Samoa': 'ws',
    'Fiji': 'fj',
    'Argentina': 'ar',
    'Brazil': 'br',
    'Chile': 'cl',
    'Peru': 'pe',
    'Mexico': 'mx',
    'Cayman Islands': 'ky',
    'Belize': 'bz',
    'Bahamas': 'bs',
    'Barbados': 'bb',
    'Germany': 'de',
    'France': 'fr',
    'Spain': 'es',
    'Italy': 'it',
    'Denmark': 'dk',
    'Sweden': 'se',
    'Norway': 'no',
    'Austria': 'at',
    'Belgium': 'be',
    'Portugal': 'pt',
    'Switzerland': 'ch',
    'Romania': 'ro',
    'Bulgaria': 'bg',
    'Czech Republic': 'cz',
    'Greece': 'gr',
    'Botswana': 'bw',
    'Ghana': 'gh',
    'Rwanda': 'rw',
    'Mozambique': 'mz',
    'Cameroon': 'cm',
    'Zambia': 'zm',
    'Malawi': 'mw',
    'Sierra Leone': 'sl',
    'Gambia': 'gm',
    'Seychelles': 'sc',
    'Bhutan': 'bt',
    'Maldives': 'mv',
    'Cambodia': 'kh',
    'Myanmar': 'mm',
  };

  const code = codes[cleanCountry];
  if (!code) {
    // ICC logo placeholder — NOT India's flag
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/International_Cricket_Council_logo.svg/200px-International_Cricket_Council_logo.svg.png';
  }
  return `https://flagcdn.com/w160/${code}.png`;
}
