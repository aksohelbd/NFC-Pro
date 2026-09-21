import { motion } from 'motion/react';

interface CuteWavingMascotProps {
  className?: string;
  name?: string;
}

/**
 * Handsome, lively Anime / Chibi Boy Cartoon Mascot
 * - Styled hair, confident cute smile, sparkling anime eyes
 * - Stylish casual jacket / hoodie in golden-amber tones
 * - Fluid natural waving arm with friendly "Hi! 👋" speech bubble
 * - High-energy friendly sticker vibe
 */
export function CuteWavingMascot({ className = 'w-full h-full', name = 'Guest' }: CuteWavingMascotProps) {
  return (
    <div className={`relative flex items-center justify-center select-none overflow-hidden bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100 dark:from-neutral-900 dark:via-neutral-850 dark:to-amber-950/40 rounded-xl ${className}`}>
      {/* Speech Bubble "Hi!" floating */}
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 450, damping: 14 }}
        className="absolute top-1 right-1 z-30 bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-yellow-200"
      >
        <span>Hi!</span>
        <span className="text-xs">👋</span>
      </motion.div>

      {/* Cute Anime Chibi Boy SVG */}
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Skin tones */}
          <radialGradient id="boySkin" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FFF4E8" />
            <stop offset="65%" stopColor="#FFE0C8" />
            <stop offset="100%" stopColor="#F9CAA7" />
          </radialGradient>
          {/* Boy's stylish dark-brown / espresso hair */}
          <linearGradient id="boyHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A1B14" />
            <stop offset="50%" stopColor="#1E140F" />
            <stop offset="100%" stopColor="#120A06" />
          </linearGradient>
          {/* Hair highlight */}
          <linearGradient id="hairHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8D5B4C" stopOpacity="0" />
            <stop offset="50%" stopColor="#B27D66" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8D5B4C" stopOpacity="0" />
          </linearGradient>
          {/* Jacket / Hoodie in golden amber */}
          <linearGradient id="jacketGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          {/* T-Shirt under jacket */}
          <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          {/* Rosy blush */}
          <radialGradient id="boyBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF7B88" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF7B88" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- BODY & CLOTHING --- */}
        {/* Shoulders & Jacket */}
        <path
          d="M32 152 C32 120, 52 116, 80 116 C108 116, 128 120, 128 152 Z"
          fill="url(#jacketGrad)"
        />
        {/* Inner white tee */}
        <path
          d="M68 116 L80 136 L92 116 Z"
          fill="url(#shirtGrad)"
        />
        {/* Jacket collar lapels */}
        <path
          d="M58 116 L74 134 L78 116 Z"
          fill="#B45309"
        />
        <path
          d="M102 116 L86 134 L82 116 Z"
          fill="#B45309"
        />

        {/* Neck */}
        <path
          d="M71 106 L71 118 C71 122, 89 122, 89 118 L89 106 Z"
          fill="#F2BF98"
        />

        {/* --- HEAD & FACE --- */}
        {/* Ears */}
        {/* Left ear */}
        <ellipse cx="44" cy="80" rx="6" ry="8" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" />
        <ellipse cx="45" cy="80" rx="3" ry="4.5" fill="#F2BF98" />
        {/* Right ear */}
        <ellipse cx="116" cy="80" rx="6" ry="8" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" />
        <ellipse cx="115" cy="80" rx="3" ry="4.5" fill="#F2BF98" />

        {/* Face contour (Chibi oval with soft cheeks) */}
        <path
          d="M48 76 C48 54, 112 54, 112 76 C112 98, 98 112, 80 112 C62 112, 48 98, 48 76 Z"
          fill="url(#boySkin)"
        />

        {/* Cheeks Blush */}
        <circle cx="59" cy="87" r="7" fill="url(#boyBlush)" />
        <circle cx="101" cy="87" r="7" fill="url(#boyBlush)" />

        {/* --- EYES & BROWS (Lively Handsome Anime Boy Expression) --- */}
        {/* Left Eyebrow - friendly arch */}
        <path
          d="M58 68 Q66 65 73 69"
          stroke="#2A1B14"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Right Eyebrow - confident slight raise */}
        <path
          d="M87 69 Q94 64 102 67"
          stroke="#2A1B14"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Left Eye - Big bright Anime Boy Eye */}
        <ellipse cx="65" cy="79" rx="5" ry="7" fill="#1C1917" />
        {/* Eye Iris Amber tint */}
        <ellipse cx="65" cy="80" rx="4.2" ry="5.5" fill="#78350F" />
        <ellipse cx="65" cy="81" rx="3.5" ry="4.5" fill="#1C1917" />
        {/* Eye Sparks */}
        <circle cx="63.5" cy="76.5" r="2.2" fill="white" />
        <circle cx="66.5" cy="82" r="1.2" fill="white" />

        {/* Right Eye - Joyful Winking Eye with sparkling eyelash */}
        <motion.path
          d="M90 80 Q96 73 103 80"
          stroke="#1C1917"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          animate={{ scaleY: [1, 0.4, 1, 1, 0.3, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.08, 0.16, 0.6, 0.68, 0.76] }}
        />
        {/* Star sparkle on winking eye */}
        <motion.path
          d="M106 74 L107.5 77 L110.5 77 L108 79 L109 82 L106 80 L103 82 L104 79 L101.5 77 L104.5 77 Z"
          fill="#F59E0B"
          animate={{ rotate: [0, 90, 180, 270, 360], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Cute Small Nose */}
        <path
          d="M79 81 L80 84 L78 84"
          stroke="#D49A76"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bright Confident Smile */}
        <path
          d="M72 89 Q80 98 88 89"
          stroke="#991B1B"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="#DC2626"
        />
        {/* Smile inner teeth highlight */}
        <path
          d="M74 89.5 Q80 92 86 89.5"
          fill="white"
        />

        {/* --- BOY'S HAIR (Trendy modern layered anime cut) --- */}
        {/* Base back hair */}
        <path
          d="M44 76 C42 46, 118 46, 116 76 C116 88, 122 72, 120 54 C116 34, 44 34, 40 54 C38 72, 44 88, 44 76 Z"
          fill="url(#boyHair)"
        />
        {/* Front bangs and spikes */}
        <path
          d="M42 58 Q48 72 54 75 Q52 64 62 76 Q60 62 72 74 Q74 60 84 75 Q86 62 98 74 Q100 66 112 68 Q118 56 116 46 C110 32, 50 32, 42 58 Z"
          fill="url(#boyHair)"
        />
        {/* Hair side tufts */}
        <path
          d="M44 65 Q40 76 43 86 Q46 78 48 70 Z"
          fill="url(#boyHair)"
        />
        <path
          d="M116 65 Q120 76 117 86 Q114 78 112 70 Z"
          fill="url(#boyHair)"
        />
        {/* Top spike accents */}
        <path
          d="M66 38 Q74 24 82 32 Q88 22 96 36 Z"
          fill="url(#boyHair)"
        />
        {/* Hair soft glossy highlight bar */}
        <ellipse
          cx="80"
          cy="46"
          rx="26"
          ry="3"
          fill="url(#hairHighlight)"
        />

        {/* Left Resting Hand on Hip */}
        <path
          d="M34 146 Q32 136 38 132 Q44 130 46 138 Q44 148 34 146 Z"
          fill="#FFE0C8"
          stroke="#E5B28F"
          strokeWidth="1.2"
        />

        {/* --- RIGHT WAVING ARM & HAND (Fluid, Natural Human Wave) --- */}
        <motion.g
          style={{ originX: '112px', originY: '124px' }}
          animate={{
            rotate: [0, 24, -14, 26, -10, 20, -6, 0],
          }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Jacket Sleeve */}
          <path
            d="M110 120 C118 108, 126 96, 132 84"
            stroke="url(#jacketGrad)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* White sleeve cuff */}
          <circle cx="132" cy="84" r="7" fill="#FDE68A" />

          {/* Hand Palm */}
          <circle cx="136" cy="74" r="8.5" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1.2" />

          {/* 4 Boy Waving Fingers */}
          {/* Index */}
          <rect x="130" y="60" width="3.4" height="11" rx="1.7" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" transform="rotate(-15 130 60)" />
          {/* Middle */}
          <rect x="134" y="58" width="3.4" height="12.5" rx="1.7" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" transform="rotate(-4 134 58)" />
          {/* Ring */}
          <rect x="138" y="60" width="3.4" height="11" rx="1.7" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" transform="rotate(8 138 60)" />
          {/* Pinky */}
          <rect x="142" y="63" width="3.2" height="9" rx="1.6" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" transform="rotate(18 142 63)" />
          {/* Thumb */}
          <ellipse cx="129" cy="73" rx="2.8" ry="4.5" fill="#FFE0C8" stroke="#E5B28F" strokeWidth="1" transform="rotate(-40 129 73)" />

          {/* Motion wind lines */}
          <motion.path
            d="M148 64 C153 67, 155 72, 153 76"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.65, repeat: Infinity }}
          />
          <motion.path
            d="M152 56 C157 60, 158 66, 156 71"
            stroke="#FBBF24"
            strokeWidth="1.6"
            strokeLinecap="round"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.65, repeat: Infinity }}
          />
        </motion.g>
      </svg>

      {/* Sparkles around boy */}
      <motion.div
        animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-1.5 left-2 text-amber-500 font-bold text-xs"
      >
        ✨
      </motion.div>
    </div>
  );
}
