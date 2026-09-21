import { useState } from 'react';
import {
  CreditCard,
  KeyRound,
  Shield,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from '../types';
import { getAdminSettings, getAdminPin } from '../utils/storage';

interface NavbarProps {
  primaryProfile: UserProfile;
  onOpenMyNfc: () => void;
  onOpenClientPortal: () => void;
  onOpenAdmin: () => void;
}

export function Navbar({
  primaryProfile,
  onOpenMyNfc,
  onOpenClientPortal,
  onOpenAdmin,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const adminSettings = getAdminSettings();

  const handleNfcClick = () => {
    if (adminSettings.isNfcPublicButtonLocked) {
      const pin = window.prompt('NFC Button is locked by Administrator. Enter Admin PIN to proceed:');
      if (pin && pin.trim() === getAdminPin()) {
        onOpenMyNfc();
      } else if (pin !== null) {
        alert('Incorrect Admin PIN. Access Denied.');
      }
      return;
    }
    onOpenMyNfc();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {adminSettings.websiteLogoUrl ? (
            <img
              src={adminSettings.websiteLogoUrl}
              alt={adminSettings.websiteName || primaryProfile.fullName}
              className="w-9 h-9 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform border border-indigo-500/30"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white">
                {adminSettings.websiteName || primaryProfile.fullName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                NFC PRO
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <a href="#about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            About
          </a>
          <a href="#services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Services
          </a>
          <a href="#projects" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Projects
          </a>
          <a href="#skills" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Skills
          </a>
          <a href="#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Contact
          </a>
        </nav>

        {/* Actions (NFC Card, Admin, Theme) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <ThemeToggle />

          <button
            id="nav-my-nfc-btn"
            onClick={handleNfcClick}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 ${
              adminSettings.isNfcPublicButtonLocked
                ? 'bg-neutral-800 text-amber-400 border border-amber-500/40 hover:bg-neutral-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {adminSettings.isNfcPublicButtonLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>NFC (Locked)</span>
              </>
            ) : (
              <>
                <CreditCard className="w-3.5 h-3.5" />
                <span>My NFC Card</span>
              </>
            )}
          </button>

          <button
            id="nav-admin-btn"
            onClick={onOpenAdmin}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Admin Hub (Password Protected)"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNfcClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs"
            >
              {adminSettings.isNfcPublicButtonLocked ? (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>NFC (Locked)</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>My NFC Card</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col space-y-2 pt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              About
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Services & NFC
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Projects
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Skills
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Contact
            </a>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
            <span>Admin Console:</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Open Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
