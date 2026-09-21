import React from 'react';
import { SocialPlatform } from '../types';

export interface PlatformMeta {
  name: string;
  brandColor: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  textColor: string;
  gradientBadge: string;
  icon: (className?: string) => React.ReactNode;
}

export function getPlatformMeta(platform: string): PlatformMeta {
  const p = (platform || '').toLowerCase().trim() as SocialPlatform;

  switch (p) {
    case 'whatsapp':
      return {
        name: 'WhatsApp',
        brandColor: '#25D366',
        textColor: 'text-[#25D366]',
        gradientBadge: 'bg-[#25D366] text-white shadow-[#25D366]/30',
        bgLight: 'bg-emerald-50/90 hover:bg-emerald-100/90',
        bgDark: 'dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50',
        borderColor: 'border-emerald-200 dark:border-emerald-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#25D366" />
            <path
              d="M23.1 8.87A9.85 9.85 0 0 0 16.14 6C10.7 6 6.27 10.42 6.27 15.86c0 1.74.45 3.44 1.32 4.94L6 26l5.35-1.4a9.8 9.8 0 0 0 4.79 1.24h.01c5.44 0 9.87-4.42 9.87-9.86 0-2.63-1.03-5.11-2.92-6.98zM16.15 24.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.17.83.85-3.09-.2-.31a8.2 8.2 0 0 1-1.25-4.45c0-4.52 3.68-8.2 8.21-8.2a8.15 8.15 0 0 1 5.8 2.41 8.16 8.16 0 0 1 2.4 5.8c0 4.53-3.68 8.21-8.21 8.21zm4.5-6.14c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.12-.17.25-.65.8-.79.97-.15.17-.3.19-.54.07-.25-.13-1.04-.38-1.98-1.22-.73-.66-1.23-1.47-1.37-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.28.37-.43.12-.14.16-.24.25-.4.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.68 4.25 3.75.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.16-.48-.28z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'facebook':
      return {
        name: 'Facebook',
        brandColor: '#1877F2',
        textColor: 'text-[#1877F2]',
        gradientBadge: 'bg-[#1877F2] text-white shadow-[#1877F2]/30',
        bgLight: 'bg-blue-50/90 hover:bg-blue-100/90',
        bgDark: 'dark:bg-blue-950/40 dark:hover:bg-blue-900/50',
        borderColor: 'border-blue-200 dark:border-blue-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#1877F2" />
            <path
              d="M21.2 16.5h-3.4v9.5h-4v-9.5H11v-3.7h2.8v-2.4c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .1 2.3.1v2.7h-1.6c-1.1 0-1.4.5-1.4 1.4v1.8h3.9l-.5 3.7z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'instagram':
      return {
        name: 'Instagram',
        brandColor: '#E1306C',
        textColor: 'text-[#E1306C]',
        gradientBadge: 'bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-[#d62976]/30',
        bgLight: 'bg-pink-50/90 hover:bg-pink-100/90',
        bgDark: 'dark:bg-pink-950/40 dark:hover:bg-pink-900/50',
        borderColor: 'border-pink-200 dark:border-pink-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <defs>
              <radialGradient id="igGrad" cx="30%" cy="107%" r="130%">
                <stop offset="0%" stopColor="#fdf497" />
                <stop offset="5%" stopColor="#fdf497" />
                <stop offset="45%" stopColor="#fd5949" />
                <stop offset="60%" stopColor="#d6249f" />
                <stop offset="90%" stopColor="#285AEB" />
              </radialGradient>
            </defs>
            <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#igGrad)" />
            <rect
              x="7.5"
              y="7.5"
              width="17"
              height="17"
              rx="4.5"
              stroke="white"
              strokeWidth="2.2"
              fill="none"
            />
            <circle cx="16" cy="16" r="4.2" stroke="white" strokeWidth="2.2" fill="none" />
            <circle cx="21" cy="11" r="1.2" fill="white" />
          </svg>
        ),
      };

    case 'linkedin':
      return {
        name: 'LinkedIn',
        brandColor: '#0A66C2',
        textColor: 'text-[#0A66C2]',
        gradientBadge: 'bg-[#0A66C2] text-white shadow-[#0A66C2]/30',
        bgLight: 'bg-sky-50/90 hover:bg-sky-100/90',
        bgDark: 'dark:bg-sky-950/40 dark:hover:bg-sky-900/50',
        borderColor: 'border-sky-200 dark:border-sky-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="6" fill="#0A66C2" />
            <path
              d="M9.5 12.5h3.4v10.8H9.5V12.5zm1.7-5.4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm5.7 5.4h3.3v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v5.7h-3.4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.1h-3.4V12.5z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'youtube':
      return {
        name: 'YouTube',
        brandColor: '#FF0000',
        textColor: 'text-[#FF0000]',
        gradientBadge: 'bg-[#FF0000] text-white shadow-[#FF0000]/30',
        bgLight: 'bg-red-50/90 hover:bg-red-100/90',
        bgDark: 'dark:bg-red-950/40 dark:hover:bg-red-900/50',
        borderColor: 'border-red-200 dark:border-red-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <rect x="2" y="5" width="28" height="22" rx="7" fill="#FF0000" />
            <polygon points="13,10 22,16 13,22" fill="white" />
          </svg>
        ),
      };

    case 'twitter':
    case 'x':
      return {
        name: 'X (Twitter)',
        brandColor: '#000000',
        textColor: 'text-neutral-900 dark:text-neutral-100',
        gradientBadge: 'bg-black text-white shadow-black/30',
        bgLight: 'bg-neutral-100 hover:bg-neutral-200',
        bgDark: 'dark:bg-neutral-800 dark:hover:bg-neutral-700',
        borderColor: 'border-neutral-300 dark:border-neutral-700',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="7" fill="#0f1419" />
            <path
              d="M18.8 14.7 25 7h-1.5l-5.3 6.6L13.8 7H8.5l6.5 9.8L8.5 25h1.5l5.7-7 4.7 7h5.3l-6.9-10.3zm-2 2.5-.7-1-5.3-7.7h2.2l4.4 6.4.7 1 5.6 8.2h-2.2l-4.7-6.9z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'telegram':
      return {
        name: 'Telegram',
        brandColor: '#24A1DE',
        textColor: 'text-[#24A1DE]',
        gradientBadge: 'bg-[#24A1DE] text-white shadow-[#24A1DE]/30',
        bgLight: 'bg-sky-50/90 hover:bg-sky-100/90',
        bgDark: 'dark:bg-sky-950/40 dark:hover:bg-sky-900/50',
        borderColor: 'border-sky-200 dark:border-sky-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#24A1DE" />
            <path
              d="M7.5 15.6l15.2-6.2c.7-.3 1.3.2 1.1 1.1l-2.6 12.3c-.2.9-.7 1.1-1.4.7l-4-3-1.9 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.4-6.7c.3-.3-.1-.5-.5-.2l-9.1 5.8-4-1.2c-.9-.3-.9-.9.2-1.3z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'github':
      return {
        name: 'GitHub',
        brandColor: '#24292F',
        textColor: 'text-neutral-900 dark:text-neutral-100',
        gradientBadge: 'bg-[#24292F] text-white shadow-neutral-900/30',
        bgLight: 'bg-neutral-100 hover:bg-neutral-200',
        bgDark: 'dark:bg-neutral-800 dark:hover:bg-neutral-700',
        borderColor: 'border-neutral-300 dark:border-neutral-700',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#24292F" />
            <path
              d="M16 7C11 7 7 11 7 16c0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.6c-2.5.5-3-1.2-3-1.2-.4-1-1-1.3-1-1.3-.8-.5.1-.5.1-.5.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8 1-2.4-.1-.2-.4-1.1.1-2.4 0 0 .8-.3 2.5.9.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.7-1.2 2.5-.9 2.5-.9.5 1.3.2 2.2.1 2.4.6.6 1 1.4 1 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.8.6 1.7v2.5c0 .3.2.5.7.4C22.4 23.4 25 20 25 16c0-5-4-9-9-9z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'fiverr':
      return {
        name: 'Fiverr',
        brandColor: '#1dbf73',
        textColor: 'text-[#1dbf73]',
        gradientBadge: 'bg-[#1dbf73] text-white shadow-[#1dbf73]/30',
        bgLight: 'bg-emerald-50 hover:bg-emerald-100',
        bgDark: 'dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#1dbf73" />
            <path
              d="M13.2 11.2h-1.8v1.6H9.7v1.8h1.7v5.6c0 1.5.8 2.2 2.3 2.2h1.4v-1.8h-1c-.5 0-.8-.3-.8-.8v-5.2h2.7v-1.8h-2.8v-1.6zm4.8 3.4h2v7.6h-2v-7.6zm1-3.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2zm6.2 3.2-1.8 5.6-1.8-5.6h-2.1l2.8 7.6h2.2l2.8-7.6h-2.1z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'maps':
      return {
        name: 'Google Maps',
        brandColor: '#EA4335',
        textColor: 'text-[#EA4335]',
        gradientBadge: 'bg-[#EA4335] text-white shadow-[#EA4335]/30',
        bgLight: 'bg-rose-50 hover:bg-rose-100',
        bgDark: 'dark:bg-rose-950/40 dark:hover:bg-rose-900/50',
        borderColor: 'border-rose-200 dark:border-rose-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#ffffff" stroke="#EA4335" strokeWidth="1.5" />
            <path
              d="M16 6.5C12.4 6.5 9.5 9.4 9.5 13c0 4.8 6.5 12.5 6.5 12.5s6.5-7.7 6.5-12.5c0-3.6-2.9-6.5-6.5-6.5zm0 9c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"
              fill="#EA4335"
            />
          </svg>
        ),
      };

    case 'dribbble':
      return {
        name: 'Dribbble',
        brandColor: '#EA4C89',
        textColor: 'text-[#EA4C89]',
        gradientBadge: 'bg-[#EA4C89] text-white shadow-[#EA4C89]/30',
        bgLight: 'bg-pink-50 hover:bg-pink-100',
        bgDark: 'dark:bg-pink-950/40 dark:hover:bg-pink-900/50',
        borderColor: 'border-pink-300 dark:border-pink-800',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#EA4C89" />
            <path
              d="M16 6C10.5 6 6 10.5 6 16s4.5 10 10 10 10-4.5 10-10S21.5 6 16 6zm7.8 7.3c-.6-.1-2.9-.6-5.8-.3-.1-.3-.3-.7-.5-1.1 1.7-1.1 3.2-2.6 4.2-4.3 1.3 1.6 2.1 3.5 2.1 5.7zm-6.2-7c-.9 1.5-2.2 2.8-3.7 3.8-1.5-2.8-3.1-5-3.3-5.3 1.6-.7 3.4-1.1 5.2-1.1.6 0 1.2.1 1.8.3v2.3zm-8.8 2.2c.2.3 1.8 2.5 3.3 5.3-2.9 1-5.6 1.4-6.3 1.4C6.2 12.3 7.8 9.8 8.8 8.5zm-2.7 8.3c.7 0 3-.4 5.9-1.3.4.9.8 1.9 1.1 2.8-3.3 2.1-4.7 5.8-4.9 6.2-1.4-1.9-2.2-4.3-2.1-7.7zm4.2 9c.2-.4 1.4-3.7 4.5-5.6 1.7 4.1 2.4 7.6 2.5 8-1.6.6-3.4.8-5.2.5-.6-.1-1.2-.5-1.8-.9zm8.5 1.5c-.2-.5-.9-3.8-2.6-7.8 2.7-.3 5.3.4 5.9.6-.8 3.2-3 5.8-6.1 7.2z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'behance':
      return {
        name: 'Behance',
        brandColor: '#1769FF',
        textColor: 'text-[#1769FF]',
        gradientBadge: 'bg-[#1769FF] text-white shadow-[#1769FF]/30',
        bgLight: 'bg-blue-50 hover:bg-blue-100',
        bgDark: 'dark:bg-blue-950/40 dark:hover:bg-blue-900/50',
        borderColor: 'border-blue-300 dark:border-blue-800',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="7" fill="#1769FF" />
            <path
              d="M13.8 15.7c.9-.3 1.5-1.1 1.5-2.2 0-2-1.4-2.8-3.5-2.8H7.2v10.6h4.8c2.4 0 3.9-.9 3.9-3.1 0-1.4-.9-2.2-2.1-2.5zm-4.3-3.2h2c1.1 0 1.7.4 1.7 1.3 0 .9-.6 1.3-1.7 1.3h-2v-2.6zm2.3 6.9H9.5v-2.8h2.3c1.2 0 1.9.5 1.9 1.4 0 1-.7 1.4-1.9 1.4zm10.7-3.8c-.2-1.9-1.4-3.2-3.6-3.2-2.3 0-3.7 1.7-3.7 4.1 0 2.5 1.5 4.1 3.9 4.1 1.7 0 3-.9 3.5-2.4h-2c-.3.6-.9.9-1.5.9-1.1 0-1.7-.7-1.8-1.7h5.3c0-.3 0-.6-.1-.8zm-5.2-1.3c.1-.8.7-1.4 1.6-1.4.9 0 1.5.6 1.6 1.4h-3.2zm-.7-4.2h3.9v1.2h-3.9v-1.2z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'tiktok':
      return {
        name: 'TikTok',
        brandColor: '#000000',
        textColor: 'text-neutral-900 dark:text-neutral-100',
        gradientBadge: 'bg-black text-white shadow-black/30',
        bgLight: 'bg-neutral-100 hover:bg-neutral-200',
        bgDark: 'dark:bg-neutral-800 dark:hover:bg-neutral-700',
        borderColor: 'border-neutral-300 dark:border-neutral-700',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#000000" />
            <path
              d="M22.5 12.8c-1.5-.2-2.7-1.2-3.1-2.6-.1-.4-.2-.8-.2-1.2h-3.1v11.3c0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1s1.4-3.1 3.1-3.1c.4 0 .7.1 1.1.2V14c-.4-.1-.7-.1-1.1-.1-3.4 0-6.2 2.8-6.2 6.2 0 3.4 2.8 6.2 6.2 6.2 3.4 0 6.2-2.8 6.2-6.2v-5.6c1.3 1 2.9 1.6 4.6 1.7v-3.4h-.1z"
              fill="white"
            />
            <path
              d="M22.5 12.8c-1.5-.2-2.7-1.2-3.1-2.6h-.5v3c1.3 1 2.9 1.6 4.6 1.7v-2.1h-1z"
              fill="#25F4EE"
            />
          </svg>
        ),
      };

    case 'discord':
      return {
        name: 'Discord',
        brandColor: '#5865F2',
        textColor: 'text-[#5865F2]',
        gradientBadge: 'bg-[#5865F2] text-white shadow-[#5865F2]/30',
        bgLight: 'bg-indigo-50 hover:bg-indigo-100',
        bgDark: 'dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50',
        borderColor: 'border-indigo-200 dark:border-indigo-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="7" fill="#5865F2" />
            <path
              d="M21.8 9.5a13.3 13.3 0 0 0-3.3-1 .1.1 0 0 0-.1.1c-.1.3-.3.8-.5 1.2a12.3 12.3 0 0 0-3.8 0c-.2-.4-.4-.9-.5-1.2 0-.1-.1-.1-.1-.1a13.3 13.3 0 0 0-3.3 1c-.1 0-.1.1-.2.2-2.1 3.2-2.7 6.3-2.4 9.4 0 .1.1.2.2.3 2.2 1.6 4.3 2.6 6.4 2.6.1 0 .2 0 .2-.1.5-.7 1-1.4 1.4-2.2 0-.1 0-.2-.1-.2-.7-.3-1.4-.6-2-1-.1-.1-.1-.2 0-.3.1-.1.3-.2.4-.3 4.2 1.9 8.7 1.9 12.9 0 .1.1.3.2.4.3 0 .1 0 .2-.1.3-.6.4-1.3.7-2 1-.1 0-.1.1-.1.2.4.8.9 1.5 1.4 2.2.1.1.1.1.2.1 2.1 0 4.2-1 6.4-2.6.1-.1.1-.2.1-.3.4-3.6-.5-6.7-2.4-9.4 0-.1-.1-.2-.2-.2zm-8.6 8.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm5.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'pinterest':
      return {
        name: 'Pinterest',
        brandColor: '#BD081C',
        textColor: 'text-[#BD081C]',
        gradientBadge: 'bg-[#BD081C] text-white shadow-[#BD081C]/30',
        bgLight: 'bg-red-50 hover:bg-red-100',
        bgDark: 'dark:bg-red-950/40 dark:hover:bg-red-900/50',
        borderColor: 'border-red-200 dark:border-red-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#BD081C" />
            <path
              d="M16 6.5C10.8 6.5 6.5 10.8 6.5 16c0 4 2.5 7.4 6 8.8-.1-.7-.2-1.8 0-2.6l1.4-5.9s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1.1 4.2-.3 1.3.6 2.3 1.9 2.3 2.2 0 3.9-2.4 3.9-5.8 0-3-2.2-5.2-5.3-5.2-3.6 0-5.8 2.7-5.8 5.6 0 1.1.4 2.3 1 3 .1.1.1.2.1.4l-.4 1.5c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.7 0-3.8 2.8-7.3 8-7.3 4.2 0 7.5 3 7.5 7 0 4.2-2.6 7.6-6.3 7.6-1.2 0-2.4-.6-2.8-1.4l-.8 3c-.3 1.1-1.1 2.5-1.6 3.4 1.1.3 2.3.5 3.5.5 5.2 0 9.5-4.3 9.5-9.5S21.2 6.5 16 6.5z"
              fill="white"
            />
          </svg>
        ),
      };

    case 'spotify':
      return {
        name: 'Spotify',
        brandColor: '#1DB954',
        textColor: 'text-[#1DB954]',
        gradientBadge: 'bg-[#1DB954] text-white shadow-[#1DB954]/30',
        bgLight: 'bg-emerald-50 hover:bg-emerald-100',
        bgDark: 'dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#1DB954" />
            <path
              d="M21.9 21.6c-.3.4-.8.5-1.2.3-3.3-2-7.5-2.5-12.4-1.4-.5.1-.9-.2-1-.7-.1-.5.2-.9.7-1 5.4-1.2 10-.7 13.6 1.5.5.3.6.9.3 1.3zm1.6-3.6c-.4.5-1 .7-1.5.3-4-2.5-10.1-3.2-14.8-1.8-.6.2-1.2-.2-1.4-.8s.2-1.2.8-1.4c5.4-1.6 12.1-.9 16.6 1.9.5.4.7 1.1.3 1.8zm.1-3.8C18.8 11.3 11 11 6.5 12.4c-.7.2-1.5-.2-1.7-.9-.2-.7.2-1.5.9-1.7 5.2-1.6 13.9-1.3 19.3 1.9.7.4.9 1.3.5 2-.4.6-1.3.8-1.9.5z"
              fill="white"
            />
          </svg>
        ),
      };

    default:
      return {
        name: platform || 'Website Link',
        brandColor: '#4f46e5',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        gradientBadge: 'bg-gradient-to-r from-indigo-600 to-amber-500 text-white shadow-indigo-500/30',
        bgLight: 'bg-indigo-50/90 hover:bg-indigo-100/90',
        bgDark: 'dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50',
        borderColor: 'border-indigo-200 dark:border-indigo-800/60',
        icon: (cls = 'w-5 h-5') => (
          <svg className={cls} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="#4f46e5" />
            <circle cx="16" cy="16" r="8.5" stroke="white" strokeWidth="1.8" fill="none" />
            <ellipse cx="16" cy="16" rx="4.5" ry="8.5" stroke="white" strokeWidth="1.5" fill="none" />
            <line x1="7.5" y1="16" x2="24.5" y2="16" stroke="white" strokeWidth="1.5" />
          </svg>
        ),
      };
  }
}
