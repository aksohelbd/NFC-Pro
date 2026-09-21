import { UserProfile } from '../types';

/**
 * Generate standard vCard 3.0 format text
 */
export function generateVCardString(profile: UserProfile): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.fullName}`,
    `N:;${profile.fullName};;;`,
  ];

  if (profile.designation) {
    lines.push(`TITLE:${profile.designation}`);
  }

  if (profile.company) {
    lines.push(`ORG:${profile.company}`);
  }

  if (profile.phone) {
    const cleanPhone = profile.phone.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
  }

  if (profile.phoneSecondary) {
    const cleanSecPhone = profile.phoneSecondary.replace(/[^\d+]/g, '');
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanSecPhone}`);
  }

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${profile.email}`);
  }

  if (profile.websiteUrl) {
    lines.push(`URL:${profile.websiteUrl}`);
  }

  if (profile.address) {
    lines.push(`ADR;TYPE=WORK:;;${profile.address};;;;`);
  }

  if (profile.bio) {
    // Sanitize newlines for vCard
    const sanitizedBio = profile.bio.replace(/\r?\n/g, '\\n');
    lines.push(`NOTE:${sanitizedBio} | NFC Token: ${profile.token}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Trigger immediate download of vCard (.vcf) file on mobile or desktop
 */
export function downloadVCard(profile: UserProfile): void {
  try {
    const vCardData = generateVCardString(profile);
    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${profile.fullName.replace(/\s+/g, '_')}_contact.vcf`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download vCard:', err);
  }
}

/**
 * Clean phone string for tel: and wa.me protocols
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Get WhatsApp direct chat URL
 */
export function getWhatsAppUrl(phoneOrWa: string, customMessage?: string): string {
  const clean = cleanPhoneNumber(phoneOrWa).replace(/^\+/, '');
  const text = encodeURIComponent(customMessage || 'Hello! I got your contact through your NFC card.');
  return `https://wa.me/${clean}?text=${text}`;
}
