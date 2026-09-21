/**
 * Utility to generate high-resolution raster icon DataURLs for jsPDF.
 * Uses client-side HTML5 Canvas with embedded SVG vectors.
 */

// Official SVG vector definitions for each platform
const SVG_ICONS: Record<string, string> = {
  nfc_chip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" width="96" height="72">
    <defs>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="34" rx="6" fill="url(#gold)" stroke="#B45309" stroke-width="1.5"/>
    <rect x="12" y="6" width="22" height="24" rx="3" fill="#78350F" opacity="0.2"/>
    <line x1="12" y1="12" x2="34" y2="12" stroke="#78350F" stroke-width="1.2" opacity="0.6"/>
    <line x1="12" y1="18" x2="34" y2="18" stroke="#78350F" stroke-width="1.2" opacity="0.6"/>
    <line x1="12" y1="24" x2="34" y2="24" stroke="#78350F" stroke-width="1.2" opacity="0.6"/>
    <line x1="23" y1="6" x2="23" y2="30" stroke="#78350F" stroke-width="1.2" opacity="0.6"/>
    <!-- Contactless wave arcs -->
    <path d="M37 12a7 7 0 0 1 0 12" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M41 9a11 11 0 0 1 0 18" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`,

  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="72" height="72">
    <circle cx="18" cy="18" r="17" fill="#F59E0B"/>
    <path fill="#111827" d="M24 21.2c-.6-.6-1.4-.6-2 0l-1.3 1.3c-.3.3-.7.4-1 .2-2-.9-3.7-2.6-4.6-4.6-.2-.3-.1-.7.2-1l1.3-1.3c.6-.6.6-1.4 0-2l-2.8-2.8c-.6-.6-1.4-.6-2 0l-1.5 1.5c-.7.7-1.1 1.7-.8 2.8 1.2 4.2 4.6 7.6 8.8 8.8 1.1.3 2.1-.1 2.8-.8l1.5-1.5c.6-.6.6-1.4 0-2l-2.6-2.6z"/>
  </svg>`,

  whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <circle cx="24" cy="24" r="23" fill="#25D366"/>
    <path fill="#ffffff" d="M34.5 13.5A14.8 14.8 0 0 0 24 9.17c-8.16 0-14.8 6.63-14.8 14.8 0 2.6.68 5.15 1.98 7.4L9 39l7.85-2.06a14.7 14.7 0 0 0 7.15 1.84h.01c8.16 0 14.8-6.63 14.8-14.8 0-3.95-1.54-7.66-4.31-10.48zm-10.5 23a12.3 12.3 0 0 1-6.27-1.71l-.45-.27-4.66 1.22 1.24-4.54-.3-.47a12.3 12.3 0 0 1-1.88-6.56c0-6.78 5.52-12.3 12.32-12.3 3.29 0 6.38 1.28 8.7 3.6 2.33 2.32 3.61 5.41 3.61 8.7 0 6.78-5.52 12.33-12.31 12.33zm6.75-9.21c-.37-.19-2.19-1.08-2.53-1.2-.34-.13-.59-.19-.84.19-.25.37-.97 1.2-.19 1.46-.22.25-.44.28-.81.1-.37-.19-1.56-.57-2.97-1.83-1.1-.98-1.84-2.2-2.06-2.57-.22-.37-.02-.57.16-.75.16-.16.37-.42.56-.64.19-.22.25-.37.37-.62.13-.25.06-.47-.03-.66-.09-.19-.84-2.02-1.15-2.76-.3-.72-.6-.62-.84-.63h-.71c-.25 0-.66.09-.99.46-.34.37-1.3 1.27-1.3 3.1 0 1.83 1.33 3.6 1.52 3.85.19.25 2.62 4 6.37 5.62.89.38 1.58.61 2.12.78.89.28 1.71.24 2.36.14.72-.11 2.19-.9 2.5-1.77.31-.87.31-1.62.22-1.77-.1-.16-.34-.25-.72-.43z"/>
  </svg>`,

  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="72" height="72">
    <circle cx="18" cy="18" r="17" fill="#38BDF8"/>
    <path fill="#0F172A" d="M9 11h18c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2V13c0-1.1.9-2 2-2zm0 2.5l9 5.8 9-5.8V13H9v.5zm18 10.5V16l-8.4 5.3c-.4.2-.8.2-1.2 0L9 16v8h18z"/>
  </svg>`,

  facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <circle cx="24" cy="24" r="23" fill="#1877F2"/>
    <path fill="#ffffff" d="M26.5 24h4.8l.7-5.5h-5.5v-3.5c0-1.5.4-2.5 2.6-2.5H32V7.6c-.6-.1-2.2-.2-4.1-.2-4 0-6.7 2.4-6.7 6.9v4.2h-4.8v5.5h4.8V39h5.3V24z"/>
  </svg>`,

  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <rect x="2" y="2" width="44" height="44" rx="10" fill="#0A66C2"/>
    <path fill="#ffffff" d="M14.5 18.5h5v16h-5v-16zm2.5-8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8zm8.5 8h4.8v2.2h.1c.7-1.3 2.4-2.6 4.9-2.6 5.2 0 6.2 3.4 6.2 7.9v8.5h-5v-7.5c0-1.8 0-4.1-2.5-4.1s-2.9 2-2.9 4v7.6h-5.6v-16z"/>
  </svg>`,

  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <circle cx="24" cy="24" r="23" fill="#24292E"/>
    <path fill="#ffffff" d="M24 10a14 14 0 0 0-4.43 27.28c.7.13.96-.3.96-.68v-2.38c-3.9.85-4.72-1.88-4.72-1.88-.64-1.62-1.56-2.05-1.56-2.05-1.27-.87.1-.85.1-.85 1.4.1 2.14 1.44 2.14 1.44 1.25 2.14 3.28 1.52 4.08 1.16.13-.9.49-1.52.89-1.87-3.11-.35-6.38-1.56-6.38-6.93 0-1.53.55-2.78 1.44-3.76-.14-.35-.63-1.78.14-3.71 0 0 1.18-.38 3.85 1.44a13.4 13.4 0 0 1 7.02 0c2.67-1.82 3.85-1.44 3.85-1.44.77 1.93.28 3.36.14 3.71.9.98 1.44 2.23 1.44 3.76 0 5.38-3.28 6.57-6.4 6.92.5.43.95 1.28.95 2.58v3.83c0 .38.25.82.97.68A14 14 0 0 0 24 10z"/>
  </svg>`,

  instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <defs>
      <radialGradient id="igG" cx="25%" cy="110%" r="130%">
        <stop offset="0%" stop-color="#ffd521"/>
        <stop offset="10%" stop-color="#ff6b00"/>
        <stop offset="50%" stop-color="#ff0077"/>
        <stop offset="85%" stop-color="#8c00ff"/>
        <stop offset="100%" stop-color="#0037ff"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#igG)"/>
    <rect x="11" y="11" width="26" height="26" rx="7" stroke="#ffffff" stroke-width="2.8" fill="none"/>
    <circle cx="24" cy="24" r="6.5" stroke="#ffffff" stroke-width="2.8" fill="none"/>
    <circle cx="31.5" cy="16.5" r="1.6" fill="#ffffff"/>
  </svg>`,

  twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <rect x="2" y="2" width="44" height="44" rx="10" fill="#000000"/>
    <path fill="#ffffff" d="M28.5 13h3.8l-8.3 9.5 9.8 12.5h-7.7l-6-7.8-6.9 7.8H9.4l8.9-10.2L8.8 13h7.9l5.4 7.2L28.5 13zm-1.3 19.8h2.1L15.9 15.1h-2.3l13.6 17.7z"/>
  </svg>`,

  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <rect x="2" y="2" width="44" height="44" rx="10" fill="#000000"/>
    <path fill="#ffffff" d="M28.5 13h3.8l-8.3 9.5 9.8 12.5h-7.7l-6-7.8-6.9 7.8H9.4l8.9-10.2L8.8 13h7.9l5.4 7.2L28.5 13zm-1.3 19.8h2.1L15.9 15.1h-2.3l13.6 17.7z"/>
  </svg>`,

  youtube: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <rect x="2" y="6" width="44" height="36" rx="10" fill="#FF0000"/>
    <polygon points="20,16 32,24 20,32" fill="#ffffff"/>
  </svg>`,

  telegram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <circle cx="24" cy="24" r="23" fill="#229ED9"/>
    <path fill="#ffffff" d="M33.8 14.2L12.5 22.4c-1.45.58-1.44 1.4-.26 1.76l5.45 1.7 12.63-7.97c.6-.36 1.14-.17.69.23L20.8 27.5l-.4 5.9c.58 0 .83-.26 1.15-.58l2.76-2.68 5.73 4.23c1.06.58 1.81.28 2.08-.98l3.76-17.7c.39-1.54-.58-2.24-1.58-1.8z"/>
  </svg>`,

  tiktok: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <rect x="2" y="2" width="44" height="44" rx="10" fill="#000000"/>
    <path fill="#25F4EE" d="M29 12a7 7 0 0 0 4 4v4a11 11 0 0 1-4-1.2V27a8 8 0 1 1-8-8 8.2 8.2 0 0 1 2 .25v4.2a4 4 0 1 0 2 3.55V9h4a7 7 0 0 0 0 3z"/>
    <path fill="#FE2C55" d="M28.5 13a7 7 0 0 0 4 4v3.5a11 11 0 0 1-4-1.2V27.5a8 8 0 1 1-8-8 8.2 8.2 0 0 1 2 .25v4.2a4 4 0 1 0 2 3.55V9.5h4a7 7 0 0 0 0 3.5z"/>
  </svg>`,

  website: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <circle cx="24" cy="24" r="23" fill="#D97706"/>
    <circle cx="24" cy="24" r="14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <ellipse cx="24" cy="24" rx="7" ry="14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
    <line x1="10" y1="24" x2="38" y2="24" stroke="#ffffff" stroke-width="2.5"/>
  </svg>`,

  discord: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96" height="96">
    <circle cx="24" cy="24" r="23" fill="#5865F2"/>
    <path fill="#ffffff" d="M32.5 16.5s-2.1-1.6-4.5-1.9l-.2.4c2.5.7 3.6 1.8 3.6 1.8-1.5-.8-3.1-1.3-4.6-1.5-1.3-.2-2.5-.2-3.8 0-1.5.2-3.1.7-4.6 1.5 0 0 1.1-1.1 3.6-1.8l-.2-.4c-2.4.3-4.5 1.9-4.5 1.9-4.1 6.1-5.2 12-5.2 12 2.7 2 5.3 2 5.3 2l.7-.9c-1-.3-2.1-.8-3.1-1.6.3.2.5.3.8.5 2.2 1.2 4.9 1.9 7.7 1.9s5.5-.7 7.7-1.9c.3-.2.5-.3.8-.5-1 .8-2.1 1.3-3.1 1.6l.7.9s2.6 0 5.3-2c0 0-1.1-5.9-5.2-12zm-12.8 9.5c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5zm8.6 0c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5 2.2 1.1 2.2 2.5-1 2.5-2.2 2.5z"/>
  </svg>`,
};

/**
 * Cache for rendered Data URLs so we only rasterize once
 */
const iconCache = new Map<string, string>();

/**
 * Converts an SVG string into a crystal-clear PNG Data URL using HTML5 Canvas
 */
export async function getRasterIconDataUrl(key: string, size = 96): Promise<string> {
  const normKey = key.toLowerCase().trim();
  const cacheKey = `${normKey}_${size}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey)!;
  }

  const svg = SVG_ICONS[normKey] || SVG_ICONS['website'];

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      img.onload = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        iconCache.set(cacheKey, dataUrl);
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Draw elegant fallback on canvas
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
    } catch {
      resolve('');
    }
  });
}
