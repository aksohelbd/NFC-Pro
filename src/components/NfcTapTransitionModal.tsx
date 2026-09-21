import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Sparkles, Check, Zap, X } from 'lucide-react';
import { UserProfile } from '../types';
import { nfcFeedback } from '../utils/nfcFeedback';
import { getThemePalette } from '../utils/themeColors';
import { getAdminSettings } from '../utils/storage';

interface NfcTapTransitionModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onComplete: () => void;
  onCancel?: () => void;
}

type AnimationStage =
  | 'approaching' // Card descends toward phone
  | 'tapped'      // 1 contact tap + sound + shockwave
  | 'expanding'   // Mobile expands to full screen
  | 'avatar_focus'// Profile picture emerges large in front
  | 'avatar_dock' // Profile picture animates into card position
  | 'done';

export function NfcTapTransitionModal({
  isOpen,
  profile,
  onComplete,
  onCancel,
}: NfcTapTransitionModalProps) {
  const [stage, setStage] = useState<AnimationStage>('approaching');
  const theme = getThemePalette(profile.themeColor);
  const adminSettings = getAdminSettings();
  const websiteLogo = adminSettings.websiteLogoUrl || profile.websiteLogoUrl;

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasStartedRef.current = false;
      setStage('approaching');
      return;
    }

    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    setStage('approaching');

    // Stage 1: Card taps phone at 450ms (Exact 1 tap + sound)
    const t1 = setTimeout(() => {
      setStage('tapped');
      nfcFeedback.triggerNfcTapFeedback();
    }, 450);

    // Stage 2: Mobile expands to full screen at 950ms
    const t2 = setTimeout(() => {
      setStage('expanding');
    }, 950);

    // Stage 3: Profile picture emerges large in front at 1350ms
    const t3 = setTimeout(() => {
      setStage('avatar_focus');
    }, 1350);

    // Stage 4: Profile picture glides into card location at 2050ms
    const t4 = setTimeout(() => {
      setStage('avatar_dock');
    }, 2050);

    // Stage 5: Complete animation and reveal full screen NFC card at 2650ms (Exact 1 time)
    const t5 = setTimeout(() => {
      setStage('done');
      onCompleteRef.current?.();
    }, 2650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="nfc-tap-simulation-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg overflow-hidden select-none"
      >
        {/* Ambient theme-colored glow backdrop */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-700"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${theme.glowRgba(0.25)}, transparent 70%)`,
          }}
        />

        {/* Skip button in top right */}
        <button
          onClick={onCancel || onComplete}
          className="absolute top-5 right-5 z-50 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-neutral-900/90 text-neutral-200 border border-neutral-700 hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
          title="Skip intro animation"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Cinematic Stage Area */}
        <div className="relative w-full max-w-md flex flex-col items-center justify-center min-h-[600px] px-4 [perspective:1200px]">
          
          {/* ================= 1. PHYSICAL SMART CARD - 1 SINGLE TAP ================= */}
          <AnimatePresence>
            {stage === 'approaching' || stage === 'tapped' ? (
              <motion.div
                key="nfc-smart-card"
                initial={{ y: -280, rotateZ: -14, scale: 0.88, opacity: 0 }}
                animate={
                  stage === 'approaching'
                    ? { y: -45, rotateZ: -2, scale: 1, opacity: 1 }
                    : { y: -38, rotateZ: 0, scale: 1.03, opacity: 1 }
                }
                exit={{ y: -160, opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                transition={{
                  duration: stage === 'approaching' ? 0.45 : 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  willChange: 'transform, opacity',
                  borderColor: theme.primaryHex,
                  boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 25px ${theme.glowRgba(0.4)}`,
                }}
                className="absolute top-10 z-30 w-64 h-38 rounded-2xl bg-gradient-to-br from-neutral-850 via-neutral-900 to-black border-2 p-4 text-white pointer-events-none"
              >
                {/* Card Chip & Brand */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-7 rounded-md border flex items-center justify-center shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryHex}, #fef08a, ${theme.primaryHex})`,
                      borderColor: theme.primaryHex,
                    }}
                  >
                    <div className="w-5 h-4 border border-black/30 rounded-xs" />
                  </div>
                  {websiteLogo ? (
                    <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-lg border border-white/10 shadow-xs">
                      <img
                        src={websiteLogo}
                        alt="Website Logo"
                        className="h-5 max-h-5 max-w-[85px] object-contain rounded-xs"
                      />
                      <CreditCard className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryHex }} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-semibold" style={{ color: theme.primaryHex }}>
                      <span className="text-[10px] font-mono tracking-wider font-bold">
                        {adminSettings.websiteName || 'NFC SMART'}
                      </span>
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Profile Avatar & Info on physical card */}
                <div className="mt-3.5 flex items-center gap-2.5">
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                    alt={profile.fullName}
                    className="w-10 h-10 rounded-xl object-cover border shadow-md"
                    style={{ borderColor: theme.primaryHex }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate max-w-[130px]">
                      {profile.fullName}
                    </h4>
                    <p className="text-[9px] font-mono truncate" style={{ color: theme.primaryHex }}>
                      ID: {profile.slug || profile.token}
                    </p>
                    <p className="text-[8px] text-neutral-400 truncate">
                      {profile.company || 'Verified Smart Card'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ================= 2. TAP CONTACT SHOCKWAVE ================= */}
          <AnimatePresence>
            {stage === 'tapped' && (
              <div className="absolute top-[140px] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <motion.div
                  initial={{ scale: 0.2, opacity: 0.95 }}
                  animate={{
                    scale: 3.5,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  style={{
                    borderColor: theme.primaryHex,
                    boxShadow: `0 0 35px ${theme.glowRgba(0.9)}`,
                  }}
                  className="w-32 h-32 rounded-full border-2"
                />
              </div>
            )}
          </AnimatePresence>

          {/* ================= 3. MOBILE PHONE EXPANDS TO FULL SCREEN ================= */}
          <motion.div
            initial={{ y: 25, scale: 0.98, opacity: 0.95 }}
            animate={
              stage === 'approaching' || stage === 'tapped'
                ? { y: 25, scale: 1, opacity: 1 }
                : stage === 'expanding'
                ? { y: 0, scale: 1.85, opacity: 0.85 }
                : { y: 0, scale: 3.4, opacity: 0.15 } // Expands and transitions into full screen
            }
            transition={{
              duration: stage === 'expanding' ? 0.7 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-10 w-[275px] sm:w-[290px] h-[460px] rounded-[42px] p-2 bg-neutral-850 border-4 border-neutral-700 shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col pointer-events-none"
          >
            {/* Inner Phone Display Screen */}
            <div className="relative w-full h-full rounded-[34px] bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-between p-4 overflow-hidden">
              {/* Dynamic Island Notch */}
              <div className="w-full pt-1 flex justify-center">
                <motion.div
                  animate={{
                    width: stage === 'tapped' ? 220 : 85,
                    height: stage === 'tapped' ? 34 : 22,
                    borderColor: stage === 'tapped' ? theme.primaryHex : 'rgba(255,255,255,0.1)',
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="rounded-full bg-black border flex items-center justify-center px-3 shadow-lg overflow-hidden"
                >
                  {stage === 'tapped' ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold w-full justify-between" style={{ color: theme.primaryHex }}>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>NFC Card Detected</span>
                      </div>
                      <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                    </div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  )}
                </motion.div>
              </div>

              {/* Center Screen inside phone */}
              <div className="my-auto text-center space-y-2 opacity-80">
                {websiteLogo && (
                  <div className="flex justify-center mb-1">
                    <img
                      src={websiteLogo}
                      alt="Website Logo"
                      className="h-5 max-w-[85px] object-contain rounded-xs bg-white/10 p-0.5"
                    />
                  </div>
                )}
                <div
                  className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 shadow-md"
                  style={{ borderColor: theme.primaryHex }}
                >
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xs text-white truncate max-w-[180px] mx-auto">
                  {profile.fullName}
                </h3>
              </div>

              {/* Bottom Home bar */}
              <div className="w-20 h-1 rounded-full bg-neutral-700 mb-1" />
            </div>
          </motion.div>

          {/* ================= 4. PROFILE PICTURE EMERGES LARGE & FLIES TO POSITION ================= */}
          <AnimatePresence>
            {stage === 'avatar_focus' || stage === 'avatar_dock' ? (
              <motion.div
                key="spotlight-avatar"
                initial={{ scale: 0.3, y: 30, opacity: 0 }}
                animate={
                  stage === 'avatar_focus'
                    ? {
                        scale: 1.35, // "ekto boro kore samne asbe"
                        y: 0,
                        opacity: 1,
                      }
                    : {
                        scale: 0.9, // Shrinks to card avatar scale
                        y: -140,    // Moves to exact top-of-card profile spot!
                        opacity: 0.95,
                      }
                }
                transition={{
                  duration: stage === 'avatar_focus' ? 0.55 : 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute z-50 flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="relative">
                  {/* Glowing halo behind avatar in selected theme color */}
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.6, 0.9, 0.6],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-3 rounded-full blur-lg"
                    style={{ background: theme.glowRgba(0.8) }}
                  />

                  {/* Large Profile Picture */}
                  <div
                    className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 shadow-2xl"
                    style={{
                      borderColor: theme.primaryHex,
                      boxShadow: `0 0 40px ${theme.glowRgba(0.85)}`,
                    }}
                  >
                    <img
                      src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Sparkle badge */}
                  <div
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1 whitespace-nowrap text-neutral-950"
                    style={{ backgroundColor: theme.primaryHex }}
                  >
                    <Sparkles className="w-3 h-3 text-neutral-950" />
                    <span>{profile.fullName}</span>
                  </div>
                </div>

                {stage === 'avatar_focus' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-center space-y-1"
                  >
                    <p className="text-xs font-mono font-semibold" style={{ color: theme.primaryHex }}>
                      {profile.designation || 'Smart NFC Profile'}
                    </p>
                    <p className="text-[11px] text-neutral-400">Loading live digital card...</p>
                  </motion.div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Subtitle status info */}
          <div className="mt-4 text-center space-y-1">
            <p
              className="text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5"
              style={{ color: theme.primaryHex }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contactless Smart NFC Read</span>
            </p>
            <p className="text-[11px] text-neutral-400 font-medium">
              1-Tap hardware verified • Access Granted
            </p>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
