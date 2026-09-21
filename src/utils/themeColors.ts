import { ThemeColor } from '../types';

export interface ColorThemeDefinition {
  name: ThemeColor;
  primaryHex: string;
  rgb: string;
  glowRgba: (alpha: number) => string;
  textClass: string;
  textDarkClass: string;
  bgClass: string;
  bgSubtleClass: string;
  borderClass: string;
  borderSolidClass: string;
  ringClass: string;
  gradientFromTo: string;
  accentBadge: string;
  btnPrimary: string;
  cardGlow: string;
}

export const THEME_PALETTES: Record<ThemeColor, ColorThemeDefinition> = {
  amber: {
    name: 'amber',
    primaryHex: '#f59e0b',
    rgb: '245, 158, 11',
    glowRgba: (a) => `rgba(245, 158, 11, ${a})`,
    textClass: 'text-amber-400',
    textDarkClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500',
    bgSubtleClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderClass: 'border-amber-500/30 dark:border-amber-500/40',
    borderSolidClass: 'border-amber-400',
    ringClass: 'focus:ring-amber-500',
    gradientFromTo: 'from-amber-500 to-amber-600',
    accentBadge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    btnPrimary: 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-amber-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  },
  indigo: {
    name: 'indigo',
    primaryHex: '#6366f1',
    rgb: '99, 102, 241',
    glowRgba: (a) => `rgba(99, 102, 241, ${a})`,
    textClass: 'text-indigo-400',
    textDarkClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500',
    bgSubtleClass: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    borderClass: 'border-indigo-500/30 dark:border-indigo-500/40',
    borderSolidClass: 'border-indigo-400',
    ringClass: 'focus:ring-indigo-500',
    gradientFromTo: 'from-indigo-500 to-indigo-600',
    accentBadge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-indigo-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(99,102,241,0.2)]',
  },
  emerald: {
    name: 'emerald',
    primaryHex: '#10b981',
    rgb: '16, 185, 129',
    glowRgba: (a) => `rgba(16, 185, 129, ${a})`,
    textClass: 'text-emerald-400',
    textDarkClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500',
    bgSubtleClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderClass: 'border-emerald-500/30 dark:border-emerald-500/40',
    borderSolidClass: 'border-emerald-400',
    ringClass: 'focus:ring-emerald-500',
    gradientFromTo: 'from-emerald-500 to-emerald-600',
    accentBadge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    btnPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold shadow-emerald-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
  rose: {
    name: 'rose',
    primaryHex: '#f43f5e',
    rgb: '244, 63, 94',
    glowRgba: (a) => `rgba(244, 63, 94, ${a})`,
    textClass: 'text-rose-400',
    textDarkClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-500',
    bgSubtleClass: 'bg-rose-500/10 dark:bg-rose-500/20',
    borderClass: 'border-rose-500/30 dark:border-rose-500/40',
    borderSolidClass: 'border-rose-400',
    ringClass: 'focus:ring-rose-500',
    gradientFromTo: 'from-rose-500 to-rose-600',
    accentBadge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    btnPrimary: 'bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-rose-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]',
  },
  sky: {
    name: 'sky',
    primaryHex: '#0ea5e9',
    rgb: '14, 165, 233',
    glowRgba: (a) => `rgba(14, 165, 233, ${a})`,
    textClass: 'text-sky-400',
    textDarkClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-500',
    bgSubtleClass: 'bg-sky-500/10 dark:bg-sky-500/20',
    borderClass: 'border-sky-500/30 dark:border-sky-500/40',
    borderSolidClass: 'border-sky-400',
    ringClass: 'focus:ring-sky-500',
    gradientFromTo: 'from-sky-500 to-sky-600',
    accentBadge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
    btnPrimary: 'bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold shadow-sky-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(14,165,233,0.2)]',
  },
  violet: {
    name: 'violet',
    primaryHex: '#8b5cf6',
    rgb: '139, 92, 246',
    glowRgba: (a) => `rgba(139, 92, 246, ${a})`,
    textClass: 'text-violet-400',
    textDarkClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-500',
    bgSubtleClass: 'bg-violet-500/10 dark:bg-violet-500/20',
    borderClass: 'border-violet-500/30 dark:border-violet-500/40',
    borderSolidClass: 'border-violet-400',
    ringClass: 'focus:ring-violet-500',
    gradientFromTo: 'from-violet-500 to-violet-600',
    accentBadge: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    btnPrimary: 'bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-violet-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
  },
  cyan: {
    name: 'cyan',
    primaryHex: '#06b6d4',
    rgb: '6, 182, 212',
    glowRgba: (a) => `rgba(6, 182, 212, ${a})`,
    textClass: 'text-cyan-400',
    textDarkClass: 'text-cyan-600 dark:text-cyan-400',
    bgClass: 'bg-cyan-500',
    bgSubtleClass: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    borderClass: 'border-cyan-500/30 dark:border-cyan-500/40',
    borderSolidClass: 'border-cyan-400',
    ringClass: 'focus:ring-cyan-500',
    gradientFromTo: 'from-cyan-500 to-cyan-600',
    accentBadge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    btnPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold shadow-cyan-500/20',
    cardGlow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]',
  },
};

export function getThemePalette(color?: ThemeColor): ColorThemeDefinition {
  if (color && THEME_PALETTES[color]) {
    return THEME_PALETTES[color];
  }
  return THEME_PALETTES.amber;
}
