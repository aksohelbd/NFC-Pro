export interface CountryInfo {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

export const POPULAR_COUNTRIES: CountryInfo[] = [
  { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'QA', dialCode: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'OM', dialCode: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'JP', dialCode: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', dialCode: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', dialCode: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'NP', dialCode: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'TR', dialCode: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: 'EG', dialCode: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: 'RU', dialCode: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'BR', dialCode: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', dialCode: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', dialCode: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: 'PT', dialCode: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PH', dialCode: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'TH', dialCode: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam', flag: '🇻🇳' },
];

/**
 * Detect country flag and country information from a phone number string.
 */
export function getCountryFromPhoneNumber(phoneRaw?: string): CountryInfo {
  if (!phoneRaw || typeof phoneRaw !== 'string') {
    return { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' };
  }

  let clean = phoneRaw.trim().replace(/\s+/g, '');
  if (clean.startsWith('00')) {
    clean = '+' + clean.slice(2);
  }

  const digitsOnly = clean.replace(/[^0-9]/g, '');

  // If starts with 013, 014, 015, 016, 017, 018, 019 -> Bangladesh national format
  if (/^01[3-9]/.test(clean) || (clean.startsWith('880') && digitsOnly.length >= 10)) {
    return { code: 'BD', dialCode: '+880', name: 'Bangladesh', flag: '🇧🇩' };
  }

  // Exact prefix matching sorted by longest dialCode first to avoid +1 vs +123 collisions
  const sorted = [...POPULAR_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const country of sorted) {
    const rawDial = country.dialCode; // e.g. +880
    const plainDial = country.dialCode.replace('+', ''); // e.g. 880

    if (clean.startsWith(rawDial) || clean.startsWith(plainDial)) {
      return country;
    }
  }

  // Fallback defaults: if starts with +1 -> US
  if (clean.startsWith('+1') || clean.startsWith('1')) {
    return { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' };
  }

  // Generic fallback: International
  return { code: 'INTL', dialCode: '', name: 'Global', flag: '🌐' };
}
