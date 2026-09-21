export type SocialPlatform =
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'x'
  | 'youtube'
  | 'telegram'
  | 'tiktok'
  | 'fiverr'
  | 'maps'
  | 'dribbble'
  | 'behance'
  | 'discord'
  | 'pinterest'
  | 'spotify'
  | 'website'
  | 'other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  iconName?: string;
}

export interface ContactLine {
  id: string;
  type: 'mobile' | 'telephone' | 'work' | 'whatsapp' | 'hotline' | 'email' | 'emergency' | 'other';
  label: string;
  value: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  github?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Design' | 'Tools' | 'Core';
  level: number; // 0 - 100
}

export type ThemeColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'cyan';

export interface UserProfile {
  id: string;
  token: string; // Unique token e.g. "NFC-782941"
  slug: string;  // Unique slug for URL e.g. "sohel-dev"
  fullName: string;
  headline: string;
  company?: string;
  designation: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  websiteLogoUrl?: string;
  phone: string;
  phoneSecondary?: string;
  telephone?: string;
  contactLines?: ContactLine[];
  directSectionOrder?: 'contact_first' | 'social_first';
  email: string;
  whatsapp: string;
  messengerUrl?: string;
  address?: string; // Present / Living / Work address
  permanentAddress?: string; // Home Address
  websiteUrl?: string;
  themeColor: ThemeColor;
  socialLinks: SocialLink[];
  skills?: SkillItem[];
  services?: ServiceItem[];
  projects?: ProjectItem[];
  isPrimaryOwner: boolean; // Main portfolio owner
  isActive: boolean;
  isBlocked?: boolean; // Admin can block / suspend card
  validityType?: 'lifetime' | '1_month' | '3_months' | '6_months' | '9_months' | '12_months' | 'custom';
  expiryDate?: string; // ISO date string, or null for lifetime
  customDays?: number; // e.g. 316 days
  ownerPin?: string; // Secret PIN for card owner to edit their own card
  ownerUserId?: string; // Unique User ID for card owner to login and edit links
  ownerPassword?: string; // Password for card owner to login and edit links
  tapCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  isNfcPublicButtonLocked: boolean;
  adminPin: string;
  websiteName?: string;
  websiteLogoUrl?: string;
}

export interface AdminAuthCredentials {
  username: string;
  passwordHash: string;
  updatedAt?: string;
}

export interface FirebaseKeyConfig {
  id: string;
  label: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  status: 'active' | 'standby' | 'quota_exhausted' | 'disabled';
  requestCount: number;
  lastUsed?: string;
}

export interface ScanLogEntry {
  id: string;
  timestamp: string;
  deviceType?: string;
}

export type ViewMode = 'portfolio' | 'nfc_card' | 'admin' | 'client_portal';
