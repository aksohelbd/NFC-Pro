import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Mail,
  MessageSquare,
  Download,
  Share2,
  ExternalLink,
  MapPin,
  Building2,
  Home,
  Globe,
  QrCode,
  Sparkles,
  Lock,
  Unlock,
  ArrowRight,
  UserCheck,
  Check,
  Info,
  ChevronRight,
  Radio,
  Copy,
  ArrowDownUp,
  Plus,
  Compass,
  Camera,
  ShieldAlert,
  Clock,
  Ban,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { UserProfile, ContactLine } from '../types';
import { downloadVCard, cleanPhoneNumber, getWhatsAppUrl } from '../utils/vcard';
import { getPlatformMeta } from '../utils/socialIcons';
import { SmartCardShareModal } from './SmartCardShareModal';
import { ThemeToggle } from './ThemeToggle';
import {
  incrementTapCount,
  updateProfile,
  getProfileValidityInfo,
  getAdminPin,
  verifyCardOwnerCredentials,
  getAdminSettings,
  getPrimaryOwnerProfile,
} from '../utils/storage';
import { getThemePalette } from '../utils/themeColors';
import { getDataSource, onDataSourceChange, DataSourceType } from '../utils/firebaseRealtime';
import { getCountryFromPhoneNumber } from '../utils/countryFlags';
import { ImageCropperModal } from './ImageCropperModal';
import { CuteWavingMascot } from './CuteWavingMascot';
import { NfcTapTransitionModal } from './NfcTapTransitionModal';

interface NfcCardViewProps {
  profile: UserProfile;
  onNavigateHome?: () => void;
  onOpenClientPortal: (prefilledToken?: string) => void;
  onOpenAdmin?: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  isOwnerView?: boolean;
}

export function NfcCardView({
  profile: initialProfile,
  onNavigateHome,
  onOpenClientPortal,
  onOpenAdmin,
  onUpdateProfile,
  isOwnerView = false,
}: NfcCardViewProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [vCardSaved, setVCardSaved] = useState(false);
  const [showWavePulse, setShowWavePulse] = useState(true);

  // Security & Owner Unlock State (Protected by Unique User ID + Password)
  const [isUnlockedByPin, setIsUnlockedByPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Owner Auth credentials modal (User ID & Password)
  const [showOwnerAuthModal, setShowOwnerAuthModal] = useState(false);
  const [ownerUserIdInput, setOwnerUserIdInput] = useState('');
  const [ownerPasswordInput, setOwnerPasswordInput] = useState('');
  const [ownerAuthError, setOwnerAuthError] = useState('');

  // Validity info
  const validityInfo = getProfileValidityInfo(profile);
  const canEditCard = isOwnerView || isUnlockedByPin;

  // NFC Tap Realistic 3D Mobile Simulation + Animation Phases:
  const [showNfcTapModal, setShowNfcTapModal] = useState(false);
  const [tapAnimationPhase, setTapAnimationPhase] = useState<
    'idle' | 'flying_in' | 'wobbling' | 'mascot_waving' | 'flipping_back'
  >('idle');

  // Photo Crop Modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Global dynamic theme color palette
  const theme = getThemePalette(profile.themeColor);
  const adminSettings = getAdminSettings();
  const primaryOwner = getPrimaryOwnerProfile();
  const websiteLogo = adminSettings.websiteLogoUrl || profile.websiteLogoUrl;
  const websiteName = adminSettings.websiteName || 'NexTech NFC PRO';
  const liveWhatsappNumber = primaryOwner?.whatsapp || primaryOwner?.phone || profile.whatsapp || profile.phone || '+8801700000000';
  const liveEmail = primaryOwner?.email || profile.email || 'aksohelbd316@gmail.com';

  // Realtime Data Source: 'firebase' (green) or 'indexeddb' (orange)
  const [dataSource, setDataSourceState] = useState<DataSourceType>(() => getDataSource());
  const [isInitialSyncing, setIsInitialSyncing] = useState(true);

  useEffect(() => {
    // New device/open handshake: shows green during initial connection sync, then switches to golden/orange for local IndexedDB
    const syncTimer = setTimeout(() => {
      setIsInitialSyncing(false);
    }, 1800);
    return () => clearTimeout(syncTimer);
  }, []);

  // Animation trigger key that fires both on initial page load and on toggle click
  const [orderAnimationKey, setOrderAnimationKey] = useState(1);

  useEffect(() => {
    const unsub = onDataSourceChange((src) => {
      setDataSourceState(src);
    });
    return unsub;
  }, []);

  // Layout order - strictly resets to 'social_first' whenever anyone opens or visits the page
  const [sectionOrder, setSectionOrder] = useState<'social_first' | 'contact_first'>('social_first');

  const triggerTapSequence = () => {
    setShowWavePulse(true);
    setTapAnimationPhase('mascot_waving');
    setOrderAnimationKey((prev) => prev + 1);
    setTimeout(() => {
      setTapAnimationPhase('idle');
      setShowWavePulse(false);
    }, 3200);
  };

  const handleTapSimulationComplete = () => {
    setShowNfcTapModal(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setTapAnimationPhase('mascot_waving');
    setOrderAnimationKey((prev) => prev + 1);
    setTimeout(() => {
      setTapAnimationPhase('idle');
      setShowWavePulse(false);
    }, 3200);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    incrementTapCount(profile.id);
    // Reset section order back to default 1. Social First, 2. Contact First
    setSectionOrder('social_first');
    setOrderAnimationKey((prev) => prev + 1);
    
    // Auto-trigger realistic 3D NFC Tap transition on open if not already played for this profile in this session
    const sessionKey = `nfc_tap_played_${profile.id}`;
    const alreadyPlayed = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;
    if (!alreadyPlayed) {
      setShowNfcTapModal(true);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(sessionKey, 'true');
      }
    }

    // On open: immediately trigger cute cartoon mascot waving "Hi! 👋"
    // and simultaneously animate Direct Social Media pop and Direct Contact Lines bounce
    setTapAnimationPhase('mascot_waving');
    setShowWavePulse(true);
    const timer = setTimeout(() => {
      setTapAnimationPhase('idle');
      setShowWavePulse(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [profile.id]);

  const toggleSectionOrder = () => {
    // In-session toggle without persisting so next open/visitor always gets the reset default
    setSectionOrder((prev) => (prev === 'social_first' ? 'contact_first' : 'social_first'));
    setOrderAnimationKey((prev) => prev + 1);
    // Trigger cartoon mascot wave "Hi!" simultaneously when changing order
    setTapAnimationPhase('mascot_waving');
    setShowWavePulse(true);
    setTimeout(() => {
      setTapAnimationPhase('idle');
      setShowWavePulse(false);
    }, 3000);
  };

  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/nfc/${profile.slug || profile.token}`
    : `https://nfc.cards/nfc/${profile.token}`;

  const handleSaveContact = () => {
    downloadVCard(profile);
    setVCardSaved(true);
    setTimeout(() => setVCardSaved(false), 3000);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    const field = cropType === 'avatar' ? 'avatarUrl' : 'coverUrl';
    const updated: UserProfile = {
      ...profile,
      [field]: croppedDataUrl,
    };
    setProfile(updated);
    updateProfile(updated);
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPhoneId(id);
      setTimeout(() => setCopiedPhoneId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPin = getAdminPin();
    const ownerPin = profile.ownerPin || '1234';
    if (pinInput.trim() === ownerPin || pinInput.trim() === adminPin) {
      setIsUnlockedByPin(true);
      setShowPinModal(false);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect Security PIN. Public visitors cannot edit this card.');
    }
  };

  const handleOwnerAuthLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = verifyCardOwnerCredentials(profile, ownerUserIdInput, ownerPasswordInput);
    if (ok) {
      setIsUnlockedByPin(true);
      setShowOwnerAuthModal(false);
      setOwnerAuthError('');
      setOwnerUserIdInput('');
      setOwnerPasswordInput('');
      if (onOpenClientPortal) {
        onOpenClientPortal(profile.token);
      }
    } else {
      setOwnerAuthError('Invalid User ID or Password. Please contact administrator.');
    }
  };

  // Compile all contact lines
  const allContactLines: ContactLine[] = [];
  if (profile.phone) {
    allContactLines.push({
      id: 'primary-phone',
      type: 'mobile',
      label: 'Mobile / Personal Hotline',
      value: profile.phone,
    });
  }
  if (profile.phoneSecondary) {
    allContactLines.push({
      id: 'secondary-phone',
      type: 'work',
      label: 'Secondary / Work Phone',
      value: profile.phoneSecondary,
    });
  }
  if (profile.telephone) {
    allContactLines.push({
      id: 'telephone-line',
      type: 'telephone',
      label: 'Office Telephone / Landline',
      value: profile.telephone,
    });
  }
  if (profile.contactLines && profile.contactLines.length > 0) {
    profile.contactLines.forEach((cl) => {
      if (!allContactLines.some((x) => x.value === cl.value && x.label === cl.label)) {
        allContactLines.push(cl);
      }
    });
  }

  // Render Social Links block (HORIZONTALLY CENTERED, GLOW LIGHT IN THEME COLOR, POP ANIMATION)
  const renderSocialLinksBlock = () => (
    <motion.div
      layout
      key={`social-links-section-${orderAnimationKey}`}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        borderColor: `${theme.primaryHex}44`,
        boxShadow: `0 0 25px ${theme.glowRgba(0.12)}`,
      }}
      className="mb-5 p-4 rounded-2xl bg-neutral-100/95 dark:bg-neutral-950/90 border relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.glowRgba(0.2)}, transparent 70%)`,
        }}
      />

      <div className="flex items-center justify-between mb-3 px-1 relative z-10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primaryHex }} />
          <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300">
            {sectionOrder === 'social_first' ? '1. DIRECT SOCIAL MEDIA' : '2. DIRECT SOCIAL MEDIA'}
          </span>
        </div>
        <span
          className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border"
          style={{
            color: theme.primaryHex,
            backgroundColor: `${theme.primaryHex}15`,
            borderColor: `${theme.primaryHex}35`,
          }}
        >
          {profile.socialLinks.length} Active
        </span>
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 py-2 z-10">
        {profile.socialLinks.map((link, idx) => {
          const meta = getPlatformMeta(link.platform);
          return (
            <motion.a
              key={link.id || `social-${idx}-${orderAnimationKey}`}
              id={`nfc-social-${link.platform}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{
                opacity: 1,
                scale: [0, 1.32, 0.9, 1.08, 1],
                y: 0,
              }}
              transition={{
                duration: 0.55,
                delay: idx * 0.05,
                times: [0, 0.45, 0.65, 0.85, 1],
                ease: 'easeOut',
              }}
              className="group/icon relative flex flex-col items-center justify-center cursor-pointer select-none"
              title={`Connect on ${meta.name} (${link.platform})`}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 10px ${theme.glowRgba(0.35)}`,
                    `0 0 28px ${theme.glowRgba(0.85)}`,
                    `0 0 10px ${theme.glowRgba(0.35)}`,
                  ],
                  borderColor: [
                    theme.glowRgba(0.45),
                    theme.primaryHex,
                    theme.glowRgba(0.45),
                  ],
                }}
                transition={{
                  duration: 2.2 + (idx % 3) * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: idx * 0.2,
                }}
                whileHover={{ scale: 1.18, rotate: [0, -6, 6, 0] }}
                whileTap={{ scale: 0.92 }}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900 dark:bg-black border-2 flex items-center justify-center text-white transition-transform relative z-10"
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-70 group-hover/icon:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(to top right, ${theme.glowRgba(0.25)}, transparent, ${theme.glowRgba(0.25)})`,
                  }}
                />
                <div
                  className="w-6 h-6 flex items-center justify-center group-hover/icon:scale-110 transition-transform relative z-10"
                  style={{ color: theme.primaryHex }}
                >
                  {meta.icon('w-6 h-6')}
                </div>
              </motion.div>
              <span
                className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 transition-colors group-hover/icon:opacity-100"
              >
                {meta.name}
              </span>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );

  // Render Contact Lines block (CANVA STOMP FOR 1ST ITEM + BASELINE SLIDE-DOWN FOR REST)
  const renderContactLinesBlock = () => {
    const contactSequenceItems = [
      ...allContactLines.map((cl, i) => ({
        type: 'phone_line' as const,
        line: cl,
        index: i,
      })),
      ...(profile.whatsapp
        ? [
            {
              type: 'whatsapp' as const,
              index: allContactLines.length,
            },
          ]
        : []),
      ...(profile.email
        ? [
            {
              type: 'email' as const,
              index: allContactLines.length + (profile.whatsapp ? 1 : 0),
            },
          ]
        : []),
    ];

    return (
      <motion.div
        layout
        key={`contact-lines-section-${orderAnimationKey}`}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-2.5 mb-5"
      >
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: theme.primaryHex }}
            />
            <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300">
              {sectionOrder === 'social_first' ? '2. DIRECT CONTACT LINES' : '1. DIRECT CONTACT LINES'}
            </span>
          </div>
          <span
            className="text-[10px] font-mono font-semibold"
            style={{ color: theme.primaryHex }}
          >
            {contactSequenceItems.length} Lines Available
          </span>
        </div>

        {contactSequenceItems.map((item, overallIdx) => {
          const isFirstItem = overallIdx === 0;

          const stompAnimationProps = {
            initial: {
              opacity: 0,
              scale: 2.1,
              y: -50,
            },
            animate: {
              opacity: 1,
              scale: [2.1, 0.94, 1.04, 1],
              y: [-50, 4, -2, 0],
            },
            transition: {
              duration: 0.65,
              times: [0, 0.6, 0.85, 1],
              ease: 'easeOut' as const,
            },
          };

          const baselineAnimationProps = {
            initial: {
              opacity: 0,
              y: -32,
              scale: 0.95,
            },
            animate: {
              opacity: 1,
              y: 0,
              scale: 1,
            },
            transition: {
              duration: 0.5,
              delay: 0.45 + overallIdx * 0.12,
              ease: 'easeOut' as const,
            },
          };

          const animationProps = isFirstItem ? stompAnimationProps : baselineAnimationProps;

          if (item.type === 'phone_line') {
            const line = item.line;
            const isEmailLine = line.type === 'email';
            const isEmergencyLine = line.type === 'emergency';
            const countryInfo = !isEmailLine ? getCountryFromPhoneNumber(line.value) : null;

            return (
              <motion.div
                key={line.id || `line-${line.value}`}
                {...animationProps}
                style={
                  isEmergencyLine
                    ? {
                        borderColor: 'rgba(239, 68, 68, 0.6)',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                      }
                    : isFirstItem
                    ? {
                        borderColor: `${theme.primaryHex}aa`,
                        boxShadow: `0 0 20px ${theme.glowRgba(0.25)}`,
                      }
                    : undefined
                }
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 shadow-xs hover:shadow-md ${
                  isEmergencyLine
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60'
                    : 'bg-neutral-100/90 dark:bg-neutral-950/90 border-neutral-200 dark:border-neutral-800/90'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    style={
                      isEmergencyLine
                        ? {
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            borderColor: '#ef4444',
                          }
                        : isFirstItem
                        ? {
                            backgroundColor: theme.primaryHex,
                            color: '#0a0a0a',
                            borderColor: theme.primaryHex,
                          }
                        : {
                            color: isEmailLine ? '#38bdf8' : theme.primaryHex,
                          }
                    }
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isFirstItem || isEmergencyLine
                        ? 'font-bold'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {isEmailLine ? (
                      <Mail className="w-4 h-4" />
                    ) : isEmergencyLine ? (
                      <ShieldAlert className="w-4 h-4 text-white" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block truncate">
                        {line.label || (isEmailLine ? 'Email' : isEmergencyLine ? 'Emergency SOS' : 'Direct Phone')}
                      </span>
                      {countryInfo && countryInfo.flag && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                          <span>{countryInfo.flag}</span>
                          <span>{countryInfo.name}</span>
                        </span>
                      )}
                      {isEmergencyLine ? (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm bg-rose-500 text-white">
                          SOS
                        </span>
                      ) : isFirstItem ? (
                        <span
                          style={{
                            backgroundColor: theme.primaryHex,
                            color: '#0a0a0a',
                          }}
                          className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm"
                        >
                          Primary
                        </span>
                      ) : null}
                    </div>
                    {isEmailLine ? (
                      <a
                        href={`mailto:${line.value}`}
                        className="text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:text-sky-500 transition-colors truncate block"
                      >
                        {line.value}
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <a
                          href={`tel:${cleanPhoneNumber(line.value)}`}
                          className="text-sm font-bold text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity truncate block"
                        >
                          {line.value}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(line.value, line.id || line.value)}
                    className="p-2 rounded-xl bg-neutral-200/80 dark:bg-neutral-850 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                    title={isEmailLine ? 'Copy Email Address' : 'Copy Phone Number'}
                  >
                    {copiedPhoneId === (line.id || line.value) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isEmailLine ? (
                    <a
                      href={`mailto:${line.value}`}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Mail</span>
                    </a>
                  ) : isEmergencyLine ? (
                    <a
                      href={`tel:${cleanPhoneNumber(line.value)}`}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>SOS</span>
                    </a>
                  ) : (
                    <a
                      href={`tel:${cleanPhoneNumber(line.value)}`}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          }

          if (item.type === 'whatsapp') {
            return (
              <motion.div
                key="whatsapp"
                {...animationProps}
              >
                <a
                  id="nfc-contact-whatsapp-item"
                  href={getWhatsAppUrl(profile.whatsapp || profile.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500 transition-all group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-all shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                          Official WhatsApp Chat
                        </span>
                        {(() => {
                          const waCountry = getCountryFromPhoneNumber(profile.whatsapp || profile.phone);
                          return waCountry.flag ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                              <span>{waCountry.flag}</span>
                              <span>{waCountry.name}</span>
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>{profile.whatsapp || profile.phone}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                      Chat Live
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              </motion.div>
            );
          }

          if (item.type === 'email') {
            return (
              <motion.div
                key="email"
                {...animationProps}
              >
                <a
                  id="nfc-contact-email-item"
                  href={`mailto:${profile.email}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-neutral-100/90 dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800/90 hover:border-sky-500/60 transition-all group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-sky-500 group-hover:scale-105 transition-all shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate max-w-[190px] sm:max-w-[240px]">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 block">
                        Official Email
                      </span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors truncate block">
                        {profile.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hidden sm:inline">
                      Send Mail
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              </motion.div>
            );
          }

          return null;
        })}
      </motion.div>
    );
  };

  // CHECK: If card is Blocked or Expired, render designated lock view
  if (!validityInfo.canAccess && !isOwnerView && !isUnlockedByPin) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
            {validityInfo.isBlocked ? <Ban className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>

          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            {validityInfo.isBlocked ? 'NFC Card Suspended' : 'Card Validity Expired'}
          </h3>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
            {validityInfo.isBlocked
              ? 'This NFC card has been temporarily locked by the administrator.'
              : 'The subscription validity period for this NFC card has ended (0 Days Remaining).'}
          </p>

          <div className="mt-4 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-600 dark:text-neutral-300">
            Card Tag ID: <strong>{profile.token}</strong>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => setShowOwnerAuthModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-lg"
            >
              Card Owner Login (User ID & Password)
            </button>
          </div>
        </div>

        {/* Modal for Owner Unlock */}
        {showOwnerAuthModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">
                Card Owner Login
              </h4>
              <form onSubmit={handleOwnerAuthLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter User ID"
                    value={ownerUserIdInput}
                    onChange={(e) => setOwnerUserIdInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={ownerPasswordInput}
                    onChange={(e) => setOwnerPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white"
                    required
                  />
                </div>
                {ownerAuthError && <p className="text-rose-500 text-xs">{ownerAuthError}</p>}
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOwnerAuthModal(false);
                      setOwnerAuthError('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pt-[max(1rem,env(safe-area-inset-top))] pb-16 px-3 sm:px-4 flex flex-col items-center justify-start gap-3 transition-colors relative overflow-x-hidden">
      {/* Background subtle gold geometric dots */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Realistic 3D Mobile Phone NFC Tap Simulation (Realistic chime + Haptic feedback) */}
      <NfcTapTransitionModal
        isOpen={showNfcTapModal}
        profile={profile}
        onComplete={handleTapSimulationComplete}
        onCancel={() => setShowNfcTapModal(false)}
      />

      {/* Top Bar: Replay animation + Theme Switcher + Full Portfolio (ONLY FOR OWNER) */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between mb-4 px-2 z-20">
        <button
          onClick={triggerTapSequence}
          className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Tap to replay NFC Welcome & Mascot wave animation"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Tap 1 NFC Active</span>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* 
            Strict Privacy Rule: Client cards do NOT have Full Portfolio button!
            Only primary owner view on main website has it.
          */}
          {isOwnerView && onNavigateHome && (
            <button
              id="nfc-view-portfolio-btn"
              onClick={onNavigateHome}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-red-500 border border-neutral-300 dark:border-red-500/60 hover:bg-neutral-300 dark:hover:bg-red-950/40 dark:shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="View Full Portfolio"
            >
              <span className="border-b-2 border-transparent dark:border-red-500 pb-0.5">Full Portfolio</span>
              <span className="text-neutral-600 dark:text-red-400 font-bold">→</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Luxury Matte Black Phone / Card Container */}
      <div className="relative w-full max-w-md mx-auto z-10 flex flex-col items-center mb-6">
        {/* WAVE PULSE RIPPLE */}
        <AnimatePresence>
          {showWavePulse && (
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <motion.div
                initial={{ scale: 0.2, opacity: 0.95 }}
                animate={{ scale: [0.2, 2.0, 3.8], opacity: [0.95, 0.4, 0] }}
                transition={{ duration: 1.8, repeat: 2, ease: 'easeOut' }}
                style={{
                  borderColor: theme.primaryHex,
                  boxShadow: `0 0 35px ${theme.glowRgba(0.7)}`,
                }}
                className="w-36 h-36 rounded-full border-2"
              />
              <motion.div
                initial={{ scale: 0.2, opacity: 0.85 }}
                animate={{ scale: [0.2, 2.4, 4.4], opacity: [0.85, 0.3, 0] }}
                transition={{ duration: 1.8, delay: 0.35, repeat: 2, ease: 'easeOut' }}
                style={{
                  borderColor: theme.primaryHex,
                  boxShadow: `0 0 25px ${theme.glowRgba(0.5)}`,
                }}
                className="absolute inset-0 w-36 h-36 rounded-full border"
              />
            </div>
          )}
        </AnimatePresence>

        {/* Outer Frame with Dynamic Theme Framing */}
        <motion.div
          id="nfc-card-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            borderColor: `${theme.primaryHex}55`,
          }}
          className="w-full bg-white dark:bg-neutral-900/95 border-2 rounded-[38px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative backdrop-blur-md"
        >
          {/* Top Dynamic Island Notch */}
          <div className="w-full pt-3 pb-1 flex justify-center bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
            <div className="w-24 h-5 rounded-full bg-neutral-800 dark:bg-black border border-neutral-700 dark:border-neutral-800 flex items-center justify-between px-2">
              <span className="w-2 h-2 rounded-full bg-neutral-700 dark:bg-neutral-800" />
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.primaryHex }} />
            </div>
          </div>

          {/* Cover image banner with Protected Direct Crop Button */}
          <div
            className="h-32 sm:h-36 w-full relative bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-950 overflow-hidden border-b group"
            style={{ borderColor: `${theme.primaryHex}30` }}
          >
            {profile.coverUrl ? (
              <img
                src={profile.coverUrl}
                alt="Profile Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(to top right, #171717, #262626, ${theme.glowRgba(0.35)})`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Direct Crop Cover Button: ONLY VISIBLE TO AUTHENTICATED OWNER */}
            {canEditCard && (
              <button
                type="button"
                onClick={() => {
                  setCropType('cover');
                  setCropperOpen(true);
                }}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md z-10 border"
                style={{
                  borderColor: `${theme.primaryHex}50`,
                  color: theme.primaryHex,
                }}
                title="Upload & Crop Background Cover"
              >
                <Camera className="w-3 h-3" />
                <span>Edit Cover</span>
              </button>
            )}

            {/* Verification Badge */}
            <div
              className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs border text-[10px] font-semibold"
              style={{
                borderColor: `${theme.primaryHex}40`,
                color: theme.primaryHex,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified NFC Profile</span>
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-5 pb-6 pt-0 relative">
            {/* Avatar with Radiant Glowing Ring in Theme Color */}
            <div className="flex justify-between items-end -mt-14 mb-3">
              <div className="relative">
                <div
                  className="absolute -inset-1 rounded-2xl opacity-85 blur-xs animate-pulse"
                  style={{
                    background: `linear-gradient(to top right, ${theme.primaryHex}, #ffffff, ${theme.primaryHex})`,
                  }}
                />

                <motion.div
                  onClick={triggerTapSequence}
                  animate={
                    tapAnimationPhase === 'wobbling'
                      ? {
                          rotate: [0, 18, -18, 14, -14, 8, -8, 0],
                          scale: [1, 1.08, 0.98, 1.06, 1],
                        }
                      : tapAnimationPhase === 'mascot_waving'
                      ? {
                          scale: [1, 1.04, 1],
                        }
                      : {}
                  }
                  transition={
                    tapAnimationPhase === 'wobbling'
                      ? { duration: 0.95, ease: 'easeInOut' }
                      : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    borderColor: `${theme.primaryHex}90`,
                  }}
                  className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-2xl p-1 bg-white dark:bg-neutral-900 shadow-xl border-2 overflow-hidden cursor-pointer group"
                  title="Tap to trigger NFC wave and cute mascot Hi animation"
                >
                  <AnimatePresence mode="wait">
                    {tapAnimationPhase === 'mascot_waving' ? (
                      <motion.div
                        key="mascot-wave"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="w-full h-full"
                      >
                        <CuteWavingMascot name={profile.fullName} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="avatar-photo"
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="w-full h-full rounded-xl overflow-hidden relative"
                      >
                        <img
                          src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                          alt={profile.fullName}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Direct Crop Avatar Camera Button: ONLY VISIBLE TO AUTHENTICATED OWNER */}
                {canEditCard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCropType('avatar');
                      setCropperOpen(true);
                    }}
                    style={{ backgroundColor: theme.primaryHex }}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full text-neutral-950 shadow-md border-2 border-white dark:border-neutral-900 cursor-pointer active:scale-90 transition-transform z-20"
                    title="Upload & Crop Avatar Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* NFC Chip Indicator and Meta */}
              <div className="flex flex-col items-end gap-1 text-right pt-7 sm:pt-8">
                <button
                  type="button"
                  onClick={triggerTapSequence}
                  style={{
                    backgroundColor: `${theme.primaryHex}15`,
                    borderColor: `${theme.primaryHex}40`,
                    color: theme.primaryHex,
                  }}
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-inner transition-colors cursor-pointer group mb-0.5"
                  title="Contactless NFC Chip - Tap to simulate"
                >
                  <Radio className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                
                <span
                  className="text-[10px] font-mono font-black uppercase tracking-wider"
                  style={{ color: theme.primaryHex }}
                >
                  NFC ENABLED
                </span>

                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${theme.primaryHex}15`,
                    borderColor: `${theme.primaryHex}30`,
                    color: theme.primaryHex,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Lifetime Access</span>
                </span>

                {/* ID with Realtime Source Indicator: Green while connecting/cloud, Golden/Orange while running local IndexedDB */}
                <div
                  id="data-source-id-badge"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold transition-all shadow-xs"
                  style={{
                    backgroundColor:
                      isInitialSyncing || dataSource === 'firebase'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : 'rgba(245, 158, 11, 0.12)',
                    borderColor:
                      isInitialSyncing || dataSource === 'firebase'
                        ? 'rgba(16, 185, 129, 0.45)'
                        : 'rgba(245, 158, 11, 0.45)',
                    color:
                      isInitialSyncing || dataSource === 'firebase' ? '#10b981' : '#f59e0b',
                  }}
                  title={
                    isInitialSyncing
                      ? 'Syncing with live network...'
                      : dataSource === 'firebase'
                      ? 'Live Cloud Connected: Realtime data loaded from Firebase Firestore'
                      : 'Local Storage Safe: Running from browser IndexedDB database'
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isInitialSyncing || dataSource === 'firebase'
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>ID: {profile.slug || profile.token}</span>
                </div>
              </div>
            </div>

            {/* Profile Header Details */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {profile.fullName}
                </h2>
              </div>

              {profile.company && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryHex }} />
                  <span>{profile.company}</span>
                </div>
              )}

              {profile.designation && (
                <div className="text-xs font-bold" style={{ color: theme.primaryHex }}>
                  {profile.designation}
                </div>
              )}

              {profile.headline && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-0.5">
                  {profile.headline}
                </p>
              )}

              {/* Dual Address: Present / Work Address + Permanent / Home Address */}
              {profile.address && (
                <div className="flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: theme.primaryHex }} />
                  <div className="leading-snug">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">Present / Work: </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {profile.address}
                    </a>
                  </div>
                </div>
              )}

              {profile.permanentAddress && (
                <div className="flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-0.5">
                  <Home className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                  <div className="leading-snug">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">Permanent / Home: </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.permanentAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {profile.permanentAddress}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* DUAL PRIMARY ACTION BUTTONS: SAVE CONTACT + SHARE & EXPORT */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {/* 1. SAVE CONTACT */}
              <button
                id="nfc-save-contact-btn"
                onClick={handleSaveContact}
                style={{
                  backgroundColor: theme.primaryHex,
                  color: '#0a0a0a',
                  boxShadow: `0 0 20px ${theme.glowRgba(0.5)}`,
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-full font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                {vCardSaved ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Saved to Phone!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-neutral-950" />
                    <span>SAVE CONTACT</span>
                  </>
                )}
              </button>

              {/* 2. SHARE & EXPORT (PDF / JPG / NFC) */}
              <button
                id="nfc-share-info-btn"
                onClick={() => setShowShareModal(true)}
                style={{
                  borderColor: `${theme.primaryHex}90`,
                  color: theme.primaryHex,
                  boxShadow: `0 0 15px ${theme.glowRgba(0.3)}`,
                }}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-850 border-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE / PDF CARD</span>
              </button>
            </div>

            {/* POSITION TOGGLE: Switch Direct Social Links <-> Contact Lines */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={toggleSectionOrder}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 hover:opacity-100 transition-opacity cursor-pointer py-1 px-2 rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800"
                title="Click to toggle order between Social First and Contact First"
              >
                <ArrowDownUp className="w-3 h-3" style={{ color: theme.primaryHex }} />
                <span>
                  Order:{' '}
                  {sectionOrder === 'social_first'
                    ? 'Social First ⇄ Contact First'
                    : 'Contact First ⇄ Social First'}
                </span>
              </button>
            </div>

            {/* SECTIONS IN DYNAMIC REVERSIBLE ORDER */}
            <AnimatePresence mode="wait">
              {sectionOrder === 'social_first' ? (
                <motion.div
                  key={`order-social-first-${orderAnimationKey}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSocialLinksBlock()}
                  {renderContactLinesBlock()}
                </motion.div>
              ) : (
                <motion.div
                  key={`order-contact-first-${orderAnimationKey}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContactLinesBlock()}
                  {renderSocialLinksBlock()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* About / Bio note */}
            {profile.bio && (
              <div className="p-4 rounded-2xl bg-neutral-100/90 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800/80 mb-5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  About / Bio
                </h3>
                <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Official Website Button */}
            {profile.websiteUrl && (
              <a
                id="nfc-official-website-btn"
                href={profile.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-800 font-semibold text-xs shadow-xs transition-colors mb-4"
              >
                <Globe className="w-4 h-4" style={{ color: theme.primaryHex }} />
                <span>Visit Official Website</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </a>
            )}

            {/* Website Branding & Live Contact Footer Box (Requested by User) */}
            <div className="mt-2 p-3.5 rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
              {/* Row 1: Website Logo + Name & Edit Links button */}
              <div className="flex items-center justify-between gap-3 border-b border-neutral-200/70 dark:border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {websiteLogo ? (
                    <img
                      src={websiteLogo}
                      alt={websiteName}
                      className="w-8 h-8 rounded-xl object-cover border border-amber-500/30 shadow-xs shrink-0 bg-white dark:bg-neutral-950 p-0.5"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${theme.primaryHex}20`,
                        color: theme.primaryHex,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 block truncate">
                      {websiteName}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                      Verified Contactless NFC Smart Card
                    </span>
                  </div>
                </div>

                {/* Edit Links (Protected by User ID & Password) */}
                <button
                  type="button"
                  id="nfc-discreet-edit-links-btn"
                  onClick={() => {
                    setOwnerAuthError('');
                    setShowOwnerAuthModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-neutral-200 dark:border-neutral-700 active:scale-95"
                  title="Card Owner Login to Edit Links"
                >
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Edit Links</span>
                </button>
              </div>

              {/* Row 2: Live Contact buttons (WhatsApp & Email) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>Live Contact:</span>
                </span>
                <div className="flex items-center gap-2">
                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${cleanPhoneNumber(liveWhatsappNumber)}?text=${encodeURIComponent('Hello AK Sohel, I am contacting you from the NFC Smart Card website.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Live Chat on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Email Button */}
                  <a
                    href={`mailto:${liveEmail}?subject=${encodeURIComponent('NFC Smart Card Live Inquiry')}`}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-400 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card Owner Authentication Modal (Protected by Unique User ID & Password) */}
      {showOwnerAuthModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: `${theme.primaryHex}20`,
                  color: theme.primaryHex,
                }}
              >
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Card Owner Authentication
                </h4>
                <p className="text-[11px] text-neutral-500">Enter your User ID and Password to edit card</p>
              </div>
            </div>

            <form onSubmit={handleOwnerAuthLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={ownerUserIdInput}
                  onChange={(e) => setOwnerUserIdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={ownerPasswordInput}
                  onChange={(e) => setOwnerPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white"
                  required
                />
              </div>

              {ownerAuthError && (
                <p className="text-rose-500 text-xs font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  {ownerAuthError}
                </p>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOwnerAuthModal(false);
                    setOwnerAuthError('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: theme.primaryHex,
                    color: '#0a0a0a',
                  }}
                  className="px-4 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-md"
                >
                  Verify & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Interactive Smart Card Share Modal with Clickable PDF & JPG Export */}
      <SmartCardShareModal
        profile={profile}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cardUrl={cardUrl}
      />

      {/* Interactive Image Cropper Modal for Avatar and Cover */}
      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        cropType={cropType}
        initialImageSrc={cropType === 'avatar' ? profile.avatarUrl : profile.coverUrl}
        title={cropType === 'avatar' ? 'Upload & Crop Profile Picture' : 'Upload & Crop Background Cover'}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
