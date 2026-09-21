import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ExternalLink,
  CreditCard,
  MapPin,
  Building2,
  CheckCircle2,
  Zap,
  FileText,
  Image as ImageIcon,
  Radio,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';
import { downloadVCard, cleanPhoneNumber, getWhatsAppUrl } from '../utils/vcard';
import { getPlatformMeta } from '../utils/socialIcons';
import { exportInteractiveSmartPdf, exportCardAsJpg } from '../utils/cardPdfExport';
import { getCardNfcWriteUrl } from '../utils/storage';

interface SmartCardShareModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  cardUrl: string;
}

export type CardTemplateType =
  | 'landscape_gold'
  | 'landscape_pearl'
  | 'portrait_cyber'
  | 'portrait_vip';

export function SmartCardShareModal({
  profile,
  isOpen,
  onClose,
  cardUrl,
}: SmartCardShareModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplateType>('landscape_gold');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNfcLink, setCopiedNfcLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [vCardSaved, setVCardSaved] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Logo source: websiteLogoUrl or avatarUrl
  const logoSource = profile.websiteLogoUrl || profile.avatarUrl;

  // Generate QR Code with Website/Profile Logo centered automatically
  useEffect(() => {
    if (!isOpen) return;

    const generateQrWithCenterLogo = async () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 360;
        // Level 'H' ensures 30% error correction so center logo leaves QR 100% readable
        await QRCode.toCanvas(canvas, cardUrl, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#0a0a0a',
            light: '#ffffff',
          },
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw center logo emblem
        const logo = new window.Image();
        logo.crossOrigin = 'anonymous';
        logo.src = logoSource;

        logo.onload = () => {
          const logoSize = size * 0.26; // 26% width
          const center = size / 2;
          const x = center - logoSize / 2;
          const y = center - logoSize / 2;

          // Clear center circle with margin
          const radius = (logoSize / 2) + 4;
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, radius, 0, Math.PI * 2, true);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 8;
          ctx.fill();

          // Border ring
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#f59e0b'; // Gold ring
          ctx.stroke();

          // Clip image to circle
          ctx.beginPath();
          ctx.arc(center, center, logoSize / 2, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();

          // Draw the brand logo
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          ctx.restore();

          setQrDataUrl(canvas.toDataURL('image/png'));
        };

        logo.onerror = () => {
          // If external image fails CORS, fallback to standard QR
          setQrDataUrl(canvas.toDataURL('image/png'));
        };
      } catch (err) {
        console.error('QR code generation failed:', err);
      }
    };

    generateQrWithCenterLogo();
  }, [isOpen, cardUrl, logoSource]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      const fullUrl = `${cardUrl}&template=${selectedTemplate}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleCopyNfcLink = async () => {
    try {
      const nfcUrl = getCardNfcWriteUrl(profile);
      await navigator.clipboard.writeText(nfcUrl);
      setCopiedNfcLink(true);
      setTimeout(() => setCopiedNfcLink(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportInteractiveSmartPdf(profile, cardUrl);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportJpg = async () => {
    try {
      setIsExportingJpg(true);
      await exportCardAsJpg(`shareable-card-template-${selectedTemplate}`, `${profile.slug || profile.token}-smart-card`);
    } catch (err) {
      console.error('Failed to export JPG:', err);
    } finally {
      setIsExportingJpg(false);
    }
  };

  const handleShareNative = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${profile.fullName} | Smart NFC Business Card`,
          text: `Connect with ${profile.fullName} (${profile.designation}) via contactless Smart NFC card.`,
          url: `${cardUrl}&template=${selectedTemplate}`,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveContact = () => {
    downloadVCard(profile);
    setVCardSaved(true);
    setTimeout(() => setVCardSaved(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${profile.slug}-smart-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="smart-card-share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="smart-card-share-modal-container"
        className="relative w-full max-w-3xl my-auto rounded-[32px] bg-neutral-900 border border-amber-500/30 p-4 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-white transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle gold radial background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Interactive Smart Card Share</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  4 Designs
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                All details, links, call, and WhatsApp are 100% interactive & live
              </p>
            </div>
          </div>

          <button
            id="share-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Tabs (2 Landscape, 2 Portrait) */}
        <div className="my-4">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Select Card Design Template:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplate('landscape_gold')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedTemplate === 'landscape_gold'
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-xs'
                  : 'bg-neutral-850 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <span className="text-[10px] font-mono block text-amber-400 font-bold">1. LANDSCAPE</span>
              <span className="text-xs font-bold text-white block truncate">Luxury Gold & Onyx</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('landscape_pearl')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedTemplate === 'landscape_pearl'
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-xs'
                  : 'bg-neutral-850 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <span className="text-[10px] font-mono block text-amber-400 font-bold">2. LANDSCAPE</span>
              <span className="text-xs font-bold text-white block truncate">Executive Slate</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('portrait_cyber')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedTemplate === 'portrait_cyber'
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-xs'
                  : 'bg-neutral-850 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <span className="text-[10px] font-mono block text-amber-400 font-bold">3. PORTRAIT</span>
              <span className="text-xs font-bold text-white block truncate">Cyber Smart Badge</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('portrait_vip')}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                selectedTemplate === 'portrait_vip'
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-xs'
                  : 'bg-neutral-850 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <span className="text-[10px] font-mono block text-amber-400 font-bold">4. PORTRAIT</span>
              <span className="text-xs font-bold text-white block truncate">Holographic VIP</span>
            </button>
          </div>
        </div>

        {/* ================= CARD PREVIEW CANVAS ================= */}
        <div className="flex justify-center p-3 sm:p-5 bg-black/50 rounded-2xl border border-neutral-800/80 my-3">
          {/* ----------------- TEMPLATE 1: LANDSCAPE LUXURY GOLD ----------------- */}
          {selectedTemplate === 'landscape_gold' && (
            <div
              id="shareable-card-template-1"
              className="w-full max-w-xl rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-2 border-amber-400 p-5 sm:p-6 shadow-2xl relative overflow-hidden text-white"
            >
              {/* Gold light sheen */}
              <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
                {/* Left profile info */}
                <div className="flex-1 space-y-3 text-left w-full">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-amber-400 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-neutral-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-lg text-white">
                          {profile.fullName}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      </div>
                      <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                        {profile.designation}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {profile.company || 'NexTech Solutions'}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Contact Line pills */}
                  <div className="space-y-1.5 text-xs">
                    <a
                      href={`tel:${cleanPhoneNumber(profile.phone)}`}
                      className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{profile.phone}</span>
                    </a>
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate max-w-[200px]">{profile.email}</span>
                    </a>
                    {profile.address && (
                      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{profile.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Social Links Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {profile.socialLinks.slice(0, 6).map((link) => {
                      const meta = getPlatformMeta(link.platform);
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:scale-115 transition-transform flex items-center justify-center shadow-xs"
                          title={link.label || link.platform}
                        >
                          {meta.icon('w-4 h-4')}
                        </a>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleSaveContact}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer ml-auto"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save vCard</span>
                    </button>
                  </div>
                </div>

                {/* Right QR Code with Auto Center Logo */}
                <div className="shrink-0 flex flex-col items-center bg-white p-3 rounded-2xl border border-amber-400/50 shadow-md">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Smart QR Code with Auto Logo"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-neutral-400 text-[10px]">
                      Generating QR...
                    </div>
                  )}
                  <span className="text-[9px] font-mono tracking-widest text-neutral-800 font-bold uppercase mt-1">
                    SCAN OR TAP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TEMPLATE 2: LANDSCAPE EXECUTIVE SLATE ----------------- */}
          {selectedTemplate === 'landscape_pearl' && (
            <div
              id="shareable-card-template-2"
              className="w-full max-w-xl rounded-2xl bg-gradient-to-r from-slate-100 to-white border-2 border-slate-300 p-5 sm:p-6 shadow-2xl relative overflow-hidden text-slate-900"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-center justify-between">
                <div className="flex-1 space-y-3 text-left w-full">
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 shadow-md"
                    />
                    <div>
                      <h4 className="font-extrabold text-lg text-slate-900">
                        {profile.fullName}
                      </h4>
                      <p className="text-xs font-bold text-indigo-700">
                        {profile.designation}
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {profile.company}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-medium text-slate-700">
                    <a
                      href={`tel:${cleanPhoneNumber(profile.phone)}`}
                      className="flex items-center gap-2 hover:text-indigo-600"
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{profile.phone}</span>
                    </a>
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-2 hover:text-indigo-600"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{profile.email}</span>
                    </a>
                  </div>

                  {/* Social icons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {profile.socialLinks.slice(0, 6).map((link) => {
                      const meta = getPlatformMeta(link.platform);
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-white border border-slate-300 hover:scale-115 transition-transform flex items-center justify-center shadow-xs"
                          title={link.label || link.platform}
                        >
                          {meta.icon('w-4 h-4')}
                        </a>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleSaveContact}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer ml-auto"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save Contact</span>
                    </button>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center bg-white p-3 rounded-2xl border border-slate-300 shadow-md">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Smart QR Code"
                      className="w-32 h-32 object-contain"
                    />
                  )}
                  <span className="text-[9px] font-mono tracking-widest text-slate-700 font-bold uppercase mt-1">
                    EXECUTIVE PASS
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TEMPLATE 3: PORTRAIT CYBER SMART BADGE ----------------- */}
          {selectedTemplate === 'portrait_cyber' && (
            <div
              id="shareable-card-template-3"
              className="w-full max-w-[320px] rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-indigo-500/60 p-5 shadow-2xl relative text-center text-white"
            >
              {/* Lanyard Top Clip Slot */}
              <div className="w-14 h-2 rounded-full bg-neutral-800 mx-auto mb-3 border border-neutral-700" />

              <div className="relative w-20 h-20 mx-auto mb-2.5">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-400 blur-xs" />
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="relative w-full h-full rounded-2xl object-cover border border-white/20"
                />
              </div>

              <h4 className="font-extrabold text-base text-white">{profile.fullName}</h4>
              <p className="text-xs text-amber-400 font-semibold">{profile.designation}</p>
              <p className="text-[11px] text-neutral-400 mb-3">{profile.company}</p>

              {/* QR Code in center with Auto Logo */}
              <div className="inline-block p-2.5 rounded-2xl bg-white shadow-lg border border-indigo-400/40 my-1">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Center Logo QR"
                    className="w-36 h-36 object-contain"
                  />
                )}
              </div>
              <p className="text-[9px] font-mono text-indigo-300 font-bold tracking-wider mt-1">
                ID: {profile.token}
              </p>

              {/* Quick direct contact links */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <a
                  href={`tel:${cleanPhoneNumber(profile.phone)}`}
                  className="py-1.5 px-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center justify-center gap-1"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>Call Now</span>
                </a>

                <a
                  href={getWhatsAppUrl(profile.whatsapp || profile.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Social Channels in Portrait */}
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-neutral-800">
                {profile.socialLinks.slice(0, 5).map((link) => {
                  const meta = getPlatformMeta(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-white dark:bg-neutral-900 border border-neutral-700 flex items-center justify-center hover:scale-115 transition-transform"
                    >
                      {meta.icon('w-3.5 h-3.5')}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- TEMPLATE 4: PORTRAIT VIP HOLOGRAPHIC ----------------- */}
          {selectedTemplate === 'portrait_vip' && (
            <div
              id="shareable-card-template-4"
              className="w-full max-w-[320px] rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border-2 border-amber-400 p-5 shadow-2xl relative text-center text-white"
            >
              {/* Gold Chip visual */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-600 flex items-center justify-center shadow-inner">
                  <div className="w-6 h-4 border border-amber-800/40" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold">
                  VIP PASS
                </span>
              </div>

              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-18 h-18 rounded-2xl mx-auto object-cover border-2 border-amber-400 shadow-xl mb-2"
              />

              <h4 className="font-extrabold text-base text-white">{profile.fullName}</h4>
              <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 font-bold">
                {profile.designation}
              </p>

              <div className="inline-block p-2.5 rounded-2xl bg-white shadow-lg border border-amber-400 my-2">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Center Logo QR"
                    className="w-36 h-36 object-contain"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveContact}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer mt-2 flex items-center justify-center gap-1.5"
              >
                {vCardSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-neutral-950" />
                    <span>Contact Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Contact to Phone</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* NFC Hardware Chip Link & Dynamic PDF/JPG Export Hub */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-3">
          {/* Dynamic PDF & JPG Export Row */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-amber-300">Share as Dynamic PDF / JPG</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                    Clickable Links Inside PDF
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Share via WhatsApp/Email. In the PDF, tapping phone dials, tapping WhatsApp chats, and social icons open directly!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="export-dynamic-pdf-btn"
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>

              <button
                id="export-highres-jpg-btn"
                type="button"
                onClick={handleExportJpg}
                disabled={isExportingJpg}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExportingJpg ? 'Saving JPG...' : 'Save JPG'}</span>
              </button>
            </div>
          </div>

          {/* Dedicated NFC Hardware Chip Link */}
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-200">NFC Chip Write Link (Isolated)</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                    Tag: {profile.token}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                  {getCardNfcWriteUrl(profile)}
                </p>
              </div>
            </div>

            <button
              id="copy-nfc-write-url-btn"
              type="button"
              onClick={handleCopyNfcLink}
              className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {copiedNfcLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">NFC Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy NFC Chip Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: Copy Link, Share via Mobile Apps, Download QR */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            id="share-card-copy-btn"
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Shareable Link</span>
              </>
            )}
          </button>

          <button
            id="share-card-native-btn"
            type="button"
            onClick={handleShareNative}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Mobile Apps</span>
          </button>

          <button
            id="share-card-download-qr-btn"
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Download Logo QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}
