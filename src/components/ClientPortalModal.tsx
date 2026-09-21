import { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Save,
  User,
  Phone,
  Mail,
  MessageSquare,
  Globe,
  MapPin,
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Camera,
  Upload,
  Home,
  Building2,
  Sparkles,
} from 'lucide-react';
import { UserProfile, SocialLink, ContactLine } from '../types';
import { findProfileByToken, updateProfile } from '../utils/storage';
import { ImageCropperModal } from './ImageCropperModal';
import { formatPhoneNumber, POPULAR_COUNTRIES } from '../utils/phoneFormatter';
import { getCountryFromPhoneNumber } from '../utils/countryFlags';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledToken?: string;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
  onViewCard: (slugOrToken: string) => void;
}

export function ClientPortalModal({
  isOpen,
  onClose,
  prefilledToken = '',
  onProfileUpdated,
  onViewCard,
}: ClientPortalModalProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Photo Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');

  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (prefilledToken) {
      setTokenInput(prefilledToken);
      const found = findProfileByToken(prefilledToken);
      if (found) {
        setActiveProfile(found);
        setFormData({ ...found });
        setErrorMsg('');
      }
    } else {
      setTokenInput('');
      setActiveProfile(null);
      setErrorMsg('');
    }
  }, [isOpen, prefilledToken]);

  if (!isOpen) return null;

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!tokenInput.trim()) {
      setErrorMsg('Please enter your secret Token Number (e.g. NFC-481923)');
      return;
    }

    const found = findProfileByToken(tokenInput.trim());
    if (!found) {
      setErrorMsg('No card found matching this Token number. Please check with your administrator.');
      return;
    }

    setActiveProfile(found);
    setFormData({ ...found });
  };

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    const list = [...(formData.socialLinks || [])];
    if (list[index]) {
      list[index] = { ...list[index], [field]: value };
      setFormData((prev) => ({ ...prev, socialLinks: list }));
    }
  };

  const handleAddSocial = () => {
    const list = [...(formData.socialLinks || [])];
    list.push({
      id: `s-${Date.now()}`,
      platform: 'facebook',
      label: 'Facebook',
      url: 'https://facebook.com',
    });
    setFormData((prev) => ({ ...prev, socialLinks: list }));
  };

  const handleRemoveSocial = (index: number) => {
    const list = [...(formData.socialLinks || [])];
    list.splice(index, 1);
    setFormData((prev) => ({ ...prev, socialLinks: list }));
  };

  const handleAddContactLine = () => {
    const list = [...(formData.contactLines || [])];
    list.push({
      id: `cl-${Date.now()}`,
      type: 'email',
      label: 'Office / Work Email',
      value: '',
    });
    setFormData((prev) => ({ ...prev, contactLines: list }));
  };

  const handleContactLineChange = (index: number, field: keyof ContactLine, value: string) => {
    const list = [...(formData.contactLines || [])];
    if (list[index]) {
      list[index] = { ...list[index], [field]: value };
      setFormData((prev) => ({ ...prev, contactLines: list }));
    }
  };

  const handleRemoveContactLine = (index: number) => {
    const list = [...(formData.contactLines || [])];
    list.splice(index, 1);
    setFormData((prev) => ({ ...prev, contactLines: list }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;

    const updated: UserProfile = {
      ...activeProfile,
      ...formData,
      socialLinks: formData.socialLinks !== undefined ? formData.socialLinks : activeProfile.socialLinks,
      contactLines: formData.contactLines !== undefined ? formData.contactLines : activeProfile.contactLines,
      updatedAt: new Date().toISOString(),
    };

    const ok = updateProfile(updated);
    if (ok) {
      setActiveProfile(updated);
      onProfileUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (cropType === 'avatar') {
      handleFieldChange('avatarUrl', croppedDataUrl);
    } else {
      handleFieldChange('coverUrl', croppedDataUrl);
    }
    setCropperOpen(false);
  };

  const cardShareUrl = activeProfile
    ? `${window.location.origin}${window.location.pathname}?card=${activeProfile.slug || activeProfile.token}`
    : '';

  const handleCopyLink = async () => {
    if (!cardShareUrl) return;
    try {
      await navigator.clipboard.writeText(cardShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="client-portal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="client-portal-modal"
        className="relative w-full max-w-2xl my-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Client Self-Service Portal
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Update your private NFC card information securely with your secret token
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {!activeProfile ? (
            /* Token verification view */
            <form onSubmit={handleVerifyToken} className="space-y-4 max-w-md mx-auto py-6">
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Enter Your Secret Token Number
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Your token was provided when your NFC card was issued (e.g., <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">NFC-481923</code>).
                  Only you can edit your card.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Secret Token / Card ID
                </label>
                <input
                  id="client-token-input"
                  type="text"
                  placeholder="e.g. NFC-481923"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider"
                  autoFocus
                />
              </div>

              <button
                id="verify-token-btn"
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Verify Token & Open Editor
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-neutral-400">
                  Demo hint: try token <strong className="font-mono text-neutral-600 dark:text-neutral-300">NFC-481923</strong> or <strong className="font-mono text-neutral-600 dark:text-neutral-300">NFC-930412</strong>
                </span>
              </div>
            </form>
          ) : (
            /* Active editor view */
            <form onSubmit={handleSave} className="space-y-6">
              {/* Quick status bar */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Logged in as: <strong>{activeProfile.fullName}</strong>
                  </span>
                  <span className="text-[10px] font-mono bg-white dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                    {activeProfile.token}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewCard(activeProfile.slug || activeProfile.token);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                  </button>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Card information saved successfully in real-time! All NFC taps will immediately reflect these updates.</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName || ''}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Job Designation / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation || ''}
                      onChange={(e) => handleFieldChange('designation', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => handleFieldChange('company', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Profile Headline
                    </label>
                    <input
                      type="text"
                      value={formData.headline || ''}
                      onChange={(e) => handleFieldChange('headline', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Profile Picture & Cover Image (Direct Upload & Crop System) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200 dark:border-neutral-750">
                  {/* Profile Picture Uploader */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Profile Picture (Avatar)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800 border-2 border-amber-500/50 overflow-hidden shadow-xs shrink-0 relative">
                        {formData.avatarUrl ? (
                          <img
                            src={formData.avatarUrl}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCropType('avatar');
                            setCropperOpen(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload & Crop Photo</span>
                        </button>
                        <input
                          type="text"
                          value={formData.avatarUrl || ''}
                          onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
                          placeholder="Or paste image URL"
                          className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Banner Uploader */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Background Cover Banner
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800 border-2 border-amber-500/50 overflow-hidden shadow-xs shrink-0 relative">
                        {formData.coverUrl ? (
                          <img
                            src={formData.coverUrl}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] text-center p-1 font-medium">
                            No Cover
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCropType('cover');
                            setCropperOpen(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-400 font-bold text-xs border border-amber-500/40 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload & Crop Banner</span>
                        </button>
                        <input
                          type="text"
                          value={formData.coverUrl || ''}
                          onChange={(e) => handleFieldChange('coverUrl', e.target.value)}
                          placeholder="Or paste cover URL"
                          className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio || ''}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Direct Contact & Tap Actions
                    </h3>
                    <p className="text-[11px] text-neutral-500">All fields are optional. Add what you want to share.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <span>Primary Mobile Number</span>
                        {formData.phone && (
                          <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                            <span>{getCountryFromPhoneNumber(formData.phone).flag}</span>
                            <span>{getCountryFromPhoneNumber(formData.phone).name}</span>
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      {formData.phone && (
                        <span className="absolute left-3 text-base select-none pointer-events-none">
                          {getCountryFromPhoneNumber(formData.phone).flag}
                        </span>
                      )}
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleFieldChange('phone', formatPhoneNumber(e.target.value))}
                        placeholder="+880 1700 000000"
                        className={`w-full py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                          formData.phone ? 'pl-9 pr-3' : 'px-3'
                        }`}
                      />
                    </div>
                    {/* Quick Country Code Shortcuts */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {POPULAR_COUNTRIES.slice(0, 5).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            const currentDigits = (formData.phone || '').replace(/[^\d]/g, '');
                            // If current digits start with old country code or 0, replace prefix
                            const updated = formatPhoneNumber(`${c.code} ${currentDigits.slice(-10)}`);
                            handleFieldChange('phone', updated);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-neutral-600 dark:text-neutral-400 cursor-pointer border border-neutral-200 dark:border-neutral-700"
                        >
                          {c.flag} {c.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <span>WhatsApp Number</span>
                        {formData.whatsapp && (
                          <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span>{getCountryFromPhoneNumber(formData.whatsapp).flag}</span>
                            <span>{getCountryFromPhoneNumber(formData.whatsapp).name}</span>
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      {formData.whatsapp && (
                        <span className="absolute left-3 text-base select-none pointer-events-none">
                          {getCountryFromPhoneNumber(formData.whatsapp).flag}
                        </span>
                      )}
                      <input
                        type="tel"
                        value={formData.whatsapp || ''}
                        onChange={(e) => handleFieldChange('whatsapp', formatPhoneNumber(e.target.value))}
                        placeholder="+880 1700 000000"
                        className={`w-full py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                          formData.whatsapp ? 'pl-9 pr-3' : 'px-3'
                        }`}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {POPULAR_COUNTRIES.slice(0, 5).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            const currentDigits = (formData.whatsapp || '').replace(/[^\d]/g, '');
                            const updated = formatPhoneNumber(`${c.code} ${currentDigits.slice(-10)}`);
                            handleFieldChange('whatsapp', updated);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-neutral-600 dark:text-neutral-400 cursor-pointer border border-neutral-200 dark:border-neutral-700"
                        >
                          {c.flag} {c.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <span>Office Telephone / Landline</span>
                        {formData.telephone && (
                          <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                            <span>{getCountryFromPhoneNumber(formData.telephone).flag}</span>
                            <span>{getCountryFromPhoneNumber(formData.telephone).name}</span>
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      {formData.telephone && (
                        <span className="absolute left-3 text-base select-none pointer-events-none">
                          {getCountryFromPhoneNumber(formData.telephone).flag}
                        </span>
                      )}
                      <input
                        type="tel"
                        value={formData.telephone || ''}
                        onChange={(e) => handleFieldChange('telephone', formatPhoneNumber(e.target.value))}
                        placeholder="+880 2 9876543"
                        className={`w-full py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                          formData.telephone ? 'pl-9 pr-3' : 'px-3'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                        <span>Work / Secondary Mobile Line</span>
                        {formData.phoneSecondary && (
                          <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                            <span>{getCountryFromPhoneNumber(formData.phoneSecondary).flag}</span>
                            <span>{getCountryFromPhoneNumber(formData.phoneSecondary).name}</span>
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      {formData.phoneSecondary && (
                        <span className="absolute left-3 text-base select-none pointer-events-none">
                          {getCountryFromPhoneNumber(formData.phoneSecondary).flag}
                        </span>
                      )}
                      <input
                        type="tel"
                        value={formData.phoneSecondary || ''}
                        onChange={(e) => handleFieldChange('phoneSecondary', formatPhoneNumber(e.target.value))}
                        placeholder="+880 1800 000000"
                        className={`w-full py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                          formData.phoneSecondary ? 'pl-9 pr-3' : 'px-3'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Primary Email Address <span className="text-[10px] text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Website URL <span className="text-[10px] text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl || ''}
                      onChange={(e) => handleFieldChange('websiteUrl', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Brand / Website Logo URL (Centered in QR Code & Cards)
                    </label>
                    <input
                      type="url"
                      value={formData.websiteLogoUrl || ''}
                      onChange={(e) => handleFieldChange('websiteLogoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png (leave empty to use profile picture)"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Dual Address Section */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>Dual Address (Work / Living & Home Address)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Present / Work Address</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        placeholder="e.g. Banani, Dhaka, Bangladesh"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Permanent / Home Address</span>
                      </label>
                      <input
                        type="text"
                        value={formData.permanentAddress || ''}
                        onChange={(e) => handleFieldChange('permanentAddress', e.target.value)}
                        placeholder="e.g. Cumilla, Bangladesh"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Extra Contact & Email Lines */}
                <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-500" />
                        <span>Multiple Numbers, Emails & Emergency Lines (+Add)</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Add extra Gmails (Work/Personal), Emergency contacts, or direct hotlines.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddContactLine}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Line</span>
                    </button>
                  </div>

                  {(!formData.contactLines || formData.contactLines.length === 0) && (
                    <div className="text-center py-3 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-400">
                      No extra contact lines yet. Click <strong>+ Add Line</strong> above to add secondary emails, emergency numbers, or office hotlines.
                    </div>
                  )}

                  <div className="space-y-2">
                    {(formData.contactLines || []).map((line, idx) => (
                      <div
                        key={line.id || idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                      >
                        <select
                          value={line.type}
                          onChange={(e) => {
                            const newType = e.target.value as ContactLine['type'];
                            handleContactLineChange(idx, 'type', newType);
                            // Auto-set label if default
                            if (newType === 'email') handleContactLineChange(idx, 'label', 'Work Gmail');
                            else if (newType === 'emergency') handleContactLineChange(idx, 'label', 'Emergency Hotline');
                            else if (newType === 'mobile') handleContactLineChange(idx, 'label', 'Alternative Mobile');
                            else if (newType === 'telephone') handleContactLineChange(idx, 'label', 'Office Telephone');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900 text-xs font-semibold"
                        >
                          <option value="email">✉️ Email (Gmail / Work)</option>
                          <option value="emergency">🚨 Emergency Contact</option>
                          <option value="mobile">📱 Mobile Number</option>
                          <option value="work">💼 Work / Office Line</option>
                          <option value="whatsapp">💬 WhatsApp Line</option>
                          <option value="telephone">☎️ Telephone / Desk</option>
                          <option value="hotline">🔥 24/7 Hotline</option>
                          <option value="other">⭐ Other Info</option>
                        </select>

                        <input
                          type="text"
                          value={line.label}
                          onChange={(e) => handleContactLineChange(idx, 'label', e.target.value)}
                          placeholder="Label (e.g. Office Gmail / Emergency)"
                          className="w-full sm:w-1/3 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-xs"
                        />

                        <div className="flex-1 relative flex items-center">
                          {line.type !== 'email' && line.value && (
                            <span
                              className="absolute left-2.5 text-sm select-none pointer-events-none"
                              title={`${getCountryFromPhoneNumber(line.value).name} (${getCountryFromPhoneNumber(line.value).dialCode})`}
                            >
                              {getCountryFromPhoneNumber(line.value).flag}
                            </span>
                          )}
                          <input
                            type={line.type === 'email' ? 'email' : 'text'}
                            value={line.value}
                            onChange={(e) => {
                              const val = line.type === 'email' ? e.target.value : formatPhoneNumber(e.target.value);
                              handleContactLineChange(idx, 'value', val);
                            }}
                            placeholder={line.type === 'email' ? 'office@company.com' : '+880 1700 000000'}
                            className={`w-full py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-xs font-mono ${
                              line.type !== 'email' && line.value ? 'pl-8 pr-2.5' : 'px-2.5'
                            }`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveContactLine(idx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer self-end sm:self-auto"
                          title="Remove Line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Social Media Profiles (Automatic Update on Tap)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Social Link</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.socialLinks || []).map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/40"
                    >
                      <select
                        value={link.platform}
                        onChange={(e) => handleSocialChange(idx, 'platform', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs font-medium capitalize focus:outline-hidden"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="youtube">YouTube</option>
                        <option value="telegram">Telegram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="fiverr">Fiverr</option>
                        <option value="maps">Google Maps</option>
                        <option value="dribbble">Dribbble</option>
                        <option value="behance">Behance</option>
                        <option value="discord">Discord</option>
                        <option value="pinterest">Pinterest</option>
                        <option value="spotify">Spotify</option>
                        <option value="website">Website</option>
                        <option value="other">Custom / Other Link</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Label (e.g. Facebook Profile)"
                        value={link.label}
                        onChange={(e) => handleSocialChange(idx, 'label', e.target.value)}
                        className="w-32 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs"
                      />

                      <input
                        type="url"
                        required
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleSocialChange(idx, 'url', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-xs font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveSocial(idx)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                        title="Delete Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theme color preference */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Card Accent Color
                </label>
                <div className="flex gap-2">
                  {(['amber', 'indigo', 'emerald', 'rose', 'sky', 'violet', 'cyan'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleFieldChange('themeColor', color)}
                      className={`w-7 h-7 rounded-full capitalize border-2 transition-transform cursor-pointer ${
                        formData.themeColor === color ? 'scale-110 border-neutral-900 dark:border-white shadow-md ring-2 ring-offset-2 ring-amber-500/50' : 'border-transparent opacity-75 hover:opacity-100'
                      } ${
                        color === 'amber'
                          ? 'bg-amber-500'
                          : color === 'indigo'
                          ? 'bg-indigo-600'
                          : color === 'emerald'
                          ? 'bg-emerald-600'
                          : color === 'rose'
                          ? 'bg-rose-600'
                          : color === 'sky'
                          ? 'bg-sky-500'
                          : color === 'cyan'
                          ? 'bg-cyan-500'
                          : 'bg-violet-600'
                      }`}
                      title={color === 'amber' ? 'Amber (Default Gold/Orange)' : color}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProfile(null);
                    setTokenInput('');
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                >
                  Log Out of Editor
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Close
                  </button>

                  <button
                    id="client-save-changes-btn"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes Now</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Direct Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        cropType={cropType}
        initialImageSrc={cropType === 'avatar' ? formData.avatarUrl : formData.coverUrl}
        title={cropType === 'avatar' ? 'Crop & Upload Profile Picture' : 'Crop & Upload Cover Banner'}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
