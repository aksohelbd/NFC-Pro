import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Phone,
  Mail,
  MessageSquare,
  Download,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Palette,
  Cloud,
  ShieldCheck,
  Smartphone,
  QrCode,
  Share2,
  Check,
  Send,
  Layers,
  Award,
  Zap,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';
import { downloadVCard, cleanPhoneNumber, getWhatsAppUrl } from '../utils/vcard';
import { getPlatformMeta } from '../utils/socialIcons';
import { SmartCardShareModal } from './SmartCardShareModal';
import { PhysicalSmartCard } from './PhysicalSmartCard';
import { NfcTapTransitionModal } from './NfcTapTransitionModal';
import { getAdminSettings, getAdminPin } from '../utils/storage';

interface PortfolioHomeProps {
  profile: UserProfile;
  onOpenNfcCard: () => void;
  onOpenClientPortal: () => void;
  onOpenAdmin: () => void;
}

export function PortfolioHome({
  profile,
  onOpenNfcCard,
  onOpenClientPortal,
  onOpenAdmin,
}: PortfolioHomeProps) {
  const [showQr, setShowQr] = useState(false);
  const [showTapTransition, setShowTapTransition] = useState(false);
  const [vCardDownloaded, setVCardDownloaded] = useState(false);
  const [contactMsg, setContactMsg] = useState({ name: '', message: '' });

  const cardShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?card=${profile.slug || profile.token}`
    : '';

  const handleDownloadContact = () => {
    downloadVCard(profile);
    setVCardDownloaded(true);
    setTimeout(() => setVCardDownloaded(false), 2500);
  };

  const adminSettings = getAdminSettings();

  const handleTriggerNfcTap = () => {
    if (adminSettings.isNfcPublicButtonLocked) {
      const pin = window.prompt('NFC Button is locked by Administrator. Enter Admin PIN to proceed:');
      if (pin && pin.trim() === getAdminPin()) {
        setShowTapTransition(true);
      } else if (pin !== null) {
        alert('Incorrect Admin PIN. Access Denied.');
      }
      return;
    }
    setShowTapTransition(true);
  };

  const handleCompleteTapTransition = () => {
    setShowTapTransition(false);
    onOpenNfcCard();
  };

  const handleSendWhatsAppMsg = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello Sohel! My name is ${contactMsg.name || 'Visitor'}. ${contactMsg.message}`;
    window.open(getWhatsAppUrl(profile.whatsapp || profile.phone, text), '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6">
        {/* Subtle background graphics */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Col: Headline & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Contactless Smart NFC Cards & Digital Hub</span>
              </div>

              {/* Name & Title */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                  Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-indigo-600 dark:from-amber-400 dark:via-yellow-300 dark:to-indigo-400">{profile.fullName}</span>
                </h1>
                <p className="text-lg sm:text-xl font-medium text-neutral-700 dark:text-neutral-300">
                  {profile.headline}
                </p>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {profile.bio}
                </p>
              </div>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  id="hero-open-nfc-btn"
                  onClick={handleTriggerNfcTap}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 ${
                    adminSettings.isNfcPublicButtonLocked
                      ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 hover:bg-neutral-700'
                      : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950'
                  }`}
                >
                  {adminSettings.isNfcPublicButtonLocked ? (
                    <>
                      <Lock className="w-4 h-4 text-rose-400" />
                      <span>NFC Card (Protected / Locked)</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Tap to View NFC Smart Card</span>
                      <Zap className="w-4 h-4 ml-1 fill-neutral-950" />
                    </>
                  )}
                </button>

                <button
                  id="hero-save-contact-btn"
                  onClick={handleDownloadContact}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold text-sm border border-neutral-200 dark:border-neutral-700 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {vCardDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Contact Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-amber-500" />
                      <span>Save Contact (.vcf)</span>
                    </>
                  )}
                </button>

                <button
                  id="hero-qr-btn"
                  onClick={() => setShowQr(true)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                  title="Show NFC Card QR Code"
                  aria-label="Show NFC QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>

              {/* Quick direct contact badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <a
                  href={`tel:${cleanPhoneNumber(profile.phone)}`}
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{profile.phone}</span>
                </a>
                <span>•</span>
                <a
                  href={getWhatsAppUrl(profile.whatsapp || profile.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Direct</span>
                </a>
                <span>•</span>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-500" />
                  <span>{profile.email}</span>
                </a>
              </div>
            </motion.div>

            {/* Right Col: The Enhanced 3D Physical Smart Card with Flip & Microchip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 flex justify-center w-full"
            >
              <PhysicalSmartCard
                profile={profile}
                onTapToViewNfc={handleTriggerNfcTap}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Media Highlight Matrix (With Staggered Spring Animation) */}
      <section id="social-hub" className="py-14 bg-white dark:bg-neutral-900/60 border-y border-neutral-200/80 dark:border-neutral-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Social Connect</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Instant Social Media Integration
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Tap any link to connect instantly. All channels update live across your smart card and portfolio.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4"
          >
            {profile.socialLinks.map((link, idx) => {
              const meta = getPlatformMeta(link.platform);
              return (
                <motion.a
                  key={link.id}
                  id={`home-social-${link.platform}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={{
                    hidden: { opacity: 0, y: 25, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        delay: idx * 0.07,
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                      },
                    },
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${meta.bgLight} ${meta.bgDark} ${meta.borderColor} shadow-2xs hover:shadow-md`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-white dark:bg-neutral-900 shadow-2xs group-hover:scale-115 group-hover:rotate-3 transition-transform ${meta.textColor}`}>
                      {meta.icon('w-5 h-5')}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white capitalize block">
                        {link.label || link.platform}
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Connect Now
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-500 transition-colors" />
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Services & NFC Solutions Section */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              What I Offer
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Specialized Services & NFC Cards
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Modern digital tools built for seamless real-time contact sharing, high conversion, and privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(profile.services || []).map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {idx === 0 && <Code2 className="w-6 h-6" />}
                  {idx === 1 && <CreditCard className="w-6 h-6" />}
                  {idx === 2 && <Palette className="w-6 h-6" />}
                  {idx === 3 && <Cloud className="w-6 h-6" />}
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {srv.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {srv.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-16 sm:py-20 bg-white dark:bg-neutral-900/40 border-t border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Portfolio Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Featured Works & Innovations
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
              Tested for fluid mobile responsiveness, instant vCard sync, and high security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(profile.projects || []).map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {p.category}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills & Capabilities */}
      <section id="skills" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Technical Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Skills & Engineering Expertise
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(profile.skills || []).map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-1.5 shadow-2xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {skill.category}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                  {skill.name}
                </h4>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {skill.level}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Contact & Inquiry Form */}
      <section id="contact" className="py-16 sm:py-20 bg-white dark:bg-neutral-900/50 border-t border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Get in Touch
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Direct Contact & Custom NFC Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Send a message directly via WhatsApp or Email, or tap the phone number to call.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Quick Contact cards */}
            <div className="md:col-span-5 space-y-3">
              <a
                href={`tel:${cleanPhoneNumber(profile.phone)}`}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Phone Number
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {profile.phone}
                  </span>
                </div>
              </a>

              <a
                href={getWhatsAppUrl(profile.whatsapp || profile.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    WhatsApp Chat
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {profile.whatsapp || profile.phone}
                  </span>
                </div>
              </a>

              <a
                href={`mailto:${profile.email}`}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Official Email
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">
                    {profile.email}
                  </span>
                </div>
              </a>
            </div>

            {/* Direct Message Form */}
            <div className="md:col-span-7">
              <form
                onSubmit={handleSendWhatsAppMsg}
                className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-800 space-y-4"
              >
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Send Direct WhatsApp Message
                </h3>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={contactMsg.name}
                    onChange={(e) => setContactMsg({ ...contactMsg, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Message / Inquiry
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="I would like to discuss a project or order an NFC card..."
                    value={contactMsg.message}
                    onChange={(e) => setContactMsg({ ...contactMsg, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message via WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic Physical NFC Tap Transition Modal (The Tap Experience requested by user) */}
      <NfcTapTransitionModal
        isOpen={showTapTransition}
        profile={profile}
        onComplete={handleCompleteTapTransition}
      />

      {/* 4-Design Interactive Smart Card Share Modal */}
      <SmartCardShareModal
        profile={profile}
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        cardUrl={cardShareUrl}
      />
    </div>
  );
}
