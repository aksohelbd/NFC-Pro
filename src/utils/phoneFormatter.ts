/**
 * Smart Phone Number Formatter
 * - Auto-detects country codes or adds formatting with spaces
 * - Bangladesh (+880): +880 1XXX XXXXXX
 * - USA/Canada (+1): +1 XXX XXX XXXX
 * - Saudi Arabia (+966): +966 5X XXX XXXX
 * - UAE (+971): +971 5X XXX XXXX
 * - UK (+44): +44 7XXX XXXXXX
 * - India (+91): +91 XXXXX XXXXX
 * - Generic: +XXX XXXX XXXXXX
 */

export interface CountryPreset {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
}

export const POPULAR_COUNTRIES: CountryPreset[] = [
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', placeholder: '+880 1700 000000' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', placeholder: '+966 50 123 4567' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', placeholder: '+971 50 123 4567' },
  { code: '+1', name: 'USA / Canada', flag: '🇺🇸', placeholder: '+1 234 567 8901' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', placeholder: '+44 7123 456789' },
  { code: '+91', name: 'India', flag: '🇮🇳', placeholder: '+91 98765 43210' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', placeholder: '+60 12 345 6789' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', placeholder: '+974 3312 3456' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', placeholder: '+968 9123 4567' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', placeholder: '+965 9123 4567' },
];

/**
 * Strips all non-digit and non-plus characters to ensure calling / messaging works.
 */
export function cleanPhoneNumber(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Automatically formats phone number as the user types with clean spacing.
 */
export function formatPhoneNumber(input: string): string {
  if (!input) return '';

  const trimmed = input.trim();
  const startsWithPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/[^\d]/g, '');

  if (!digits) return startsWithPlus ? '+' : '';

  // If starts with 01 (standard Bangladesh national format)
  if (!startsWithPlus && (digits.startsWith('01') || (digits.startsWith('1') && digits.length >= 10))) {
    let bdDigits = digits;
    if (bdDigits.startsWith('01')) {
      bdDigits = bdDigits.slice(1);
    }
    // BD format: +880 1XXX XXXXXX
    const prefix = '+880 1';
    const rest = bdDigits.startsWith('1') ? bdDigits.slice(1) : bdDigits;
    if (rest.length <= 3) {
      return `${prefix}${rest}`;
    } else if (rest.length <= 6) {
      return `${prefix}${rest.slice(0, 3)} ${rest.slice(3)}`;
    } else {
      return `${prefix}${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`;
    }
  }

  // If starts with +880 or digits start with 880
  if (digits.startsWith('880')) {
    const rest = digits.slice(3);
    if (!rest) return '+880';
    if (rest.length <= 4) {
      return `+880 ${rest}`;
    } else if (rest.length <= 7) {
      return `+880 ${rest.slice(0, 4)} ${rest.slice(4)}`;
    } else {
      return `+880 ${rest.slice(0, 4)} ${rest.slice(4, 7)} ${rest.slice(7, 10)}`;
    }
  }

  // USA / Canada (+1)
  if (digits.startsWith('1') && startsWithPlus) {
    const rest = digits.slice(1);
    if (!rest) return '+1';
    if (rest.length <= 3) return `+1 ${rest}`;
    if (rest.length <= 6) return `+1 ${rest.slice(0, 3)} ${rest.slice(3)}`;
    return `+1 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`;
  }

  // Saudi Arabia (+966)
  if (digits.startsWith('966')) {
    const rest = digits.slice(3);
    if (!rest) return '+966';
    if (rest.length <= 2) return `+966 ${rest}`;
    if (rest.length <= 5) return `+966 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+966 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  }

  // UAE (+971)
  if (digits.startsWith('971')) {
    const rest = digits.slice(3);
    if (!rest) return '+971';
    if (rest.length <= 2) return `+971 ${rest}`;
    if (rest.length <= 5) return `+971 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+971 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  }

  // United Kingdom (+44)
  if (digits.startsWith('44')) {
    const rest = digits.slice(2);
    if (!rest) return '+44';
    if (rest.length <= 4) return `+44 ${rest}`;
    return `+44 ${rest.slice(0, 4)} ${rest.slice(4, 10)}`;
  }

  // India (+91)
  if (digits.startsWith('91')) {
    const rest = digits.slice(2);
    if (!rest) return '+91';
    if (rest.length <= 5) return `+91 ${rest}`;
    return `+91 ${rest.slice(0, 5)} ${rest.slice(5, 10)}`;
  }

  // General international formatting with spaces every 3-4 digits
  if (startsWithPlus) {
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11, 15)}`.trim();
  }

  // No plus, regular digits: space every 4 digits
  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : digits;
}
