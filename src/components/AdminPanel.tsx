import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Copy,
  Check,
  Eye,
  ExternalLink,
  Lock,
  Unlock,
  LogOut,
  Sparkles,
  Users,
  CreditCard,
  Layers,
  Save,
  CheckCircle,
  X,
  Clock,
  Ban,
  Calendar,
  Radio,
  SlidersHorizontal,
  RefreshCw,
  Database,
  Download,
  Key,
  ShieldCheck,
  UserCheck,
  Server,
  Activity,
  Globe,
  Image as ImageIcon,
  GitBranch,
  ArrowRightLeft,
  Code,
  ChevronDown,
  ChevronUp,
  Terminal,
  Upload,
} from 'lucide-react';
import JSZip from 'jszip';
import { UserProfile, AdminSettings, FirebaseKeyConfig } from '../types';
import {
  getStoredProfiles,
  searchProfiles,
  createNewProfile,
  updateProfile,
  deleteProfile,
  getProfileValidityInfo,
  toggleBlockProfile,
  renewProfileValidity,
  getAdminSettings,
  saveAdminSettings,
  getCardNfcWriteUrl,
  computeExpiryDate,
  getAdminAuth,
  saveAdminAuth,
  verifyAdminAuth,
  getFirebaseKeys,
  saveFirebaseKeys,
  resetProfileTapCount,
  isCardUserIdAvailable,
  generateNextAksId,
} from '../utils/storage';
import { getFirebaseKeysFromIndexedDB, checkIndexedDBStatus } from '../utils/indexedDb';
import { syncProfilesToFirebase, testFirebaseConnection } from '../utils/firebaseRealtime';
import { optimizeLogoImage, optimizeAvatarImage } from '../utils/imageOptimizer';
import { getCountryFromPhoneNumber } from '../utils/countryFlags';
import { QrCodeModal } from './QrCodeModal';
import { LegacyRedirectsTab } from './LegacyRedirectsTab';

interface AdminPanelProps {
  onClose: () => void;
  onViewCard: (slugOrToken: string) => void;
  onProfilesChanged: () => void;
}

export function AdminPanel({ onClose, onViewCard, onProfilesChanged }: AdminPanelProps) {
  // Authentication State
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Navigation Tab inside Admin
  const [activeTab, setActiveTab] = useState<'cards' | 'analytics' | 'branding' | 'firebase' | 'legacy' | 'security' | 'netlify'>('cards');

  // Admin settings
  const [adminSettings, setAdminSettingsState] = useState<AdminSettings>(() => getAdminSettings());

  // Website Branding State
  const [brandForm, setBrandForm] = useState({
    websiteName: adminSettings.websiteName || 'NexTech NFC PRO',
    websiteLogoUrl: adminSettings.websiteLogoUrl || '',
  });
  const [brandSavedMsg, setBrandSavedMsg] = useState(false);

  // Profiles list and search
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getStoredProfiles());

  // Modals & operations
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrModalProfile, setQrModalProfile] = useState<UserProfile | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedNfcUrl, setCopiedNfcUrl] = useState<string | null>(null);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);
  const [userIdConflictError, setUserIdConflictError] = useState('');

  // Firebase 5-Slot Configuration State
  const [firebaseKeys, setFirebaseKeys] = useState<FirebaseKeyConfig[]>(() => getFirebaseKeys());
  const [firebaseSavedMsg, setFirebaseSavedMsg] = useState(false);
  const [rawFirebaseCode, setRawFirebaseCode] = useState('');
  const [targetPasteSlot, setTargetPasteSlot] = useState<number>(0);
  const [codeParseMsg, setCodeParseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingFirebaseConn, setTestingFirebaseConn] = useState(false);
  const [testConnResult, setTestConnResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [expandedSlotIndex, setExpandedSlotIndex] = useState<number | null>(0);
  const [copiedSlotKeyField, setCopiedSlotKeyField] = useState<string | null>(null);

  // Per-slot Firebase Code inputs and states
  const [slotCodeInputs, setSlotCodeInputs] = useState<{ [key: number]: string }>({});
  const [showAdvancedSlotFields, setShowAdvancedSlotFields] = useState<{ [key: number]: boolean }>({});
  const [slotCodeSavedMsg, setSlotCodeSavedMsg] = useState<{ [key: number]: { type: 'success' | 'error'; text: string } | null }>({});

  // IndexedDB connection status
  const [idbStatus, setIdbStatus] = useState<{
    connected: boolean;
    dbName: string;
    version: number;
    profileCount: number;
  } | null>(null);

  useEffect(() => {
    checkIndexedDBStatus().then((res) => {
      setIdbStatus(res);
    }).catch(() => {});
  }, [profiles]);

  // Re-hydrate Firebase keys from IndexedDB on mount to prevent any accidental deletion
  useEffect(() => {
    getFirebaseKeysFromIndexedDB().then((idbKeys) => {
      if (idbKeys && idbKeys.length > 0) {
        const hasValidKey = idbKeys.some((k) => k.apiKey && k.apiKey.trim().length > 5);
        if (hasValidKey) {
          setFirebaseKeys(idbKeys);
          saveFirebaseKeys(idbKeys);
        }
      }
    }).catch(() => {});
  }, []);

  // Security Credentials Form State
  const [secForm, setSecForm] = useState({
    newUsername: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [secMsg, setSecMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Netlify Export State
  const [isExportingNetlify, setIsExportingNetlify] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // New card form state (with unique User ID & Password per user)
  const [newCardData, setNewCardData] = useState({
    fullName: '',
    designation: '',
    company: '',
    phone: '',
    phoneSecondary: '',
    whatsapp: '',
    email: '',
    bio: '',
    address: '',
    permanentAddress: '',
    websiteUrl: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    themeColor: 'amber' as const,
    validityType: 'lifetime' as UserProfile['validityType'],
    customDays: 316,
    ownerPin: '1234',
    ownerUserId: '',
    ownerPassword: '1234',
  });

  const refreshList = () => {
    const list = searchQuery ? searchProfiles(searchQuery) : getStoredProfiles();
    setProfiles(list);
    onProfilesChanged();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminAuth(usernameInput, passwordInput)) {
      setIsAdminAuth(true);
      setLoginError('');
      // Pre-fill change username form with current username
      const cur = getAdminAuth();
      setSecForm((prev) => ({ ...prev, newUsername: cur.username }));
    } else {
      setLoginError('Invalid Username or Password. Please verify your credentials.');
    }
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setProfiles(getStoredProfiles());
    } else {
      setProfiles(searchProfiles(q));
    }
  };

  const handleToggleNfcPublicLock = () => {
    const updated = {
      ...adminSettings,
      isNfcPublicButtonLocked: !adminSettings.isNfcPublicButtonLocked,
    };
    setAdminSettingsState(updated);
    saveAdminSettings(updated);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    setUserIdConflictError('');
    if (!newCardData.fullName.trim() || !newCardData.phone.trim()) {
      alert('Full Name and Phone Number are required.');
      return;
    }

    if (newCardData.ownerUserId.trim()) {
      if (!isCardUserIdAvailable(newCardData.ownerUserId.trim())) {
        setUserIdConflictError('This User ID is already taken by another card! Every User ID must be unique.');
        return;
      }
    }

    const expiryDate = computeExpiryDate(newCardData.validityType || 'lifetime', newCardData.customDays);

    const created = createNewProfile({
      fullName: newCardData.fullName,
      designation: newCardData.designation,
      company: newCardData.company,
      phone: newCardData.phone,
      phoneSecondary: newCardData.phoneSecondary,
      whatsapp: newCardData.whatsapp || newCardData.phone,
      email: newCardData.email,
      bio: newCardData.bio,
      address: newCardData.address,
      permanentAddress: newCardData.permanentAddress,
      websiteUrl: newCardData.websiteUrl,
      avatarUrl: newCardData.avatarUrl,
      coverUrl: newCardData.coverUrl,
      themeColor: newCardData.themeColor,
      validityType: newCardData.validityType,
      customDays: newCardData.customDays,
      expiryDate,
      ownerPin: newCardData.ownerPin || '1234',
      ownerUserId: newCardData.ownerUserId.trim(),
      ownerPassword: newCardData.ownerPassword.trim() || '1234',
    });

    setShowAddModal(false);
    setNewCardData({
      fullName: '',
      designation: '',
      company: '',
      phone: '',
      phoneSecondary: '',
      whatsapp: '',
      email: '',
      bio: '',
      address: '',
      permanentAddress: '',
      websiteUrl: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      themeColor: 'amber' as const,
      validityType: 'lifetime',
      customDays: 316,
      ownerPin: '1234',
      ownerUserId: '',
      ownerPassword: '1234',
    });
    refreshList();
    alert(`Success! Created new NFC card for ${created.fullName} with Token: ${created.token}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    if (editingProfile.ownerUserId && editingProfile.ownerUserId.trim()) {
      if (!isCardUserIdAvailable(editingProfile.ownerUserId.trim(), editingProfile.id)) {
        alert('This User ID is already assigned to another card. Every User ID must be unique.');
        return;
      }
    }

    updateProfile(editingProfile);
    setEditingProfile(null);
    refreshList();
  };

  const handleSaveBrandSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...adminSettings,
      websiteName: brandForm.websiteName.trim(),
      websiteLogoUrl: brandForm.websiteLogoUrl.trim(),
    };
    setAdminSettingsState(updated);
    saveAdminSettings(updated);
    if (updated.websiteName) {
      document.title = `${updated.websiteName} - Smart Contactless Digital Business Card`;
    }
    setBrandSavedMsg(true);
    setTimeout(() => setBrandSavedMsg(false), 3000);
    onProfilesChanged();
  };

  const handleDeleteCard = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}'s NFC card?`)) {
      deleteProfile(id);
      refreshList();
    }
  };

  const handleToggleBlock = (id: string) => {
    toggleBlockProfile(id);
    refreshList();
  };

  const handleResetScans = (id: string, name: string) => {
    if (window.confirm(`Reset scan count for ${name} to 0?`)) {
      resetProfileTapCount(id);
      refreshList();
    }
  };

  const handleCopyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyNfcWriteUrl = async (profile: UserProfile) => {
    const url = getCardNfcWriteUrl(profile);
    await navigator.clipboard.writeText(url);
    setCopiedNfcUrl(profile.id);
    setTimeout(() => setCopiedNfcUrl(null), 2000);
  };

  // Firebase 5-Slot Key Manager handlers
  const handleUpdateFirebaseSlot = (slotIndex: number, field: keyof FirebaseKeyConfig, value: any) => {
    const updated = [...firebaseKeys];
    updated[slotIndex] = { ...updated[slotIndex], [field]: value };
    setFirebaseKeys(updated);
  };

  const handleSetActiveFirebaseSlot = (slotIndex: number) => {
    const updated = firebaseKeys.map((k, idx) => ({
      ...k,
      status: (idx === slotIndex ? 'active' : k.apiKey ? 'standby' : 'disabled') as FirebaseKeyConfig['status'],
    }));
    setFirebaseKeys(updated);
    saveFirebaseKeys(updated);
    setFirebaseSavedMsg(true);
    setTimeout(() => setFirebaseSavedMsg(false), 2500);
  };

  const handleSaveAllFirebaseKeys = async () => {
    saveFirebaseKeys(firebaseKeys);
    // Realtime sync all profiles to Firebase Firestore cloud database
    await syncProfilesToFirebase(getStoredProfiles());
    setFirebaseSavedMsg(true);
    setTimeout(() => setFirebaseSavedMsg(false), 2500);
  };

  // Auto-parse raw Firebase snippet from console (JS code or JSON) and fill into target slot
  const handleParseFirebaseCode = () => {
    if (!rawFirebaseCode.trim()) {
      setCodeParseMsg({ type: 'error', text: 'Please paste the Firebase configuration code into the box first.' });
      return;
    }

    const extractValue = (key: string): string => {
      // Matches: apiKey: "...", "apiKey": "...", apiKey: '...', or apiKey = "..."
      const regex = new RegExp(`['"]?${key}['"]?\\s*[:=]\\s*['"]([^'"]+)['"]`, 'i');
      const match = rawFirebaseCode.match(regex);
      return match ? match[1].trim() : '';
    };

    const extractedApiKey = extractValue('apiKey');
    const extractedAuthDomain = extractValue('authDomain');
    const extractedProjectId = extractValue('projectId');
    const extractedStorageBucket = extractValue('storageBucket');
    const extractedMessagingSenderId = extractValue('messagingSenderId');
    const extractedAppId = extractValue('appId');
    const extractedMeasurementId = extractValue('measurementId');

    if (!extractedApiKey && !extractedProjectId && !extractedAppId) {
      setCodeParseMsg({
        type: 'error',
        text: 'Could not detect apiKey, projectId, or appId in pasted snippet. Make sure to paste the full firebaseConfig = { ... } code.',
      });
      return;
    }

    const updated = [...firebaseKeys];
    const currentSlot = updated[targetPasteSlot] || updated[0];

    updated[targetPasteSlot] = {
      ...currentSlot,
      apiKey: extractedApiKey || currentSlot.apiKey,
      authDomain: extractedAuthDomain || currentSlot.authDomain,
      projectId: extractedProjectId || currentSlot.projectId,
      storageBucket: extractedStorageBucket || currentSlot.storageBucket,
      messagingSenderId: extractedMessagingSenderId || currentSlot.messagingSenderId,
      appId: extractedAppId || currentSlot.appId,
      measurementId: extractedMeasurementId || currentSlot.measurementId,
      status: currentSlot.status === 'disabled' ? 'active' : currentSlot.status,
    };

    setFirebaseKeys(updated);
    saveFirebaseKeys(updated);
    setExpandedSlotIndex(targetPasteSlot);
    setCodeParseMsg({
      type: 'success',
      text: `Code parsed successfully! All keys filled into Slot #${targetPasteSlot + 1} (${updated[targetPasteSlot].label}).`,
    });
    setRawFirebaseCode('');
    setTimeout(() => setCodeParseMsg(null), 4000);
  };

  // Format any slot's config into a clean JavaScript code snippet
  const formatFirebaseCode = (slot: FirebaseKeyConfig): string => {
    if (!slot.apiKey && !slot.projectId) return '';
    return `const firebaseConfig = {
  apiKey: "${slot.apiKey || ''}",
  authDomain: "${slot.authDomain || (slot.projectId ? `${slot.projectId}.firebaseapp.com` : '')}",
  projectId: "${slot.projectId || ''}",
  storageBucket: "${slot.storageBucket || (slot.projectId ? `${slot.projectId}.firebasestorage.app` : '')}",
  messagingSenderId: "${slot.messagingSenderId || ''}",
  appId: "${slot.appId || ''}"${slot.measurementId ? `,\n  measurementId: "${slot.measurementId}"` : ''}
};`;
  };

  // Save & Apply code directly inside ANY individual slot
  const handleSaveSlotCode = (slotIdx: number) => {
    const curSlot = firebaseKeys[slotIdx] || firebaseKeys[0];
    const rawInput = slotCodeInputs[slotIdx] !== undefined ? slotCodeInputs[slotIdx] : formatFirebaseCode(curSlot);
    const code = (rawInput || '').trim();

    if (!code) {
      setSlotCodeSavedMsg((prev) => ({
        ...prev,
        [slotIdx]: { type: 'error', text: 'Please paste the Firebase configuration code snippet into this box first.' },
      }));
      return;
    }

    const extractValue = (key: string): string => {
      const regex = new RegExp(`['"]?${key}['"]?\\s*[:=]\\s*['"]([^'"]+)['"]`, 'i');
      const match = code.match(regex);
      return match ? match[1].trim() : '';
    };

    const extractedApiKey = extractValue('apiKey');
    const extractedAuthDomain = extractValue('authDomain');
    const extractedProjectId = extractValue('projectId');
    const extractedStorageBucket = extractValue('storageBucket');
    const extractedMessagingSenderId = extractValue('messagingSenderId');
    const extractedAppId = extractValue('appId');
    const extractedMeasurementId = extractValue('measurementId');

    if (!extractedApiKey && !extractedProjectId) {
      setSlotCodeSavedMsg((prev) => ({
        ...prev,
        [slotIdx]: {
          type: 'error',
          text: 'Could not detect apiKey or projectId in the code snippet. Make sure to paste the full firebaseConfig = { ... } code.',
        },
      }));
      return;
    }

    const updated = [...firebaseKeys];
    const currentSlot = updated[slotIdx] || updated[0];

    updated[slotIdx] = {
      ...currentSlot,
      apiKey: extractedApiKey || currentSlot.apiKey,
      authDomain: extractedAuthDomain || (extractedProjectId ? `${extractedProjectId}.firebaseapp.com` : currentSlot.authDomain),
      projectId: extractedProjectId || currentSlot.projectId,
      storageBucket: extractedStorageBucket || (extractedProjectId ? `${extractedProjectId}.firebasestorage.app` : currentSlot.storageBucket),
      messagingSenderId: extractedMessagingSenderId || currentSlot.messagingSenderId,
      appId: extractedAppId || currentSlot.appId,
      measurementId: extractedMeasurementId || currentSlot.measurementId,
      status: currentSlot.status === 'disabled' ? 'active' : currentSlot.status,
    };

    setFirebaseKeys(updated);
    saveFirebaseKeys(updated);
    setSlotCodeSavedMsg((prev) => ({
      ...prev,
      [slotIdx]: {
        type: 'success',
        text: `Slot #${slotIdx + 1} code applied successfully! Connected to Firebase project "${updated[slotIdx].projectId}".`,
      },
    }));
    setTimeout(() => {
      setSlotCodeSavedMsg((prev) => ({ ...prev, [slotIdx]: null }));
    }, 4000);
  };

  // Test Real-time Connection
  const handleTestFirebaseConnection = async () => {
    setTestingFirebaseConn(true);
    setTestConnResult(null);
    try {
      const activeSlot = firebaseKeys.find((k) => k.status === 'active') || firebaseKeys[0];
      if (!activeSlot || !activeSlot.apiKey || !activeSlot.projectId) {
        setTestConnResult({
          success: false,
          msg: 'Please configure at least an API Key and Project ID in the active slot.',
        });
        setTestingFirebaseConn(false);
        return;
      }
      const syncOk = await syncProfilesToFirebase(getStoredProfiles());
      if (syncOk) {
        setTestConnResult({
          success: true,
          msg: `Realtime Firestore Connection Successful! Connected to project "${activeSlot.projectId}" with live bidirectional sync enabled.`,
        });
      } else {
        setTestConnResult({
          success: false,
          msg: `Unable to connect to Firestore project "${activeSlot.projectId}". Please check if Firestore database is created in test/production mode in Firebase Console.`,
        });
      }
    } catch (err: any) {
      setTestConnResult({
        success: false,
        msg: `Connection error: ${err?.message || 'Failed to ping Firebase Firestore.'}`,
      });
    } finally {
      setTestingFirebaseConn(false);
    }
  };

  const handleSimulateQuotaFailover = (fromSlotIdx: number) => {
    const updated = [...firebaseKeys];
    updated[fromSlotIdx].status = 'quota_exhausted';

    // Find next available slot
    const nextSlotIdx = updated.findIndex((k, idx) => idx !== fromSlotIdx && k.apiKey && k.status !== 'quota_exhausted');
    if (nextSlotIdx !== -1) {
      updated[nextSlotIdx].status = 'active';
      alert(`Auto-Failover Activated! Slot #${fromSlotIdx + 1} marked as Quota Exhausted. Traffic automatically routed to Slot #${nextSlotIdx + 1} (${updated[nextSlotIdx].label}) without downtime.`);
    } else {
      alert(`Warning: No backup Firebase slot with a valid API key found. Please add keys to standby slots.`);
    }
    setFirebaseKeys(updated);
    saveFirebaseKeys(updated);
  };

  // Security Form Handler
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecMsg(null);

    const currentAuth = getAdminAuth();

    // Verify current password first
    if (secForm.oldPassword !== currentAuth.passwordHash) {
      setSecMsg({ type: 'error', text: 'Current Password does not match. Verification failed.' });
      return;
    }

    if (!secForm.newUsername.trim()) {
      setSecMsg({ type: 'error', text: 'User ID cannot be empty.' });
      return;
    }

    if (secForm.newPassword) {
      if (secForm.newPassword !== secForm.confirmPassword) {
        setSecMsg({ type: 'error', text: 'New Password and Confirm Password do not match.' });
        return;
      }
      if (secForm.newPassword.length < 4) {
        setSecMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
        return;
      }
    }

    const updatedAuth = {
      username: secForm.newUsername.trim(),
      passwordHash: secForm.newPassword ? secForm.newPassword.trim() : currentAuth.passwordHash,
      updatedAt: new Date().toISOString(),
    };

    saveAdminAuth(updatedAuth);
    setSecMsg({ type: 'success', text: 'Admin User ID & Password successfully updated and saved!' });
    setSecForm({
      newUsername: updatedAuth.username,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  // Netlify ZIP Export
  const handleDownloadNetlifyPackage = async () => {
    setIsExportingNetlify(true);
    try {
      const zip = new JSZip();

      // 1. _redirects file for Netlify Single Page Application (SPA) routing
      zip.file('_redirects', '/*    /index.html   200\n');

      // 2. netlify.toml configuration
      const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
      zip.file('netlify.toml', netlifyToml);

      // 3. Deployment Instructions README.md with GitHub and Netlify linkup workflow
      const readme = `# NFC Digital Smart Card - GitHub & Netlify Deployment Package

Generated on: ${new Date().toLocaleString()}
Website Name: ${adminSettings.websiteName || 'NexTech NFC PRO'}

============================================================
HOW TO UPLOAD TO GITHUB AND LINK WITH NETLIFY (STEP-BY-STEP)
============================================================

### STEP 1: Push Project to Your GitHub Repository
1. Open terminal inside the unzipped project folder.
2. Run the following Git commands:
   git init
   git add .
   git commit -m "feat: NFC Smart Card App with Firebase failover and unique credentials"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main

### STEP 2: Link GitHub to Netlify
1. Log in to Netlify (https://app.netlify.com).
2. Click "Add new site" -> "Import an existing project".
3. Select "GitHub" and authorize access to your repository.
4. Select the repository you just created.
5. The included netlify.toml and _redirects will auto-configure everything:
   - Build command: npm run build
   - Publish directory: dist
6. Click "Deploy site".

Every time you commit changes to your GitHub main branch, Netlify will automatically rebuild and deploy your site live!

## Current Snapshot Info:
- Total Cards: ${profiles.length}
- Multi-Key Failover: Configured with 5 Firebase Slots
`;
      zip.file('README.md', readme);

      // 4. JSON snapshot of current cards
      zip.file('nfc-profiles-backup.json', JSON.stringify(profiles, null, 2));

      // 5. Firebase active slots configuration backup
      zip.file('firebase-slots-config.json', JSON.stringify(firebaseKeys, null, 2));

      // Generate the zip blob and trigger direct browser download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfc-card-netlify-deploy-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (err) {
      console.error('Failed to generate Netlify package:', err);
      alert('Error generating Netlify zip package. Please try again.');
    } finally {
      setIsExportingNetlify(false);
    }
  };

  // Compute stats
  const totalCards = profiles.length;
  const activeCards = profiles.filter((p) => getProfileValidityInfo(p).canAccess).length;
  const blockedCards = profiles.filter((p) => p.isBlocked).length;
  const totalScans = profiles.reduce((sum, p) => sum + (p.tapCount || 0), 0);

  // ================= VIEW: LOGIN SCREEN IF NOT AUTHENTICATED =================
  if (!isAdminAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 mb-3 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              NFC Master Admin Panel
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
              Secure authentication required to manage client NFC cards, Firebase API keys, and scan analytics.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Admin User ID
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-username-input"
                  type="text"
                  required
                  placeholder="Enter Admin User ID"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password-input"
                  type="password"
                  required
                  placeholder="Enter Password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                />
              </div>
              {loginError && (
                <p className="text-rose-500 text-xs mt-1.5 font-medium">{loginError}</p>
              )}
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              Sign In to Master Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= VIEW: AUTHENTICATED ADMIN DASHBOARD =================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-5xl h-[92vh] bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header with Brand & Tab Navigation */}
        <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white">
                  NFC Master Admin Hub
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  User: {getAdminAuth().username}
                </span>
                {/* Local IndexedDB Server: Golden / Orange */}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3 text-amber-500" />
                  <span>IndexedDB: Connected ({idbStatus?.dbName || 'aks316_nfc_db'})</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </span>

                {/* Firebase Cloud Status: Green when configured/live, Standby otherwise */}
                {firebaseKeys.some((k) => k.status === 'active' && !!k.apiKey?.trim()) ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-400" />
                    <span>Firebase: Live Cloud Synced</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-500/15 text-neutral-400 border border-neutral-500/30 flex items-center gap-1" title="Firebase cloud keys not entered yet. Operating 100% safely on local IndexedDB server.">
                    <Radio className="w-3 h-3 text-neutral-400" />
                    <span>Firebase: Standby (Local Active)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage NFC cards, 5-slot Firebase failover keys, scan analytics, and Netlify package.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextId = generateNextAksId();
                setNewCardData({
                  fullName: '',
                  designation: '',
                  company: '',
                  phone: '',
                  phoneSecondary: '',
                  whatsapp: '',
                  email: '',
                  bio: '',
                  address: '',
                  permanentAddress: '',
                  websiteUrl: '',
                  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80',
                  coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                  themeColor: 'amber',
                  validityType: 'lifetime',
                  customDays: 316,
                  ownerPin: '1234',
                  ownerUserId: nextId.ownerUserId.toLowerCase(),
                  ownerPassword: '1234',
                });
                setUserIdConflictError('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Card</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('netlify')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-indigo-400/30 shrink-0"
              title="Download GitHub & Netlify Full Deployment Bundle (.ZIP)"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">GitHub & Netlify Download</span>
              <span className="sm:hidden">Download</span>
            </button>

            <button
              onClick={() => setIsAdminAuth(false)}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Lock / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>NFC Cards ({totalCards})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Scan Analytics ({totalScans} Taps)</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'branding'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website & Branding</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Keys (5 Slots)</span>
          </button>

          <button
            onClick={() => setActiveTab('legacy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'legacy'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Legacy NFC & QR Bridge</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'netlify'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black shadow-md ring-2 ring-indigo-400'
                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>GitHub & Netlify Download</span>
          </button>
        </div>

        {/* ================= TAB 1: CARDS MANAGEMENT ================= */}
        {activeTab === 'cards' && (
          <div className="flex-1 flex flex-col overflow-hidden pt-3">
            {/* Top Control Center: Stats Overview & Public Button Lock Toggle */}
            <div className="pb-3 grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[11px] text-neutral-500">Total Cards</span>
                <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">{totalCards}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Active / Live</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCards}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[11px] text-rose-600 dark:text-rose-400">Blocked / Locked</span>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">{blockedCards}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[11px] text-amber-600 dark:text-amber-400">Total Verified Taps</span>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{totalScans}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-2xl bg-neutral-900 text-neutral-100 border border-neutral-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Main NFC Button</span>
                  {adminSettings.isNfcPublicButtonLocked ? (
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <button
                  onClick={handleToggleNfcPublicLock}
                  className={`mt-1 text-[11px] font-bold py-1 px-2 rounded-lg transition-all cursor-pointer ${
                    adminSettings.isNfcPublicButtonLocked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {adminSettings.isNfcPublicButtonLocked ? 'Locked (Protected)' : 'Unlocked (Active)'}
                </button>
              </div>
            </div>

            {/* Quick Deploy Banner */}
            <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-blue-950/50 to-neutral-900/90 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Deploy to Netlify or Push to GitHub</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">Export Ready</span>
                  </p>
                  <p className="text-[11px] text-neutral-400">Download complete package with preconfigured _redirects, netlify.toml & cards snapshot</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadNetlifyPackage}
                  disabled={isExportingNetlify}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingNetlify ? 'Exporting...' : 'Download (.ZIP)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('netlify')}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline px-1 cursor-pointer"
                >
                  View Steps
                </button>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="pb-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-search-input"
                  type="text"
                  placeholder="Search by Client Name, Token (e.g. NFC-481923), Phone, or Designation..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Cards Table List with Real-Time Expiry Countdown and Privacy Isolation */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {profiles.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  No NFC cards found matching "{searchQuery}".
                </div>
              ) : (
                profiles.map((p) => {
                  const validityInfo = getProfileValidityInfo(p);
                  const isOwner = p.isPrimaryOwner;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs ${
                        p.isBlocked
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : validityInfo.isExpired
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40'
                      }`}
                    >
                      {/* Left: Avatar + Details + Expiry Badges */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-700 shrink-0 border border-neutral-300 dark:border-neutral-700">
                          <img
                            src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                            alt={p.fullName}
                            className="w-full h-full object-cover"
                          />
                          {isOwner && (
                            <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-[8px] font-extrabold text-neutral-950 text-center py-0.5">
                              OWNER
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                              {p.fullName}
                            </h4>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600">
                              ID: {p.slug || p.token}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              {p.tapCount || 0} scans
                            </span>
                          </div>

                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{p.designation} {p.company ? `• ${p.company}` : ''}</span>
                            {p.phone && (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                                <span>•</span>
                                <span className="text-sm select-none">{getCountryFromPhoneNumber(p.phone).flag}</span>
                                <span>{p.phone}</span>
                              </span>
                            )}
                          </p>

                          {/* Expiry Badge */}
                          <div className="flex items-center gap-2 mt-1.5">
                            {p.isBlocked ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <Ban className="w-3 h-3" />
                                <span>BLOCKED</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>Lifetime Access</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                        {/* QR Code */}
                        <button
                          onClick={() => setQrModalProfile(p)}
                          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Copy Token */}
                        <button
                          onClick={() => handleCopyToken(p.token)}
                          className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy Secret Token"
                        >
                          {copiedToken === p.token ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Key className="w-3.5 h-3.5 text-amber-500" />}
                          <span>Token</span>
                        </button>

                        {/* View Card */}
                        <button
                          onClick={() => {
                            onViewCard(p.token);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditingProfile(p)}
                          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Block/Unblock */}
                        <button
                          onClick={() => handleToggleBlock(p.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            p.isBlocked
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : 'border-rose-500/40 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                          }`}
                          title={p.isBlocked ? 'Unblock Card' : 'Block Card Access'}
                        >
                          {p.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>

                        {/* Delete */}
                        {!isOwner && (
                          <button
                            onClick={() => handleDeleteCard(p.id, p.fullName)}
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-rose-500 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: SCAN ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="flex-1 flex flex-col overflow-y-auto pt-3 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Live NFC Tap & Scan Tracking
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Track contactless hardware reads and verify active engagement per NFC card.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 uppercase font-semibold">Total Tap Reads</span>
                <div className="text-2xl font-black text-amber-500">{totalScans}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Client / Owner</th>
                    <th className="p-3">Card ID</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Total Scans</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Reset Counter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="p-3 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <img
                          src={p.avatarUrl}
                          alt={p.fullName}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span>{p.fullName}</span>
                      </td>
                      <td className="p-3 font-mono text-amber-500 font-semibold">{p.slug || p.token}</td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-300">{p.designation}</td>
                      <td className="p-3 font-mono font-bold text-emerald-500">
                        <span className="px-2 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                          {p.tapCount || 0} Taps
                        </span>
                      </td>
                      <td className="p-3">
                        {p.isBlocked ? (
                          <span className="text-rose-500 font-semibold">Blocked</span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">Live Active</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleResetScans(p.id, p.fullName)}
                          className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          Reset to 0
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 5 FIREBASE API KEY SLOTS WITH BOXED INPUTS & CODE BOX ================= */}
        {activeTab === 'firebase' && (
          <div className="flex-1 flex flex-col overflow-y-auto pt-3 space-y-4">
            {/* Top Control Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-blue-500/10 to-amber-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-500" />
                  <span>5-Slot Firebase Real-Time API Key Manager</span>
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Realtime cloud synchronization with 5 failover slots. When Slot 1 quota is reached, the system automatically routes to standby slots with zero downtime.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleTestFirebaseConnection}
                  disabled={testingFirebaseConn}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 ${testingFirebaseConn ? 'animate-spin' : ''}`} />
                  <span>{testingFirebaseConn ? 'Testing Live Ping...' : 'Test Live Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllFirebaseKeys}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Slots & Sync</span>
                </button>
              </div>
            </div>

            {/* Test Connection Alert Message */}
            {testConnResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                  testConnResult.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}
              >
                {testConnResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold">{testConnResult.success ? 'Firestore Live Connected' : 'Connection Warning'}</p>
                  <p className="font-normal opacity-90 mt-0.5">{testConnResult.msg}</p>
                </div>
                <button
                  onClick={() => setTestConnResult(null)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Saved Notification */}
            {firebaseSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Firebase Keys and Active Routing configuration saved successfully!</span>
              </div>
            )}

            {/* Dual Storage Status: IndexedDB Local Engine (Golden/Orange) + Firebase Cloud (Green when live) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Local IndexedDB Server: Golden / Orange */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">Local IndexedDB Server</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Connected & Ready</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                      Database: <strong className="text-amber-500">{idbStatus?.dbName || 'aks316_nfc_db'}</strong> (v{idbStatus?.version || 1}) • {idbStatus?.profileCount ?? profiles.length} cards saved
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-amber-500 hidden sm:inline">Local Safe</span>
              </div>

              {/* Firebase Firestore Cloud: Green when live/configured, Standby otherwise */}
              {(() => {
                const activeSlot = firebaseKeys.find(k => k.status === 'active') || firebaseKeys[0];
                const isConfigured = Boolean(activeSlot?.apiKey?.trim() && activeSlot?.projectId?.trim());
                return (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-xs ${
                      isConfigured
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-neutral-800/30 border-neutral-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isConfigured
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-700 text-neutral-400'
                        }`}
                      >
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-neutral-900 dark:text-white">
                            Firebase Firestore Cloud
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${
                              isConfigured
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-neutral-700/50 text-neutral-400 border-neutral-600'
                            }`}
                          >
                            {isConfigured ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{activeSlot.projectId} (Active Live)</span>
                              </>
                            ) : (
                              <span>No Keys (Standby)</span>
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                          {isConfigured
                            ? `Active Slot: ${activeSlot.label} • 5-Slot Failover Ready`
                            : 'Ready to receive keys • Operating on Local IndexedDB'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold hidden sm:inline ${
                        isConfigured ? 'text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      {isConfigured ? 'Live Cloud' : 'Standby'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Explanation Guide: "Active Slot" vs "Live Cloud" */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-500 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>How to verify if Firebase is genuinely Active (কিভাবে বুঝবেন Firebase চালু আছে)</span>
                </span>
                <button
                  type="button"
                  disabled={testingFirebaseConn}
                  onClick={async () => {
                    const activeSlot = firebaseKeys.find(k => k.status === 'active') || firebaseKeys[0];
                    if (!activeSlot?.apiKey?.trim()) {
                      setTestConnResult({
                        success: false,
                        msg: 'No API Key entered in the active slot yet. Please paste your Firebase config below first.',
                      });
                      return;
                    }
                    setTestingFirebaseConn(true);
                    setTestConnResult(null);
                    const res = await testFirebaseConnection(activeSlot);
                    setTestingFirebaseConn(false);
                    setTestConnResult({ success: res.success, msg: res.message });
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  {testingFirebaseConn ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3 h-3" />
                      <span>Test Cloud Connection Now</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                • <strong>"Active" Slot Tag</strong>: Indicates which of the 5 slots is currently targeted for syncing.<br />
                • <strong>Live Cloud Verified</strong>: When API key is provided and verified, the indicator turns <strong>Green (সবুজ)</strong>. If keys are missing, it stays on <strong>Golden / Orange Local IndexedDB Server</strong>, keeping your website running 100% smoothly offline or online.
              </p>
              {testConnResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 mt-1.5 border ${
                    testConnResult.success
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {testConnResult.success ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{testConnResult.msg}</span>
                </div>
              )}
            </div>

            {/* ================= CODE BOX: PASTE FIREBASE CODE SNIPPET ================= */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Paste Firebase SDK Code Snippet (Auto-Parser Box)</h5>
                    <p className="text-[11px] text-neutral-400">
                      Copy the code from Firebase Console and paste here. All 7 keys will be extracted automatically into the selected slot.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-neutral-400 font-medium">Target Slot:</label>
                  <select
                    value={targetPasteSlot}
                    onChange={(e) => setTargetPasteSlot(Number(e.target.value))}
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs font-semibold text-amber-400 focus:outline-hidden"
                  >
                    {firebaseKeys.map((k, idx) => (
                      <option key={k.id} value={idx}>
                        Slot #{idx + 1} - {k.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={rawFirebaseCode}
                  onChange={(e) => setRawFirebaseCode(e.target.value)}
                  placeholder={`// Paste your Firebase code snippet directly here, for example:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nfc-pro-8725e.firebaseapp.com",
  projectId: "nfc-pro-8725e",
  storageBucket: "nfc-pro-8725e.firebasestorage.app",
  messagingSenderId: "1098656113943",
  appId: "1:1098656113943:web:...",
  measurementId: "G-..."
};`}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-y"
                />
              </div>

              {codeParseMsg && (
                <div
                  className={`mt-2 p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    codeParseMsg.type === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {codeParseMsg.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  <span>{codeParseMsg.text}</span>
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  Current Screenshot Project: <code className="font-mono text-amber-400">nfc-pro-8725e</code> is currently saved in Slot 1.
                </span>
                <button
                  type="button"
                  onClick={handleParseFirebaseCode}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Parse Code & Populate Boxed Fields</span>
                </button>
              </div>
            </div>

            {/* ================= 5 SLOTS WITH INDIVIDUAL BOXED INPUT FIELDS ================= */}
            <div className="space-y-3">
              {firebaseKeys.map((slot, index) => {
                const isExpanded = expandedSlotIndex === index;
                return (
                  <div
                    key={slot.id}
                    className={`rounded-2xl border transition-all ${
                      slot.status === 'active'
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                        : slot.status === 'quota_exhausted'
                        ? 'bg-rose-500/5 border-rose-500/40'
                        : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 shadow-xs'
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-xs font-mono font-bold flex items-center justify-center text-neutral-700 dark:text-neutral-200">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          value={slot.label}
                          onChange={(e) => handleUpdateFirebaseSlot(index, 'label', e.target.value)}
                          className="font-bold text-xs bg-transparent border-b border-dashed border-neutral-400 dark:border-neutral-600 focus:outline-hidden text-neutral-900 dark:text-white"
                        />
                        {slot.status === 'active' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>PRIMARY ACTIVE</span>
                          </span>
                        )}
                        {slot.status === 'quota_exhausted' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            QUOTA EXHAUSTED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {slot.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleSetActiveFirebaseSlot(index)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-500 hover:text-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                          >
                            Set as Active Slot
                          </button>
                        )}

                        {slot.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleSimulateQuotaFailover(index)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors cursor-pointer"
                            title="Simulate quota limit hit to trigger instant automatic failover"
                          >
                            Simulate Failover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedSlotIndex(isExpanded ? null : index)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                          title={isExpanded ? 'Collapse fields' : 'Expand all boxed fields'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* All 7 Boxed Fields Grid & Direct Code System */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* 1. DIRECT CODE PASTE SYSTEM (Applied to Every Slot) */}
                        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Code className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-bold text-white">
                                Firebase Configuration Code (Slot #{index + 1})
                              </span>
                              {slot.projectId && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Project: {slot.projectId}
                                </span>
                              )}
                            </div>

                            {slot.apiKey && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(formatFirebaseCode(slot));
                                  setCopiedSlotKeyField(`code-${index}`);
                                  setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                }}
                                className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1 font-mono"
                              >
                                {copiedSlotKeyField === `code-${index}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSlotKeyField === `code-${index}` ? 'Code Copied' : 'Copy Full Code'}</span>
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-neutral-400 leading-relaxed">
                            Paste the full Firebase configuration code snippet for Slot #{index + 1}. All IDs and API Keys will be auto-detected and connected immediately:
                          </p>

                          <textarea
                            rows={5}
                            value={slotCodeInputs[index] !== undefined ? slotCodeInputs[index] : formatFirebaseCode(slot)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSlotCodeInputs((prev) => ({ ...prev, [index]: val }));
                            }}
                            placeholder={`// Paste your Firebase Config code for Slot #${index + 1} here:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:...",
  measurementId: "G-..."
};`}
                            className="w-full p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-y"
                          />

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveSlotCode(index)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Auto-Parse & Save Slot #{index + 1} Code</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowAdvancedSlotFields((prev) => ({ ...prev, [index]: !prev[index] }))}
                              className="text-[11px] text-neutral-400 hover:text-neutral-200 cursor-pointer flex items-center gap-1"
                            >
                              {showAdvancedSlotFields[index] ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Hide Separate ID Boxes</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>View / Edit Separate ID Boxes (Optional)</span>
                                </>
                              )}
                            </button>
                          </div>

                          {slotCodeSavedMsg[index] && (
                            <div
                              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                                slotCodeSavedMsg[index]?.type === 'success'
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              }`}
                            >
                              {slotCodeSavedMsg[index]?.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                              <span>{slotCodeSavedMsg[index]?.text}</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Optional Individual Fields (Shown on demand) */}
                        {showAdvancedSlotFields[index] && (
                          <div className="pt-1 space-y-2">
                            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                              Separate ID fields (automatically populated from the code above, or you can edit manually):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Box 1: API Key */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <Key className="w-3 h-3 text-amber-500" />
                                    <span>1. API Key</span>
                                  </label>
                                  {slot.apiKey && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.apiKey || '');
                                        setCopiedSlotKeyField(`apiKey-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-amber-500 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `apiKey-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `apiKey-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="AIzaSy..."
                                  value={slot.apiKey}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'apiKey', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              {/* Box 2: Project ID */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <Database className="w-3 h-3 text-indigo-500" />
                                    <span>2. Project ID</span>
                                  </label>
                                  {slot.projectId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.projectId || '');
                                        setCopiedSlotKeyField(`projectId-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `projectId-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `projectId-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="nfc-pro-8725e"
                                  value={slot.projectId}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'projectId', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              {/* Box 3: Auth Domain */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <Globe className="w-3 h-3 text-blue-500" />
                                    <span>3. Auth Domain</span>
                                  </label>
                                  {slot.authDomain && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.authDomain || '');
                                        setCopiedSlotKeyField(`authDomain-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `authDomain-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `authDomain-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="nfc-pro-8725e.firebaseapp.com"
                                  value={slot.authDomain}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'authDomain', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              {/* Box 4: Storage Bucket */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-emerald-500" />
                                    <span>4. Storage Bucket</span>
                                  </label>
                                  {slot.storageBucket && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.storageBucket || '');
                                        setCopiedSlotKeyField(`storageBucket-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `storageBucket-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `storageBucket-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="nfc-pro-8725e.firebasestorage.app"
                                  value={slot.storageBucket || ''}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'storageBucket', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              {/* Box 5: Messaging Sender ID */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <Radio className="w-3 h-3 text-amber-500" />
                                    <span>5. Messaging Sender ID</span>
                                  </label>
                                  {slot.messagingSenderId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.messagingSenderId || '');
                                        setCopiedSlotKeyField(`messagingSenderId-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `messagingSenderId-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `messagingSenderId-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="753045137897"
                                  value={slot.messagingSenderId || ''}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'messagingSenderId', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              {/* Box 6: Web App ID */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <CreditCard className="w-3 h-3 text-purple-500" />
                                    <span>6. Web App ID</span>
                                  </label>
                                  {slot.appId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.appId || '');
                                        setCopiedSlotKeyField(`appId-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-purple-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `appId-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `appId-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="1:753045137897:web:05743066cda12ad7230378"
                                  value={slot.appId}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'appId', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              {/* Box 7: Measurement ID */}
                              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1">
                                    <Activity className="w-3 h-3 text-rose-500" />
                                    <span>7. Measurement ID</span>
                                  </label>
                                  {slot.measurementId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(slot.measurementId || '');
                                        setCopiedSlotKeyField(`measurementId-${index}`);
                                        setTimeout(() => setCopiedSlotKeyField(null), 2000);
                                      }}
                                      className="text-[10px] text-rose-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                      {copiedSlotKeyField === `measurementId-${index}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedSlotKeyField === `measurementId-${index}` ? 'Copied' : 'Copy'}</span>
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  placeholder="G-01ZGKPPBLY"
                                  value={slot.measurementId || ''}
                                  onChange={(e) => handleUpdateFirebaseSlot(index, 'measurementId', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: WEBSITE BRANDING & LOGO ================= */}
        {activeTab === 'branding' && (
          <div className="flex-1 flex flex-col overflow-y-auto pt-3 space-y-4 max-w-2xl">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-blue-500/10 border border-amber-500/30">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Website Name & Brand Logo Configuration</span>
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Customize your website identity. The website name and logo appear at the top navigation bar, browser title, and on the header of all issued NFC smart cards.
              </p>
            </div>

            {brandSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Website Name & Brand Logo saved successfully!</span>
              </div>
            )}

            {/* Live Preview Card */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Live Header Preview</span>
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  {brandForm.websiteLogoUrl ? (
                    <img
                      src={brandForm.websiteLogoUrl}
                      alt="Brand Logo"
                      className="w-9 h-9 rounded-xl object-cover border border-amber-500/30 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-neutral-950 flex items-center justify-center font-bold shadow-xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {brandForm.websiteName || 'NexTech NFC PRO'}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        LIVE
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400">Smart Contactless NFC Identity Platform</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
                  <span>Home</span>
                  <span>•</span>
                  <span>NFC Portal</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBrandSettings} className="space-y-4 bg-white dark:bg-neutral-850 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Website / Brand Name
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NexTech NFC Global or Sohel's Smart Cards"
                    value={brandForm.websiteName}
                    onChange={(e) => setBrandForm({ ...brandForm, websiteName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">This name is shown in the header, website page title, and footer.</p>
              </div>

              {/* Direct File Upload for Website Logo */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    <span>Upload Logo from Device (Computer / Mobile)</span>
                  </label>
                  {brandForm.websiteLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setBrandForm({ ...brandForm, websiteLogoUrl: '' })}
                      className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {brandForm.websiteLogoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={brandForm.websiteLogoUrl}
                        alt="Website Logo Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md bg-white dark:bg-neutral-950 p-1"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center shadow-xs font-bold">
                        ✓
                      </span>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400 shrink-0 bg-neutral-100/50 dark:bg-neutral-800/50">
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                      <span className="text-[9px] mt-0.5 font-medium">Default</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Upload className="w-4 h-4" />
                        <span>Select Logo File (PNG, JPG, SVG, WebP)</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-0.5">
                        Click to browse or drag and drop image (Auto-compressed to ultra-sharp HD)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const optimized = await optimizeLogoImage(file);
                              setBrandForm({ ...brandForm, websiteLogoUrl: optimized.dataUrl });
                            } catch {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                const base64 = uploadEvent.target?.result as string;
                                if (base64) {
                                  setBrandForm({ ...brandForm, websiteLogoUrl: base64 });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Or Paste Website Logo Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://yourdomain.com/logo.png"
                    value={brandForm.websiteLogoUrl}
                    onChange={(e) => setBrandForm({ ...brandForm, websiteLogoUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Direct image URL (PNG, SVG, or JPG). Leave empty to use the default Gold NFC Emblem icon.</p>
              </div>

              {/* Quick Preset Logos */}
              <div>
                <span className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                  Or Pick a Preset Logo Icon:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      title: 'Gold Tech Emblem',
                      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
                    },
                    {
                      title: 'Holo Geometric',
                      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
                    },
                    {
                      title: 'Luxury Shield',
                      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=80',
                    },
                    {
                      title: 'Dark Minimalist',
                      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => setBrandForm({ ...brandForm, websiteLogoUrl: preset.url })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        brandForm.websiteLogoUrl === preset.url
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-amber-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.title} className="w-6 h-6 rounded-lg object-cover" />
                      <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate">
                        {preset.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Website Name & Logo</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: ADMIN CREDENTIALS & SECURITY ================= */}
        {activeTab === 'security' && (
          <div className="flex-1 flex flex-col overflow-y-auto pt-3 space-y-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Change Admin User ID & Password</span>
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Update your login credentials at any time. Changes are stored securely in encrypted persistent storage.
              </p>
            </div>

            {secMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  secMsg.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}
              >
                {secMsg.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{secMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-3 bg-white dark:bg-neutral-850 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Admin User ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Admin User ID"
                  value={secForm.newUsername}
                  onChange={(e) => setSecForm({ ...secForm, newUsername: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Password (To verify identity)
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={secForm.oldPassword}
                  onChange={(e) => setSecForm({ ...secForm, oldPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={secForm.newPassword}
                    onChange={(e) => setSecForm({ ...secForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={secForm.confirmPassword}
                    onChange={(e) => setSecForm({ ...secForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Save New User ID & Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 5: LEGACY NFC & QR REDIRECT BRIDGE ================= */}
        {activeTab === 'legacy' && (
          <LegacyRedirectsTab profiles={profiles} onViewCard={onViewCard} />
        )}

        {/* ================= TAB 6: GITHUB & NETLIFY DEPLOYMENT ================= */}
        {activeTab === 'netlify' && (
          <div className="flex-1 flex flex-col overflow-y-auto pt-3 space-y-4 max-w-2xl">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-blue-500/15 to-purple-500/10 border border-indigo-500/30">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" />
                <span>GitHub Repository & Netlify Continuous Deployment Hub</span>
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                First upload your code to GitHub, then link GitHub with Netlify for instant automatic builds whenever you push updates!
              </p>
            </div>

            {/* Workflow Card */}
            <div className="bg-white dark:bg-neutral-850 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center">1</span>
                  <h5 className="font-bold text-xs text-neutral-900 dark:text-white">Download Git & Netlify Ready Project Archive</h5>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-8">
                  Includes production config (<code className="font-mono text-amber-500">_redirects</code>, <code className="font-mono text-amber-500">netlify.toml</code>), your card profiles snapshot, and multi-key Firebase configuration.
                </p>
                <div className="pl-8 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadNetlifyPackage}
                    disabled={isExportingNetlify}
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingNetlify ? 'Generating Package...' : 'Download Project Bundle (.ZIP)'}</span>
                  </button>
                  {exportComplete && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold ml-3">
                      <Check className="w-3.5 h-3.5" /> Downloaded!
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h5 className="font-bold text-xs text-neutral-900 dark:text-white">Push to Your GitHub Repository</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cmd = `git init\ngit add .\ngit commit -m "Deploy NFC Smart Card Web App"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git\ngit push -u origin main`;
                      navigator.clipboard.writeText(cmd);
                      setCopiedGitCmd(true);
                      setTimeout(() => setCopiedGitCmd(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copiedGitCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGitCmd ? 'Commands Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-8">
                  Create an empty repository on GitHub, unzip the downloaded files, and execute these commands in your project terminal:
                </p>
                <div className="pl-8">
                  <pre className="p-3 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-[11px] leading-relaxed overflow-x-auto border border-neutral-800">
                    <code>{`git init
git add .
git commit -m "Deploy NFC Smart Card Web App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main`}</code>
                  </pre>
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center">3</span>
                  <h5 className="font-bold text-xs text-neutral-900 dark:text-white">Link GitHub Repo with Netlify (Auto Deploy)</h5>
                </div>
                <div className="pl-8 text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5">
                  <p>1. Open Netlify Dashboard (<a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-medium">app.netlify.com</a>).</p>
                  <p>2. Click <span className="font-semibold text-neutral-900 dark:text-white">&ldquo;Add new site&rdquo; &rarr; &ldquo;Import an existing project&rdquo;</span>.</p>
                  <p>3. Select <span className="font-semibold text-neutral-900 dark:text-white">GitHub</span> and pick your newly pushed repository.</p>
                  <p>4. Netlify will auto-detect settings from our included <code className="font-mono text-amber-500">netlify.toml</code>:</p>
                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 space-y-0.5">
                    <div>Build command: <span className="text-amber-500 font-semibold">npm run build</span></div>
                    <div>Publish directory: <span className="text-amber-500 font-semibold">dist</span></div>
                  </div>
                  <p>5. Click <span className="font-semibold text-emerald-400">&ldquo;Deploy site&rdquo;</span> &mdash; Any time you push commits to GitHub, Netlify automatically deploys the live version!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Card */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                Issue New NFC Smart Card
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Generates a unique isolated URL and secret token for the client.
              </p>

              <form onSubmit={handleCreateCard} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sohel"
                    value={newCardData.fullName}
                    onChange={(e) => setNewCardData({ ...newCardData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Designation / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director"
                      value={newCardData.designation}
                      onChange={(e) => setNewCardData({ ...newCardData, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Prime Tech Ltd"
                      value={newCardData.company}
                      onChange={(e) => setNewCardData({ ...newCardData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-neutral-700 dark:text-neutral-300">Primary Phone *</label>
                      {newCardData.phone && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                          <span>{getCountryFromPhoneNumber(newCardData.phone).flag}</span>
                          <span className="truncate max-w-[80px]">{getCountryFromPhoneNumber(newCardData.phone).name}</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1711-000000"
                      value={newCardData.phone}
                      onChange={(e) => setNewCardData({ ...newCardData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-neutral-700 dark:text-neutral-300">WhatsApp</label>
                      {newCardData.whatsapp && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                          <span>{getCountryFromPhoneNumber(newCardData.whatsapp).flag}</span>
                          <span className="truncate max-w-[80px]">{getCountryFromPhoneNumber(newCardData.whatsapp).name}</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      placeholder="+880 1711-000000"
                      value={newCardData.whatsapp}
                      onChange={(e) => setNewCardData({ ...newCardData, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newCardData.email}
                    onChange={(e) => setNewCardData({ ...newCardData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>

                {/* Dual Address: Present / Work + Permanent / Home */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Present / Work Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Banani, Dhaka"
                      value={newCardData.address}
                      onChange={(e) => setNewCardData({ ...newCardData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Permanent / Home Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Cumilla, Bangladesh"
                      value={newCardData.permanentAddress}
                      onChange={(e) => setNewCardData({ ...newCardData, permanentAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>

                {/* Unique User ID & Password for Card Owner */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-500 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Card Owner Credentials (Auto-filled)</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Sequential UID + Default 1234</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        User ID (Auto: starts after aks316) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. aks317"
                        value={newCardData.ownerUserId}
                        onChange={(e) => {
                          setNewCardData({ ...newCardData, ownerUserId: e.target.value });
                          setUserIdConflictError('');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Owner Password (Default: 1234) *
                      </label>
                      <input
                        type="text"
                        placeholder="1234"
                        value={newCardData.ownerPassword}
                        onChange={(e) => setNewCardData({ ...newCardData, ownerPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    🔒 <strong>Security Guarantee:</strong> The public NFC link uses an unpredictable random token starting with capital <strong>AKS-</strong>, preventing strangers from guessing other client links!
                  </p>
                  {userIdConflictError && (
                    <p className="text-rose-500 text-[11px] font-semibold bg-rose-500/15 p-2 rounded-lg border border-rose-500/20">
                      {userIdConflictError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer"
                  >
                    Generate NFC Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Profile */}
        {editingProfile && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl relative">
              <button
                onClick={() => setEditingProfile(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                Edit NFC Card: {editingProfile.fullName}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Update client information, contact channels, and branding.
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.fullName}
                    onChange={(e) => setEditingProfile({ ...editingProfile, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Designation</label>
                    <input
                      type="text"
                      value={editingProfile.designation}
                      onChange={(e) => setEditingProfile({ ...editingProfile, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Company</label>
                    <input
                      type="text"
                      value={editingProfile.company || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
                      {editingProfile.phone && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                          <span>{getCountryFromPhoneNumber(editingProfile.phone).flag}</span>
                          <span className="truncate max-w-[80px]">{getCountryFromPhoneNumber(editingProfile.phone).name}</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={editingProfile.phone}
                      onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-medium text-neutral-700 dark:text-neutral-300">WhatsApp</label>
                      {editingProfile.whatsapp && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                          <span>{getCountryFromPhoneNumber(editingProfile.whatsapp).flag}</span>
                          <span className="truncate max-w-[80px]">{getCountryFromPhoneNumber(editingProfile.whatsapp).name}</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={editingProfile.whatsapp}
                      onChange={(e) => setEditingProfile({ ...editingProfile, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Email</label>
                  <input
                    type="email"
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>

                {/* Dual Address: Present / Work + Permanent / Home */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Present / Work Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Banani, Dhaka"
                      value={editingProfile.address || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Permanent / Home Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Cumilla, Bangladesh"
                      value={editingProfile.permanentAddress || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, permanentAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-neutral-700 dark:text-neutral-300">Avatar Photo</label>
                    <label className="cursor-pointer text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload HD Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const optimized = await optimizeAvatarImage(file);
                              setEditingProfile({ ...editingProfile, avatarUrl: optimized.dataUrl });
                            } catch {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const b64 = ev.target?.result as string;
                                if (b64) setEditingProfile({ ...editingProfile, avatarUrl: b64 });
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="https://... or click Upload HD Photo above"
                    value={editingProfile.avatarUrl}
                    onChange={(e) => setEditingProfile({ ...editingProfile, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-neutral-700 dark:text-neutral-300">Bio</label>
                  <textarea
                    rows={2}
                    value={editingProfile.bio}
                    onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>

                {/* Unique User ID & Password for Card Owner */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-500 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Card Owner Credentials (To Edit Links)</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Must be unique per user</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Unique User ID *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. user316"
                        value={editingProfile.ownerUserId || ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, ownerUserId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                        Owner Password *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. pass123"
                        value={editingProfile.ownerPassword || ''}
                        onChange={(e) => setEditingProfile({ ...editingProfile, ownerPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Modal for any profile */}
        {qrModalProfile && (
          <QrCodeModal
            profile={qrModalProfile}
            isOpen={Boolean(qrModalProfile)}
            onClose={() => setQrModalProfile(null)}
            cardUrl={getCardNfcWriteUrl(qrModalProfile)}
          />
        )}
      </div>
    </div>
  );
}
