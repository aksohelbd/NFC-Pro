import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { UserProfile } from '../types';
import { cleanPhoneNumber, getWhatsAppUrl } from './vcard';
import { getRasterIconDataUrl } from './pdfIconRenderer';

/**
 * Loads an image URL safely into a data URL or HTMLImageElement
 */
async function loadImageDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates high-res QR code with center logo as Data URL
 */
async function generateQrDataUrl(text: string, logoUrl?: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const size = 320;
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  });

  if (logoUrl) {
    const logoDataUrl = await loadImageDataUrl(logoUrl);
    if (logoDataUrl) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const logoImg = new Image();
        logoImg.src = logoDataUrl;
        await new Promise((res) => {
          logoImg.onload = res;
          logoImg.onerror = res;
        });
        const logoSize = size * 0.24;
        const center = size / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, (logoSize / 2) + 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(center, center, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Export Interactive Dynamic Smart PDF
 * Every single element (Phone, WhatsApp, Email, Website, Social media icons, QR code)
 * has REAL CLICKABLE HYPERLINKS embedded in the PDF document!
 */
export async function exportInteractiveSmartPdf(
  profile: UserProfile,
  cardUrl: string
): Promise<void> {
  // ISO/IEC 7810 ID-1 Standard smart business card dimensions: 85.60 mm × 53.98 mm
  // Using high-fidelity landscape canvas 105 mm x 65 mm for crystal clarity
  const cardW = 105;
  const cardH = 65;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [cardW, cardH],
  });

  // --- 1. LUXURY CARD BACKGROUND ---
  // Dark Onyx gradient simulation
  doc.setFillColor(15, 15, 18);
  doc.rect(0, 0, cardW, cardH, 'F');

  // Top banner accent
  doc.setFillColor(24, 24, 29);
  doc.rect(0, 0, cardW, 20, 'F');

  // Golden border framing
  doc.setDrawColor(245, 158, 11); // Amber-500
  doc.setLineWidth(0.7);
  doc.roundedRect(1.5, 1.5, cardW - 3, cardH - 3, 3, 3, 'S');

  // Inner subtle border
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.2);
  doc.roundedRect(2.5, 2.5, cardW - 5, cardH - 5, 2, 2, 'S');

  // --- 2. HEADER ACCENTS & NFC CHIP VISUAL ---
  const chipIconUrl = await getRasterIconDataUrl('nfc_chip', 96);
  if (chipIconUrl) {
    doc.addImage(chipIconUrl, 'PNG', 4.5, 4.2, 8, 6);
  } else {
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(4.5, 4.5, 8, 6, 1, 1, 'F');
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.2);
    doc.rect(6.5, 5.5, 4, 4, 'S');
  }

  // "SMART NFC CONTACT CARD" label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(245, 158, 11);
  doc.text('SMART NFC BUSINESS CARD', 14, 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.2);
  doc.setTextColor(160, 160, 170);
  doc.text(`TAG ID: ${profile.token}`, 14, 9.5);

  // Expiry / Status badge
  const expiryText = profile.expiryDate
    ? `VALID TILL: ${new Date(profile.expiryDate).toLocaleDateString()}`
    : 'LIFETIME ACCESS';
  doc.setFontSize(4);
  doc.setTextColor(217, 119, 6);
  doc.text(expiryText, cardW - 30, 7);

  // --- 3. AVATAR / PROFILE PHOTO ---
  const avatarDataUrl = await loadImageDataUrl(profile.avatarUrl);
  const avatarX = 5;
  const avatarY = 13;
  const avatarSize = 14;

  if (avatarDataUrl) {
    try {
      doc.addImage(avatarDataUrl, 'JPEG', avatarX, avatarY, avatarSize, avatarSize);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.4);
      doc.rect(avatarX, avatarY, avatarSize, avatarSize, 'S');
    } catch {
      // fallback if image fail
    }
  }

  // --- 4. NAME & DESIGNATION ---
  const infoX = avatarX + avatarSize + 3;
  let infoY = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(profile.fullName, infoX, infoY);

  infoY += 3.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.text(profile.designation.toUpperCase(), infoX, infoY);

  if (profile.company) {
    infoY += 2.6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.8);
    doc.setTextColor(180, 180, 195);
    doc.text(profile.company, infoX, infoY);
  }

  // Divider line
  doc.setDrawColor(50, 50, 60);
  doc.setLineWidth(0.2);
  doc.line(4, 29, cardW - 4, 29);

  // --- 5. INTERACTIVE DIRECT CONTACT LINES (CLICKABLE IN PDF!) ---
  let contactY = 32.5;

  // Phone Contact Line
  const phoneVal = profile.phone;
  if (phoneVal) {
    doc.setFillColor(30, 30, 38);
    doc.roundedRect(4.5, contactY - 2.5, 48, 4.8, 1, 1, 'F');
    doc.setDrawColor(70, 70, 85);
    doc.setLineWidth(0.15);
    doc.roundedRect(4.5, contactY - 2.5, 48, 4.8, 1, 1, 'S');

    const phoneIconUrl = await getRasterIconDataUrl('phone', 72);
    if (phoneIconUrl) {
      doc.addImage(phoneIconUrl, 'PNG', 5.5, contactY - 2.0, 3.8, 3.8);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(245, 158, 11);
    doc.text('CALL:', 10.2, contactY + 0.6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(255, 255, 255);
    doc.text(phoneVal, 16.8, contactY + 0.6);

    // Clickable tel link in PDF!
    doc.link(4.5, contactY - 2.5, 48, 4.8, {
      url: `tel:${cleanPhoneNumber(phoneVal)}`,
    });

    contactY += 5.8;
  }

  // WhatsApp Contact Line
  const waVal = profile.whatsapp || profile.phone;
  if (waVal) {
    doc.setFillColor(16, 42, 28);
    doc.roundedRect(4.5, contactY - 2.5, 48, 4.8, 1, 1, 'F');
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.15);
    doc.roundedRect(4.5, contactY - 2.5, 48, 4.8, 1, 1, 'S');

    const waIconUrl = await getRasterIconDataUrl('whatsapp', 96);
    if (waIconUrl) {
      doc.addImage(waIconUrl, 'PNG', 5.5, contactY - 2.0, 3.8, 3.8);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(34, 197, 94);
    doc.text('WHATSAPP:', 10.2, contactY + 0.6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(255, 255, 255);
    doc.text(waVal, 23.5, contactY + 0.6);

    // Clickable WhatsApp link
    doc.link(4.5, contactY - 2.5, 48, 4.8, {
      url: getWhatsAppUrl(waVal),
    });

    contactY += 5.8;
  }

  // Email Contact Line
  if (profile.email) {
    doc.setFillColor(30, 30, 38);
    doc.roundedRect(4.5, contactY - 2.5, 48, 4.8, 1, 1, 'F');
    doc.setDrawColor(70, 70, 85);
    doc.setLineWidth(0.15);
    doc.roundedRect(4.5, contactY - 2.5, 48, 4.8, 1, 1, 'S');

    const emailIconUrl = await getRasterIconDataUrl('email', 72);
    if (emailIconUrl) {
      doc.addImage(emailIconUrl, 'PNG', 5.5, contactY - 2.0, 3.8, 3.8);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.6);
    doc.setTextColor(56, 189, 248); // Sky
    doc.text('EMAIL:', 10.2, contactY + 0.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.4);
    doc.setTextColor(240, 240, 240);
    const shortEmail = profile.email.length > 25 ? profile.email.slice(0, 24) + '...' : profile.email;
    doc.text(shortEmail, 17.5, contactY + 0.6);

    // Clickable Email link
    doc.link(4.5, contactY - 2.5, 48, 4.8, {
      url: `mailto:${profile.email}`,
    });

    contactY += 5.8;
  }

  // --- 6. DYNAMIC CLICKABLE SOCIAL MEDIA BADGES (OFFICIAL CRISP ICONS!) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.2);
  doc.setTextColor(200, 200, 210);
  doc.text('TAP ANY SOCIAL LINK BELOW TO OPEN:', 4.5, contactY - 1);

  const socialLinksToRender = profile.socialLinks.slice(0, 6);
  const badgeW = 7.6;
  const badgeH = 7.6;
  const badgeGap = 2.0;

  for (let i = 0; i < socialLinksToRender.length; i++) {
    const link = socialLinksToRender[i];
    const socialX = 4.5 + i * (badgeW + badgeGap);
    const socialY = contactY + 0.5;

    // Background tile with gold border
    doc.setFillColor(28, 28, 36);
    doc.roundedRect(socialX, socialY, badgeW, badgeH, 1.8, 1.8, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.25);
    doc.roundedRect(socialX, socialY, badgeW, badgeH, 1.8, 1.8, 'S');

    // Official Colored Brand Icon
    const iconDataUrl = await getRasterIconDataUrl(link.platform, 96);
    if (iconDataUrl) {
      doc.addImage(iconDataUrl, 'PNG', socialX + 1.3, socialY + 1.3, 5.0, 5.0);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.2);
      doc.setTextColor(255, 255, 255);
      doc.text(link.platform.slice(0, 4).toUpperCase(), socialX + 1.2, socialY + 4.8);
    }

    // PDF Hyperlink over the icon tile
    doc.link(socialX, socialY, badgeW, badgeH, {
      url: link.url,
    });
  }

  // --- 7. RIGHT QR CODE (CLICKABLE IN PDF TO OPEN LIVE CARD!) ---
  const qrDataUrl = await generateQrDataUrl(cardUrl, profile.websiteLogoUrl || profile.avatarUrl);
  const qrSize = 25;
  const qrX = cardW - qrSize - 5;
  const qrY = 18;

  // QR Frame box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 2, 2, 'S');

  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Link over QR code to open online digital card!
  doc.link(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, {
    url: cardUrl,
  });

  // Instruction below QR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.2);
  doc.setTextColor(251, 191, 36);
  doc.text('TAP OR SCAN QR CODE', qrX + 0.5, qrY + qrSize + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(3.8);
  doc.setTextColor(160, 160, 175);
  doc.text('TO SAVE INSTANT CONTACT', qrX, qrY + qrSize + 5.5);

  // Footer URL note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(3.6);
  doc.setTextColor(245, 158, 11);
  doc.text(`NFC SMART CARD • ALL ICONS & LINKS ARE CLICKABLE`, 4.5, cardH - 3);

  // Save the PDF file
  const filename = `${profile.slug || profile.token}-smart-nfc-card.pdf`;
  doc.save(filename);
}

/**
 * Export high-resolution JPG image of the smart card
 */
export async function exportCardAsJpg(
  containerElementId: string,
  fileName: string
): Promise<void> {
  const element = document.getElementById(containerElementId);
  if (!element) {
    throw new Error('Card element not found for export');
  }

  const canvas = await html2canvas(element, {
    scale: 3, // 300% high resolution
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
  });

  const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
  const link = document.createElement('a');
  link.href = jpgUrl;
  link.download = `${fileName}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
