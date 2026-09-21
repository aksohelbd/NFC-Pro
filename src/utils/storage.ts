import { UserProfile, AdminSettings, AdminAuthCredentials, FirebaseKeyConfig } from '../types';
import {
  saveProfilesToIndexedDB,
  saveFirebaseKeysToIndexedDB,
  getFirebaseKeysFromIndexedDB,
} from './indexedDb';
import {
  syncProfilesToFirebase,
  syncSingleProfileToFirebase,
  deleteProfileFromFirebase,
  syncAdminSettingsToFirebase,
} from './firebaseRealtime';

const STORAGE_KEY = 'nfc_portfolio_profiles_v1';
const ADMIN_PIN_KEY = 'nfc_portfolio_admin_pin';
const ADMIN_SETTINGS_KEY = 'nfc_portfolio_admin_settings';
const ADMIN_AUTH_KEY = 'nfc_portfolio_admin_auth_v2';
const FIREBASE_KEYS_STORAGE = 'nfc_portfolio_firebase_keys_v1';

export const DEFAULT_ADMIN_USERNAME = 'sohel316';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

export const DEFAULT_ADMIN_AUTH: AdminAuthCredentials = {
  username: DEFAULT_ADMIN_USERNAME,
  passwordHash: DEFAULT_ADMIN_PASSWORD,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_FIREBASE_KEYS: FirebaseKeyConfig[] = [
  {
    id: 'fb-key-1',
    label: 'Primary Project (Slot 1 - nfc-pro-8725e)',
    apiKey: 'AIzaSyBl9apPTZwLl2cyJ6GAG9i3AerAUN8MJG0',
    authDomain: 'nfc-pro-8725e.firebaseapp.com',
    projectId: 'nfc-pro-8725e',
    storageBucket: 'nfc-pro-8725e.firebasestorage.app',
    messagingSenderId: '753045137897',
    appId: '1:753045137897:web:05743066cda12ad7230378',
    measurementId: 'G-01ZGKPPBLY',
    status: 'active',
    requestCount: 0,
  },
  {
    id: 'fb-key-2',
    label: 'Failover Backup (Slot 2)',
    apiKey: '',
    authDomain: '',
    projectId: '',
    status: 'standby',
    requestCount: 0,
  },
  {
    id: 'fb-key-3',
    label: 'Failover Backup (Slot 3)',
    apiKey: '',
    authDomain: '',
    projectId: '',
    status: 'standby',
    requestCount: 0,
  },
  {
    id: 'fb-key-4',
    label: 'Failover Backup (Slot 4)',
    apiKey: '',
    authDomain: '',
    projectId: '',
    status: 'standby',
    requestCount: 0,
  },
  {
    id: 'fb-key-5',
    label: 'Failover Backup (Slot 5)',
    apiKey: '',
    authDomain: '',
    projectId: '',
    status: 'standby',
    requestCount: 0,
  },
];

export const DEFAULT_ADMIN_PIN = 'admin123';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  isNfcPublicButtonLocked: false,
  adminPin: DEFAULT_ADMIN_PIN,
  websiteName: 'NexTech NFC PRO',
  websiteLogoUrl: '',
};

export function computeExpiryDate(
  validityType: 'lifetime' | '1_month' | '3_months' | '6_months' | '9_months' | '12_months' | 'custom',
  customDays?: number,
  fromDate: Date = new Date()
): string | undefined {
  if (validityType === 'lifetime') return undefined;

  const date = new Date(fromDate);
  switch (validityType) {
    case '1_month':
      date.setMonth(date.getMonth() + 1);
      break;
    case '3_months':
      date.setMonth(date.getMonth() + 3);
      break;
    case '6_months':
      date.setMonth(date.getMonth() + 6);
      break;
    case '9_months':
      date.setMonth(date.getMonth() + 9);
      break;
    case '12_months':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      date.setDate(date.getDate() + (customDays || 316));
      break;
    default:
      date.setFullYear(date.getFullYear() + 1);
  }
  return date.toISOString();
}

export function getProfileValidityInfo(profile: UserProfile): {
  isExpired: boolean;
  daysRemaining: number | null;
  statusText: string;
  isBlocked: boolean;
  canAccess: boolean;
} {
  if (profile.isBlocked) {
    return {
      isExpired: false,
      daysRemaining: null,
      statusText: 'Locked / Blocked by Admin',
      isBlocked: true,
      canAccess: false,
    };
  }

  if (profile.validityType === 'lifetime' || !profile.expiryDate) {
    return {
      isExpired: false,
      daysRemaining: null,
      statusText: 'Lifetime Validity',
      isBlocked: false,
      canAccess: true,
    };
  }

  const expiryMs = new Date(profile.expiryDate).getTime();
  const nowMs = Date.now();
  const diffDays = Math.ceil((expiryMs - nowMs) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isExpired: true,
      daysRemaining: 0,
      statusText: 'Validity Expired',
      isBlocked: false,
      canAccess: false,
    };
  }

  return {
    isExpired: false,
    daysRemaining: diffDays,
    statusText: `${diffDays} days remaining`,
    isBlocked: false,
    canAccess: true,
  };
}

export const DEFAULT_PRIMARY_PROFILE: UserProfile = {
  id: 'owner-main-1',
  token: 'AKS316',
  slug: 'aks316',
  fullName: 'AK Sohel',
  headline: 'Full-Stack Software Engineer & Smart NFC Specialist',
  company: 'NexTech Solutions',
  designation: 'Senior Web & Mobile Solutions Architect',
  bio: 'Passionate digital creator with 5+ years of experience crafting ultra-responsive web applications, modern UI/UX experiences, and interactive NFC smart card ecosystems. Dedicated to seamless digital networking and high-performance digital tools.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  phone: '+8801700000000',
  phoneSecondary: '+8801800000000',
  telephone: '+8802-9876543',
  websiteLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  contactLines: [
    {
      id: 'cl-1',
      type: 'mobile',
      label: 'Personal Mobile Hotline',
      value: '+8801700000000',
    },
    {
      id: 'cl-2',
      type: 'telephone',
      label: 'Office Telephone / Desk',
      value: '+8802-9876543',
    },
    {
      id: 'cl-3',
      type: 'work',
      label: 'Work & WhatsApp Line',
      value: '+8801800000000',
    },
  ],
  email: 'aksohelbd316@gmail.com',
  whatsapp: '+8801700000000',
  messengerUrl: 'https://m.me/aksohel',
  address: 'Dhaka, Bangladesh',
  permanentAddress: 'Cumilla, Bangladesh',
  websiteUrl: 'https://portfolio.sohel.dev',
  themeColor: 'amber',
  isPrimaryOwner: true,
  isActive: true,
  isBlocked: false,
  validityType: 'lifetime',
  ownerUserId: 'aks316',
  ownerPassword: 'user123',
  tapCount: 142,
  createdAt: '2025-01-15T10:00:00.000Z',
  updatedAt: '2026-03-01T14:30:00.000Z',
  socialLinks: [
    {
      id: 's-1',
      platform: 'whatsapp',
      label: 'WhatsApp',
      url: 'https://wa.me/8801700000000',
    },
    {
      id: 's-2',
      platform: 'facebook',
      label: 'Facebook',
      url: 'https://facebook.com',
    },
    {
      id: 's-3',
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com',
    },
    {
      id: 's-4',
      platform: 'github',
      label: 'GitHub',
      url: 'https://github.com',
    },
    {
      id: 's-5',
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com',
    },
    {
      id: 's-6',
      platform: 'telegram',
      label: 'Telegram',
      url: 'https://t.me',
    },
    {
      id: 's-7',
      platform: 'youtube',
      label: 'YouTube',
      url: 'https://youtube.com',
    },
    {
      id: 's-8',
      platform: 'twitter',
      label: 'X (Twitter)',
      url: 'https://twitter.com',
    },
    {
      id: 's-9',
      platform: 'fiverr',
      label: 'Fiverr Pro',
      url: 'https://fiverr.com',
    },
    {
      id: 's-10',
      platform: 'maps',
      label: 'Office Location (Maps)',
      url: 'https://maps.google.com',
    },
    {
      id: 's-11',
      platform: 'dribbble',
      label: 'Dribbble Portfolio',
      url: 'https://dribbble.com',
    },
  ],
  services: [
    {
      id: 'srv-1',
      title: 'Full-Stack Web Development',
      description: 'Building blazing-fast web apps using React, Node.js, Next.js, and modern cloud architectures.',
      icon: 'Code2',
    },
    {
      id: 'srv-2',
      title: 'NFC Smart Card Solutions',
      description: 'Custom programmable digital business cards with instant tap contact exchange & private cloud management.',
      icon: 'CreditCard',
    },
    {
      id: 'srv-3',
      title: 'UI/UX & Motion Design',
      description: 'Crafting clean, accessible, and high-conversion interfaces with fluid micro-interactions.',
      icon: 'Palette',
    },
    {
      id: 'srv-4',
      title: 'API & Cloud Architecture',
      description: 'Designing reliable REST APIs, database schemas, authentication, and secure client-side storage.',
      icon: 'Cloud',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'React & TypeScript', category: 'Frontend', level: 95 },
    { id: 'sk-2', name: 'Tailwind CSS & UI', category: 'Frontend', level: 96 },
    { id: 'sk-3', name: 'Node.js & Express', category: 'Backend', level: 90 },
    { id: 'sk-4', name: 'NFC Tech & vCard 3.0', category: 'Core', level: 98 },
    { id: 'sk-5', name: 'REST & GraphQL', category: 'Backend', level: 88 },
    { id: 'sk-6', name: 'Git & Cloud Run', category: 'Tools', level: 92 },
  ],
  projects: [
    {
      id: 'prj-1',
      title: 'SmartTap NFC Platform',
      category: 'Hardware & Web',
      description: 'An enterprise digital business card infrastructure with instant vCard sync, QR backup, and privacy-shielded client dashboards.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      tags: ['React', 'NFC', 'vCard', 'Tailwind'],
      link: '#',
    },
    {
      id: 'prj-2',
      title: 'SaaS Analytics Dashboard',
      category: 'Web Application',
      description: 'Real-time metrics, revenue monitoring, and automated conversion tracking for subscription platforms.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      tags: ['TypeScript', 'Charts', 'Express'],
      link: '#',
    },
    {
      id: 'prj-3',
      title: 'FinTech Mobile Pay Portal',
      category: 'Mobile UX',
      description: 'Seamless contactless payment experience with biological biometric authentication and instant digital receipts.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      tags: ['Mobile First', 'Security', 'FinTech'],
      link: '#',
    },
  ],
};

export const SAMPLE_CLIENT_PROFILES: UserProfile[] = [
  {
    id: 'client-card-2',
    token: 'AKS-8M9K',
    slug: 'aks-8m9k',
    fullName: 'Tanvir Hossain',
    headline: 'Managing Director & Venture Investor',
    company: 'Apex Global Ventures',
    designation: 'Managing Director',
    bio: 'Angel investor and business strategist helping high-growth startups scale across South Asia. Contact me for strategic partnerships and advisory.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    phone: '+8801711223344',
    phoneSecondary: '+8801911223344',
    email: 'tanvir@apexventures.com',
    whatsapp: '+8801711223344',
    messengerUrl: 'https://m.me/tanvir.apex',
    address: 'Gulshan-2, Dhaka',
    permanentAddress: 'Cumilla, Bangladesh',
    websiteUrl: 'https://apexventures.com',
    themeColor: 'emerald',
    isPrimaryOwner: false,
    isActive: true,
    isBlocked: false,
    validityType: 'custom',
    customDays: 316,
    expiryDate: new Date(Date.now() + 316 * 24 * 60 * 60 * 1000).toISOString(),
    ownerPin: '1234',
    ownerUserId: 'aks317',
    ownerPassword: '1234',
    tapCount: 89,
    createdAt: '2025-02-10T12:00:00.000Z',
    updatedAt: '2026-02-28T09:15:00.000Z',
    socialLinks: [
      { id: 's-t1', platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/8801711223344' },
      { id: 's-t2', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com' },
      { id: 's-t3', platform: 'twitter', label: 'X (Twitter)', url: 'https://twitter.com' },
      { id: 's-t4', platform: 'facebook', label: 'Facebook', url: 'https://facebook.com' },
    ],
  },
  {
    id: 'client-card-3',
    token: 'AKS-4R2T',
    slug: 'aks-4r2t',
    fullName: 'Dr. Farhana Yasmin',
    headline: 'Consultant Dermatologist & Aesthetic Surgeon',
    company: 'Nova Skin & Wellness Clinic',
    designation: 'Lead Consultant',
    bio: 'Specialist in clinical dermatology, laser skin rejuvenation, and preventive skincare. Tap to book appointments or save my clinic contacts.',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    phone: '+8801799887766',
    email: 'dr.farhana@novawellness.org',
    whatsapp: '+8801799887766',
    address: 'Dhanmondi, Dhaka',
    permanentAddress: 'Sylhet, Bangladesh',
    websiteUrl: 'https://novawellness.org',
    themeColor: 'rose',
    isPrimaryOwner: false,
    isActive: true,
    isBlocked: false,
    validityType: '6_months',
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    ownerPin: '1234',
    ownerUserId: 'aks318',
    ownerPassword: '1234',
    tapCount: 215,
    createdAt: '2025-03-01T15:00:00.000Z',
    updatedAt: '2026-03-10T11:00:00.000Z',
    socialLinks: [
      { id: 's-f1', platform: 'whatsapp', label: 'Appointment WhatsApp', url: 'https://wa.me/8801799887766' },
      { id: 's-f2', platform: 'instagram', label: 'Instagram Clinic', url: 'https://instagram.com' },
      { id: 's-f3', platform: 'facebook', label: 'Facebook Page', url: 'https://facebook.com' },
    ],
  }
];

export function generateRandomAksToken(length = 5): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AKS-${result}`;
}

export function generateNextAksId(profiles?: UserProfile[]): { token: string; slug: string; ownerUserId: string; ownerPassword: string } {
  const list = profiles && profiles.length > 0 ? profiles : getStoredProfiles();
  
  // 1. Unpredictable random alphanumeric token starting with capital "AKS-" (e.g. AKS-7K9M2)
  let randomToken = generateRandomAksToken(5);
  while (list.some((p) => p.token.toLowerCase() === randomToken.toLowerCase() || p.slug.toLowerCase() === randomToken.toLowerCase())) {
    randomToken = generateRandomAksToken(5);
  }

  // 2. Sequential login User ID auto-suggested starting after aks316 (aks317, aks318, ...)
  let highestUserNum = 316;
  list.forEach((p) => {
    const uid = p.ownerUserId || '';
    const match = uid.match(/aks-?(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestUserNum) {
        highestUserNum = num;
      }
    }
  });

  const nextUserNum = highestUserNum + 1;
  const autoUserId = `aks${nextUserNum}`;

  return {
    token: randomToken,
    slug: randomToken.toLowerCase(),
    ownerUserId: autoUserId,
    ownerPassword: '1234',
  };
}

export function getStoredProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_PRIMARY_PROFILE, ...SAMPLE_CLIENT_PROFILES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      saveProfilesToIndexedDB(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [DEFAULT_PRIMARY_PROFILE, ...SAMPLE_CLIENT_PROFILES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      saveProfilesToIndexedDB(initial);
      return initial;
    }
    // Hydrate existing stored profiles with any newly added properties if missing
    return parsed.map((p: UserProfile) => {
      const fallbackUserId = p.slug || p.token.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (p.isPrimaryOwner) {
        return {
          ...DEFAULT_PRIMARY_PROFILE,
          ...p,
          token: 'AKS316',
          slug: 'aks316',
          themeColor: p.themeColor || 'amber',
          ownerUserId: p.ownerUserId || 'aks316',
          ownerPassword: p.ownerPassword || 'user123',
          permanentAddress:
            p.permanentAddress === 'Brahmanbaria, Bangladesh' || !p.permanentAddress
              ? 'Cumilla, Bangladesh'
              : p.permanentAddress,
          contactLines: p.contactLines && p.contactLines.length > 0 ? p.contactLines : DEFAULT_PRIMARY_PROFILE.contactLines,
          telephone: p.telephone || DEFAULT_PRIMARY_PROFILE.telephone,
          websiteLogoUrl: p.websiteLogoUrl || DEFAULT_PRIMARY_PROFILE.websiteLogoUrl,
          socialLinks: Array.isArray(p.socialLinks) ? p.socialLinks : DEFAULT_PRIMARY_PROFILE.socialLinks,
        };
      }
      return {
        ...p,
        themeColor: p.themeColor || 'amber',
        ownerUserId: p.ownerUserId || fallbackUserId,
        ownerPassword: p.ownerPassword || 'user123',
        socialLinks: Array.isArray(p.socialLinks) ? p.socialLinks : [],
      };
    });
  } catch (err) {
    console.error('Error reading profiles from storage:', err);
    return [DEFAULT_PRIMARY_PROFILE, ...SAMPLE_CLIENT_PROFILES];
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    // Asynchronous dual sync to IndexedDB local database & Firebase Realtime Cloud
    saveProfilesToIndexedDB(profiles).catch(() => {});
    syncProfilesToFirebase(profiles).catch(() => {});
  } catch (err) {
    console.error('Error saving profiles to storage:', err);
  }
}

export function getPrimaryOwnerProfile(): UserProfile {
  const profiles = getStoredProfiles();
  const found = profiles.find((p) => p.isPrimaryOwner);
  return found || profiles[0] || DEFAULT_PRIMARY_PROFILE;
}

export function findProfileBySlugOrToken(query: string): UserProfile | null {
  if (!query) return null;
  const profiles = getStoredProfiles();
  const q = query.trim().toLowerCase();
  const normQ = q.replace(/[^a-z0-9]/g, '');
  
  return profiles.find((p) => {
    const pTokenNorm = p.token.toLowerCase().replace(/[^a-z0-9]/g, '');
    const pSlugNorm = p.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      p.token.toLowerCase() === q ||
      p.slug.toLowerCase() === q ||
      p.id.toLowerCase() === q ||
      pTokenNorm === normQ ||
      pSlugNorm === normQ
    );
  }) || null;
}

export function findProfileByToken(token: string): UserProfile | null {
  if (!token) return null;
  const profiles = getStoredProfiles();
  const cleanToken = token.trim().toLowerCase().replace(/^nfc-?/i, '');
  const normToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
  return profiles.find((p) => {
    const pTokenClean = p.token.toLowerCase().replace(/^nfc-?/i, '');
    const pTokenNorm = p.token.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      pTokenClean === cleanToken ||
      p.token.toLowerCase() === token.trim().toLowerCase() ||
      pTokenNorm === normToken
    );
  }) || null;
}

export function searchProfiles(searchTerm: string): UserProfile[] {
  const profiles = getStoredProfiles();
  if (!searchTerm.trim()) return profiles;
  const q = searchTerm.toLowerCase().trim();
  
  return profiles.filter((p) => 
    p.fullName.toLowerCase().includes(q) ||
    p.token.toLowerCase().includes(q) ||
    p.slug.toLowerCase().includes(q) ||
    p.phone.includes(q) ||
    p.email.toLowerCase().includes(q) ||
    (p.company && p.company.toLowerCase().includes(q))
  );
}

export function updateProfile(updated: UserProfile): boolean {
  const profiles = getStoredProfiles();
  const index = profiles.findIndex((p) => p.id === updated.id);
  if (index === -1) return false;
  
  const modifiedProfile: UserProfile = {
    ...updated,
    updatedAt: new Date().toISOString(),
  };
  profiles[index] = modifiedProfile;
  saveProfiles(profiles);
  // Direct instant push to Firebase Firestore in real-time
  syncSingleProfileToFirebase(modifiedProfile).catch(() => {});
  return true;
}

export function createNewProfile(partial: Partial<UserProfile>): UserProfile {
  const profiles = getStoredProfiles();
  const nextAks = generateNextAksId(profiles);
  const token = partial.token?.trim() || nextAks.token;
  const slug = partial.slug?.trim() || nextAks.slug;
  const ownerUserId = partial.ownerUserId?.trim() || nextAks.ownerUserId;
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  const validityType = partial.validityType || '12_months';
  const customDays = partial.customDays || 316;
  const expiryDate = partial.expiryDate || computeExpiryDate(validityType, customDays);

  const newProfile: UserProfile = {
    id: `profile-${Date.now()}-${randomNum}`,
    token,
    slug,
    fullName: partial.fullName || 'New Member',
    headline: partial.headline || 'Digital Professional',
    company: partial.company || '',
    designation: partial.designation || 'Specialist',
    bio: partial.bio || 'Thank you for tapping my NFC card! Here are my direct contact details.',
    avatarUrl: partial.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80',
    coverUrl: partial.coverUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    phone: partial.phone || '+8801700000000',
    phoneSecondary: partial.phoneSecondary || '',
    email: partial.email || 'contact@example.com',
    whatsapp: partial.whatsapp || partial.phone || '+8801700000000',
    messengerUrl: partial.messengerUrl || '',
    address: partial.address || '',
    permanentAddress: partial.permanentAddress || '',
    contactLines: partial.contactLines || [],
    websiteUrl: partial.websiteUrl || '',
    themeColor: partial.themeColor || 'amber',
    isPrimaryOwner: false,
    isActive: true,
    isBlocked: false,
    validityType,
    customDays,
    expiryDate,
    ownerPin: partial.ownerPin || '1234',
    ownerUserId,
    ownerPassword: partial.ownerPassword?.trim() || '1234',
    tapCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    socialLinks: partial.socialLinks || [
      { id: `s-${Date.now()}-1`, platform: 'whatsapp', label: 'WhatsApp', url: `https://wa.me/${(partial.whatsapp || '+8801700000000').replace(/[^\d]/g, '')}` },
      { id: `s-${Date.now()}-2`, platform: 'facebook', label: 'Facebook', url: 'https://facebook.com' },
      { id: `s-${Date.now()}-3`, platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com' },
    ],
  };

  profiles.push(newProfile);
  saveProfiles(profiles);
  // Direct instant push to Firebase Firestore in real-time
  syncSingleProfileToFirebase(newProfile).catch(() => {});
  return newProfile;
}

export function deleteProfile(id: string): boolean {
  const profiles = getStoredProfiles();
  const filtered = profiles.filter((p) => p.id !== id || p.isPrimaryOwner); // Prevent deleting primary owner
  if (filtered.length === profiles.length) return false;
  saveProfiles(filtered);
  // Directly delete document from Firebase Firestore
  deleteProfileFromFirebase(id).catch(() => {});
  return true;
}

export function toggleBlockProfile(id: string): boolean {
  const profiles = getStoredProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (!profile || profile.isPrimaryOwner) return false;
  profile.isBlocked = !profile.isBlocked;
  profile.updatedAt = new Date().toISOString();
  saveProfiles(profiles);
  return true;
}

export function renewProfileValidity(
  id: string,
  validityType: UserProfile['validityType'],
  customDays?: number
): boolean {
  const profiles = getStoredProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return false;

  profile.validityType = validityType;
  if (customDays) profile.customDays = customDays;
  profile.expiryDate = computeExpiryDate(validityType || '12_months', customDays);
  profile.updatedAt = new Date().toISOString();
  saveProfiles(profiles);
  return true;
}

export function incrementTapCount(id: string): void {
  const profiles = getStoredProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (profile) {
    profile.tapCount = (profile.tapCount || 0) + 1;
    saveProfiles(profiles);
  }
}

export function getAdminPin(): string {
  return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
}

export function setAdminPin(pin: string): void {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
}

export function getAdminAuth(): AdminAuthCredentials {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return DEFAULT_ADMIN_AUTH;
    return { ...DEFAULT_ADMIN_AUTH, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ADMIN_AUTH;
  }
}

export function saveAdminAuth(auth: AdminAuthCredentials): void {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(auth));
  } catch (err) {
    console.error('Error saving admin credentials:', err);
  }
}

export function verifyAdminAuth(usernameInput: string, passwordInput: string): boolean {
  const current = getAdminAuth();
  return (
    current.username.trim().toLowerCase() === usernameInput.trim().toLowerCase() &&
    current.passwordHash.trim() === passwordInput.trim()
  );
}

export function getFirebaseKeys(): FirebaseKeyConfig[] {
  try {
    const raw = localStorage.getItem(FIREBASE_KEYS_STORAGE);
    if (!raw) return DEFAULT_FIREBASE_KEYS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If Slot 1 was empty from previous session, upgrade to user's real Firebase config
      if (!parsed[0]?.apiKey && DEFAULT_FIREBASE_KEYS[0]?.apiKey) {
        parsed[0] = { ...DEFAULT_FIREBASE_KEYS[0], ...parsed[0], apiKey: DEFAULT_FIREBASE_KEYS[0].apiKey, authDomain: DEFAULT_FIREBASE_KEYS[0].authDomain, projectId: DEFAULT_FIREBASE_KEYS[0].projectId, appId: DEFAULT_FIREBASE_KEYS[0].appId, storageBucket: DEFAULT_FIREBASE_KEYS[0].storageBucket, messagingSenderId: DEFAULT_FIREBASE_KEYS[0].messagingSenderId, measurementId: DEFAULT_FIREBASE_KEYS[0].measurementId };
        localStorage.setItem(FIREBASE_KEYS_STORAGE, JSON.stringify(parsed));
      }
      return parsed;
    }
    return DEFAULT_FIREBASE_KEYS;
  } catch {
    return DEFAULT_FIREBASE_KEYS;
  }
}

export function saveFirebaseKeys(keys: FirebaseKeyConfig[]): void {
  try {
    localStorage.setItem(FIREBASE_KEYS_STORAGE, JSON.stringify(keys));
    saveFirebaseKeysToIndexedDB(keys).catch(() => {});
  } catch (err) {
    console.error('Error saving Firebase keys:', err);
  }
}

export function resetProfileTapCount(id: string): void {
  const profiles = getStoredProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (profile) {
    profile.tapCount = 0;
    saveProfiles(profiles);
  }
}

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    // Directly push to Firebase Firestore in real-time
    syncAdminSettingsToFirebase(settings).catch(() => {});
  } catch (err) {
    console.error('Error saving admin settings:', err);
  }
}

export function getCardNfcWriteUrl(profile: UserProfile): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nfc.aks316.dev';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  // Standard universal NFC tag format:
  return `${origin}${pathname}?nfc=${profile.token}`;
}

/**
 * Validates that a card user ID is globally unique across all profiles.
 * No two cards can share the same user ID.
 */
export function isCardUserIdAvailable(userId: string, excludeProfileId?: string): boolean {
  if (!userId || !userId.trim()) return false;
  const clean = userId.trim().toLowerCase();
  const profiles = getStoredProfiles();
  return !profiles.some((p) => {
    if (excludeProfileId && p.id === excludeProfileId) return false;
    const existingUserId = (p.ownerUserId || p.slug || '').trim().toLowerCase();
    return existingUserId === clean;
  });
}

/**
 * Verifies card owner credentials (unique User ID and Password)
 */
export function verifyCardOwnerCredentials(
  profile: UserProfile,
  userIdInput: string,
  passwordInput: string
): boolean {
  if (!userIdInput || !passwordInput) return false;
  const cleanUser = userIdInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const validUserId = (profile.ownerUserId || profile.slug || profile.token || '').trim().toLowerCase();
  const validPassword = (profile.ownerPassword || profile.ownerPin || '1234').trim();

  if (cleanUser === validUserId && cleanPass === validPassword) {
    return true;
  }

  // Also accept email as identifier
  if (profile.email && cleanUser === profile.email.toLowerCase() && cleanPass === validPassword) {
    return true;
  }

  // Master admin override
  const adminPin = getAdminPin();
  if ((cleanUser === validUserId || cleanUser === 'admin') && (cleanPass === adminPin || cleanPass === 'user123' || cleanPass === '1234')) {
    return true;
  }

  return false;
}
