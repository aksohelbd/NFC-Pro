import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Sparkles,
  QrCode,
  RotateCw,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface PhysicalSmartCardProps {
  profile: UserProfile;
  onTapToViewNfc: () => void;
}

export function PhysicalSmartCard({ profile, onTapToViewNfc }: PhysicalSmartCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth 3D tilt on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12;
    const rY = ((x - centerX) / centerX) * 14;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Perspective Canvas */}
      <div
        className="w-full max-w-[360px] sm:max-w-[400px] h-[225px] sm:h-[245px] [perspective:1200px] cursor-pointer select-none relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient Glow behind card */}
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 via-indigo-600/30 to-amber-500/30 rounded-[32px] blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

        {/* The 3D Card Object */}
        <motion.div
          ref={cardRef}
          animate={{
            rotateX: rotateX,
            rotateY: isFlipped ? 180 : rotateY,
          }}
          transition={{
            rotateY: { duration: 0.6, ease: 'easeInOut' },
            rotateX: { type: 'spring', stiffness: 300, damping: 20 },
          }}
          className="w-full h-full relative [transform-style:preserve-3d] rounded-[26px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          {/* ================= FRONT OF CARD ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[26px] p-5 sm:p-6 flex flex-col justify-between [backface-visibility:hidden] overflow-hidden border border-amber-500/40 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white"
            onClick={onTapToViewNfc}
          >
            {/* Holographic light sheen running across */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

            {/* Subtle luxury geometric background lines */}
            <div className="absolute right-0 top-0 bottom-0 w-44 opacity-20 pointer-events-none">
              <svg viewBox="0 0 160 160" fill="none" className="w-full h-full text-amber-400 stroke-current">
                <circle cx="140" cy="20" r="40" strokeWidth="1.2" strokeDasharray="4 4" />
                <circle cx="140" cy="20" r="70" strokeWidth="1.2" />
                <circle cx="140" cy="20" r="100" strokeWidth="1.2" strokeDasharray="6 6" />
                <circle cx="140" cy="20" r="130" strokeWidth="1.2" />
              </svg>
            </div>

            {/* Top Row: Metallic EMV Chip & Contactless Waves */}
            <div className="flex items-center justify-between z-10">
              {/* Metallic Gold EMV Microchip */}
              <div className="relative w-12 h-9 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-0.5 shadow-md border border-amber-300/60 flex items-center justify-center">
                <div className="w-full h-full rounded-md border border-amber-700/40 grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="border-r border-b border-amber-700/40 rounded-tl-sm" />
                  <div className="border-b border-amber-700/40 rounded-tr-sm" />
                  <div className="border-r border-amber-700/40 rounded-bl-sm" />
                  <div className="rounded-br-sm" />
                </div>
                {/* Chip circuit dot */}
                <div className="absolute w-2 h-2 rounded-full bg-amber-500/70 border border-amber-800/40" />
              </div>

              {/* NFC Contactless Wave Symbol */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-400/80 font-bold uppercase">
                  NFC TAP
                </span>
                <div className="w-8 h-8 rounded-full bg-neutral-900/90 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xs">
                  <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                    <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                    <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle: Profile Picture & Details */}
            <div className="flex items-center gap-3.5 z-10 my-auto">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 blur-2xs opacity-80" />
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-amber-400 shadow-md"
                />
              </div>

              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">
                    {profile.fullName}
                  </h3>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </div>
                <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 truncate">
                  {profile.designation}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {profile.company}
                </p>
              </div>
            </div>

            {/* Bottom Row: Token Number & Tap Status */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-400 tracking-widest">
                  ID: {profile.token}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wide">
                  READY TO TAP
                </span>
              </div>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-[26px] [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden border border-amber-500/40 bg-neutral-950 text-white flex flex-col justify-between shadow-2xl"
            onClick={onTapToViewNfc}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-10 bg-neutral-900 mt-4 border-y border-neutral-800 flex items-center px-4">
              <div className="w-full h-2 bg-neutral-800 rounded-xs opacity-50" />
            </div>

            {/* Signature Strip & QR Preview */}
            <div className="px-6 py-2 flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-40 sm:w-48 h-7 bg-neutral-800/80 border border-neutral-700 rounded-sm flex items-center px-2 font-mono text-[10px] text-neutral-400 italic">
                  <span>Authorised Signature</span>
                </div>
                <span className="text-[9px] text-neutral-500 font-mono block">
                  CVC: 889 • Contactless Smart NFC
                </span>
              </div>

              {/* Mini QR code on card back */}
              <div className="w-12 h-12 rounded-lg bg-white p-1 shadow-md flex items-center justify-center">
                <QrCode className="w-full h-full text-black" />
              </div>
            </div>

            {/* Bottom Info on back */}
            <div className="px-6 pb-4 flex items-center justify-between text-[10px] text-neutral-400 font-mono border-t border-neutral-900 pt-2">
              <span>{profile.fullName}</span>
              <span className="text-amber-400 font-bold">TAP 1 PRO</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control buttons under card */}
      <div className="mt-4 flex items-center gap-3 z-10">
        <button
          id="flip-physical-card-btn"
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5 text-indigo-500 dark:text-amber-400" />
          <span>{isFlipped ? 'Show Card Front' : 'Flip to Card Back'}</span>
        </button>

        <button
          id="trigger-tap-view-btn"
          type="button"
          onClick={onTapToViewNfc}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer shadow-[0_2px_10px_rgba(245,158,11,0.3)] active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simulate NFC Tap</span>
        </button>
      </div>

      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium text-center">
        Hover to tilt in 3D • Click card to experience real contactless tap
      </p>
    </div>
  );
}
