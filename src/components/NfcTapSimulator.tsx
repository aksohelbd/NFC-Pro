import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Phone,
  Mail,
  MessageSquare,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Check,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { UserProfile } from '../types';
import { downloadVCard, cleanPhoneNumber, getWhatsAppUrl } from '../utils/vcard';
import { getPlatformMeta } from '../utils/socialIcons';

interface NfcTapSimulatorProps {
  profile: UserProfile;
  onOpenFullCard: () => void;
}

export function NfcTapSimulator({ profile, onOpenFullCard }: NfcTapSimulatorProps) {
  const [isTapped, setIsTapped] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedContact, setSavedContact] = useState(false);

  const triggerTapAnimation = () => {
    setIsAnimating(true);
    setIsTapped(false);
    setTimeout(() => {
      setIsTapped(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 1200);
    }, 600);
  };

  const handleSaveContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadVCard(profile);
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 2500);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-2 flex flex-col items-center select-none">
      {/* Simulation Controls Header */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            NFC Instant Tap Simulator
          </span>
        </div>

        <button
          id="replay-tap-sim-btn"
          onClick={triggerTapAnimation}
          disabled={isAnimating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isAnimating ? 'animate-spin' : ''}`} />
          <span>Tap Card Again</span>
        </button>
      </div>

      {/* Simulator Stage */}
      <div className="relative w-full flex flex-col items-center justify-center min-h-[580px] p-4 sm:p-8 rounded-3xl bg-radial from-neutral-900 via-neutral-950 to-black border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Ambient background gold waves */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Floating Physical Matte Black & Gold NFC Card */}
        <motion.div
          animate={
            isAnimating
              ? {
                  y: [0, 95, 20],
                  rotate: [-12, -4, -12],
                  scale: [1, 1.05, 1],
                }
              : {
                  y: [0, -6, 0],
                  rotate: [-10, -8, -10],
                }
          }
          transition={
            isAnimating
              ? { duration: 1.2, ease: 'easeInOut' }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }
          onClick={triggerTapAnimation}
          className="relative z-20 w-64 sm:w-72 h-36 sm:h-40 rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border border-amber-500/40 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-pointer group hover:border-amber-400 transition-all -mb-16 -ml-12"
        >
          {/* Gold foil lines & brand */}
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 flex items-center justify-center shadow-md">
                  <CreditCard className="w-4 h-4 text-black" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                  NFC PRO 1
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 tracking-widest font-mono">
                SMART DIGITAL CARD
              </p>
            </div>

            {/* Contactless symbol */}
            <div className="flex items-center gap-1 text-amber-400">
              <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                <path d="M15.5 21.5a12 12 0 0 1 0-19" />
              </svg>
            </div>
          </div>

          {/* Geometric luxury lines */}
          <div className="absolute right-4 bottom-3 opacity-30 group-hover:opacity-50 transition-opacity">
            <svg width="80" height="45" viewBox="0 0 80 45" fill="none">
              <path d="M10 40 L70 40 M20 30 L70 30 M30 20 L70 20 M40 10 L70 10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="absolute left-4 bottom-3">
            <span className="text-[10px] font-mono tracking-widest text-amber-300/80">
              {profile.fullName}
            </span>
            <div className="text-[8px] font-mono text-neutral-500">
              ID: {profile.token}
            </div>
          </div>
        </motion.div>

        {/* GOLD NFC WAVE PULSE ANIMATION (Triggered on Tap) */}
        <AnimatePresence>
          {(isAnimating || isTapped) && (
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-15 pointer-events-none">
              {/* Ring 1 */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: [0.2, 1.8, 3.2], opacity: [0.9, 0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                className="w-28 h-28 rounded-full border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.6)]"
              />
              {/* Ring 2 */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0.8 }}
                animate={{ scale: [0.2, 2.2, 3.8], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 1.6, delay: 0.35, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 w-28 h-28 rounded-full border border-yellow-300/60 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
              />
              {/* Ring 3 */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0.7 }}
                animate={{ scale: [0.2, 2.6, 4.2], opacity: [0.7, 0.3, 0] }}
                transition={{ duration: 1.6, delay: 0.7, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 w-28 h-28 rounded-full border border-amber-500/40"
              />
            </div>
          )}
        </AnimatePresence>

        {/* Realistic iPhone Screen Container */}
        <div className="relative z-10 w-[290px] sm:w-[310px] rounded-[42px] p-2.5 bg-neutral-800 border-4 border-neutral-700 shadow-[0_25px_60px_rgba(0,0,0,0.9)] mt-6">
          {/* Inner Phone Bezel & Screen */}
          <div className="relative w-full rounded-[34px] bg-neutral-950 text-neutral-100 overflow-hidden border border-neutral-800 flex flex-col min-h-[480px]">
            {/* Dynamic Island */}
            <div className="w-full pt-2 flex justify-center pb-1">
              <div className="w-24 h-5 rounded-full bg-black border border-neutral-800/80 flex items-center justify-between px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
              </div>
            </div>

            {/* Time / Signal Bar */}
            <div className="px-5 py-1 flex justify-between items-center text-[10px] text-neutral-400 font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span className="text-[9px]">5G</span>
                <div className="w-4 h-2 border border-neutral-400 rounded-xs p-0.5 flex">
                  <div className="w-2.5 h-full bg-amber-400 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Phone Screen Digital Profile Content */}
            <AnimatePresence mode="wait">
              {isTapped ? (
                <motion.div
                  key="phone-content"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="p-4 flex-1 flex flex-col justify-between"
                >
                  {/* Top Profile Header */}
                  <div className="text-center space-y-2 pt-1">
                    {/* Glowing Avatar */}
                    <div className="relative inline-block mx-auto">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 blur-xs opacity-75 animate-pulse" />
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="relative w-18 h-18 rounded-full object-cover border-2 border-amber-400 shadow-md"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-950" />
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-white tracking-tight flex items-center justify-center gap-1">
                        <span>{profile.fullName}</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </h4>
                      <p className="text-[11px] font-semibold text-amber-400">
                        {profile.designation}
                      </p>
                      {profile.company && (
                        <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                          {profile.company}
                        </span>
                      )}
                    </div>

                    {/* Dual Action Buttons (Exactly like the video reference!) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* SAVE CONTACT */}
                      <button
                        onClick={handleSaveContact}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-[11px] shadow-[0_4px_14px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95 transition-all"
                      >
                        {savedContact ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>SAVE CONTACT</span>
                          </>
                        )}
                      </button>

                      {/* TAP / SHARE */}
                      <button
                        onClick={onOpenFullCard}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/50 font-semibold text-[11px] shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>OPEN CARD</span>
                      </button>
                    </div>

                    {/* Circular Social Media Row (from video) */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {profile.socialLinks.slice(0, 5).map((social) => {
                        const meta = getPlatformMeta(social.platform);
                        return (
                          <a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-neutral-900 border border-amber-500/40 hover:border-amber-400 flex items-center justify-center text-amber-300 hover:text-amber-200 transition-transform hover:scale-110 shadow-xs"
                            title={social.label}
                          >
                            {meta.icon('w-4 h-4')}
                          </a>
                        );
                      })}
                    </div>

                    {/* Quick Contacts List on Phone Screen */}
                    <div className="space-y-1.5 pt-2 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-1 block">
                        Quick Contacts
                      </span>

                      {/* Phone 1 */}
                      <a
                        href={`tel:${cleanPhoneNumber(profile.phone)}`}
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <div className="p-1.5 rounded-lg bg-neutral-800 text-amber-400">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block">Mobile Phone</span>
                            <span className="font-semibold text-neutral-200 group-hover:text-amber-300 text-xs">
                              {profile.phone}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                      </a>

                      {/* WhatsApp / Second contact */}
                      <a
                        href={getWhatsAppUrl(profile.whatsapp || profile.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-emerald-500/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <div className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block">WhatsApp Chat</span>
                            <span className="font-semibold text-neutral-200 group-hover:text-emerald-300 text-xs">
                              {profile.whatsapp || profile.phone}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                      </a>

                      {/* Email */}
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <div className="p-1.5 rounded-lg bg-neutral-800 text-sky-400">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate max-w-[150px]">
                            <span className="text-[9px] text-neutral-400 block">Official Email</span>
                            <span className="font-semibold text-neutral-200 group-hover:text-sky-300 text-xs truncate">
                              {profile.email}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                      </a>
                    </div>
                  </div>

                  {/* Bottom bar inside phone */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={onOpenFullCard}
                      className="text-[10px] text-amber-400/90 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>Open Full Screen Tap Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">
                      Hold NFC Card Near Phone
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Simulating real-time contactless tap...
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* iOS Home Indicator Bar */}
            <div className="w-full pb-2 flex justify-center">
              <div className="w-24 h-1 rounded-full bg-neutral-700" />
            </div>
          </div>
        </div>

        {/* Action instruction under simulator */}
        <div className="mt-4 text-center">
          <p className="text-xs font-semibold text-neutral-300">
            Click <strong className="text-amber-400">"Tap Card Again"</strong> to re-trigger the golden wave animation
          </p>
        </div>
      </div>
    </div>
  );
}
