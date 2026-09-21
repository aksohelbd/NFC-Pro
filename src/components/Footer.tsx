import {
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  CreditCard,
  KeyRound,
  Shield,
  Heart,
  Send,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getWhatsAppUrl, cleanPhoneNumber } from '../utils/vcard';

interface FooterProps {
  profile: UserProfile;
  onOpenMyNfc: () => void;
  onOpenClientPortal: () => void;
  onOpenAdmin: () => void;
}

export function Footer({
  profile,
  onOpenMyNfc,
  onOpenClientPortal,
  onOpenAdmin,
}: FooterProps) {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-300 border-t border-neutral-800 pt-12 pb-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Help & Connect Card */}
        <div className="rounded-3xl bg-neutral-800/80 border border-neutral-700/80 p-6 sm:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
              Need Help or Custom NFC Smart Card?
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Let's Build Your Digital Presence
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Want your own contactless NFC digital business card or high-performance portfolio?
              Reach out directly on WhatsApp or Email for immediate setup.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              id="footer-whatsapp-btn"
              href={getWhatsAppUrl(profile.whatsapp || profile.phone, 'Hello Sohel, I want to order an NFC Smart Business Card!')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              id="footer-email-btn"
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-xs border border-neutral-600 transition-all active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Email Me</span>
            </a>
          </div>
        </div>

        {/* Middle row: Brand & Direct Contact Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-neutral-800 text-xs text-neutral-400">
          {/* Col 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span>{profile.fullName}</span>
            </div>
            <p className="leading-relaxed">
              {profile.headline || 'Full-Stack Software Engineer & Smart NFC Specialist.'}
            </p>
            <p className="text-[11px] text-neutral-500">
              Dhaka, Bangladesh • Available Worldwide
            </p>
          </div>

          {/* Col 2: Direct Contact Points */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Direct Contact Lines
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href={`tel:${cleanPhoneNumber(profile.phone)}`}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{profile.phone} (Call / SMS)</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{profile.email}</span>
                </a>
              </li>
              {profile.messengerUrl && (
                <li>
                  <a
                    href={profile.messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Messenger Support</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Quick Portals */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Platform Portals
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenMyNfc}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Experience Owner's NFC Tap Card</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Master Administrator Hub</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
          <p>
            © {new Date().getFullYear()} {profile.fullName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Encrypted Private Smart NFC v3.0
            </span>
            <span>•</span>
            <span className="text-neutral-400">Fast & Modern</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
