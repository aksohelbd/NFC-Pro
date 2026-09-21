import { useState, useEffect } from 'react';
import { UserProfile, ViewMode } from './types';
import {
  getStoredProfiles,
  getPrimaryOwnerProfile,
  findProfileBySlugOrToken,
  findProfileByToken,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { PortfolioHome } from './components/PortfolioHome';
import { NfcCardView } from './components/NfcCardView';
import { ClientPortalModal } from './components/ClientPortalModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { nfcFeedback } from './utils/nfcFeedback';
import {
  fetchProfilesRealtime,
  subscribeToFirebaseRealtime,
  fetchAdminSettingsRealtime,
  subscribeToAdminSettingsRealtime,
} from './utils/firebaseRealtime';
import { saveAdminSettings } from './utils/storage';

export default function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getStoredProfiles());
  const [primaryProfile, setPrimaryProfile] = useState<UserProfile>(() => getPrimaryOwnerProfile());

  // Navigation / View State
  const [activeCardProfile, setActiveCardProfile] = useState<UserProfile | null>(null);
  const [isNfcDirectTapMode, setIsNfcDirectTapMode] = useState<boolean>(false);

  // Modals
  const [showClientPortal, setShowClientPortal] = useState(false);
  const [clientPortalPrefilledToken, setClientPortalPrefilledToken] = useState<string>('');
  const [showAdmin, setShowAdmin] = useState(false);

  // 1. Dual Realtime Cloud & IndexedDB Sync on mount
  useEffect(() => {
    // Subscribe to Firebase Firestore live profile changes
    const unsubRealtime = subscribeToFirebaseRealtime((syncedProfiles) => {
      if (syncedProfiles && syncedProfiles.length > 0) {
        setProfiles(syncedProfiles);
        const owner = syncedProfiles.find((p) => p.isPrimaryOwner) || syncedProfiles[0];
        setPrimaryProfile(owner);
      }
    });

    // Subscribe to Firebase Firestore live admin/brand settings changes
    const unsubAdminRealtime = subscribeToAdminSettingsRealtime((cloudSettings) => {
      if (cloudSettings) {
        saveAdminSettings(cloudSettings);
      }
    });

    // Initial background fetch from Firebase cloud / IndexedDB local
    fetchProfilesRealtime().then(({ profiles: loaded }) => {
      if (loaded && loaded.length > 0) {
        setProfiles(loaded);
        const owner = loaded.find((p) => p.isPrimaryOwner) || loaded[0];
        setPrimaryProfile(owner);
      }
    });

    // Initial fetch of cloud admin settings
    fetchAdminSettingsRealtime().then((cloudSettings) => {
      if (cloudSettings) {
        saveAdminSettings(cloudSettings);
      }
    });

    return () => {
      unsubRealtime();
      unsubAdminRealtime();
    };
  }, []);

  // 2. Check URL path, legacy blog formats, query and hash on mount and popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;

      // Case A: /home or #/home (explicit portfolio home view)
      if (path.toLowerCase() === '/home' || window.location.hash === '#/home' || window.location.hash === '#home') {
        setActiveCardProfile(null);
        setIsNfcDirectTapMode(false);
        return;
      }

      // Case B: Standard NFC link: /nfc/:token or /nfc
      let detectedIdentifier: string | null = null;

      if (path.toLowerCase().startsWith('/nfc')) {
        const afterNfc = path.replace(/^\/nfc\/?/i, '').trim();
        detectedIdentifier = afterNfc.split('/')[0] || null;
      }

      // Case C: Legacy Blog Links support (e.g. printed on previously physical cards / QR codes)
      // Example 1: Blogger/Blogspot: /p/aks316.html or /p/aks-316
      if (!detectedIdentifier) {
        const blogPostMatch = path.match(/\/(?:p|post|blog|article|entry)\/([a-zA-Z0-9_-]+)(?:\.html)?/i);
        if (blogPostMatch && blogPostMatch[1]) {
          detectedIdentifier = blogPostMatch[1];
        }
      }

      // Example 2: Date-based legacy blog links: /2024/05/aks316.html or /2023/aks316
      if (!detectedIdentifier) {
        const dateBlogMatch = path.match(/\/\d{4}\/(?:\d{2}\/)?([a-zA-Z0-9_-]+)(?:\.html)?/i);
        if (dateBlogMatch && dateBlogMatch[1]) {
          detectedIdentifier = dateBlogMatch[1];
        }
      }

      // Example 3: Direct short slug on root: /aks316 or /aks-316 or /aks317
      if (!detectedIdentifier && path.length > 1) {
        const directAksMatch = path.match(/^\/([a-zA-Z0-9_-]+)$/i);
        if (directAksMatch && directAksMatch[1]) {
          const cand = directAksMatch[1].toLowerCase();
          if (cand !== 'home' && cand !== 'admin' && cand !== 'login') {
            detectedIdentifier = directAksMatch[1];
          }
        }
      }

      // Case D: Query parameters ?card=, ?id=, ?legacy_id=, ?nfc=, ?token=, ?p=
      const params = new URLSearchParams(window.location.search);
      const queryParam =
        params.get('card') ||
        params.get('id') ||
        params.get('legacy_id') ||
        params.get('p') ||
        params.get('nfc') ||
        params.get('token') ||
        params.get('profile') ||
        params.get('slug');

      const targetLookup = detectedIdentifier || queryParam;

      if (targetLookup) {
        const found = findProfileBySlugOrToken(targetLookup) || findProfileByToken(targetLookup);
        if (found) {
          setActiveCardProfile(found);
          // If it's another client's card, strictly enter private NFC tap mode without home button
          setIsNfcDirectTapMode(!found.isPrimaryOwner);
          return;
        }
      }

      // Case E: Hash URLs: #/nfc/aks316, #nfc/aks316, #/p/aks316, #aks316
      const hash = window.location.hash;
      if (hash.length > 1) {
        const cleanHash = hash.replace(/^#\/?(nfc|card|p|blog)?\/?/i, '');
        if (cleanHash && cleanHash !== 'home') {
          const found = findProfileBySlugOrToken(cleanHash) || findProfileByToken(cleanHash);
          if (found) {
            setActiveCardProfile(found);
            setIsNfcDirectTapMode(!found.isPrimaryOwner);
            return;
          }
        }
      }

      // Default on website open: Show primary NFC card (AKS-316)
      const owner = getPrimaryOwnerProfile();
      setActiveCardProfile(owner);
      setIsNfcDirectTapMode(false);
    };

    handleUrlChange();
    nfcFeedback.initTouchUnlock();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfiles(getStoredProfiles());
    if (updated.isPrimaryOwner) {
      setPrimaryProfile(updated);
    }
    if (activeCardProfile && activeCardProfile.id === updated.id) {
      setActiveCardProfile(updated);
    }
  };

  const handleOpenMyNfc = () => {
    try {
      sessionStorage.removeItem(`nfc_tap_played_${primaryProfile.id}`);
    } catch {
      // ignore
    }
    setActiveCardProfile(primaryProfile);
    setIsNfcDirectTapMode(false);
    window.history.pushState({}, '', `/nfc/${primaryProfile.slug || primaryProfile.token}`);
  };

  const handleNavigateHome = () => {
    setActiveCardProfile(null);
    setIsNfcDirectTapMode(false);
    window.history.pushState({}, '', '/');
  };

  const handleOpenClientPortal = (token?: string) => {
    setClientPortalPrefilledToken(token || '');
    setShowClientPortal(true);
  };

  const handleViewCardFromModal = (slugOrToken: string) => {
    const found = findProfileBySlugOrToken(slugOrToken) || findProfileByToken(slugOrToken);
    if (found) {
      setActiveCardProfile(found);
      setIsNfcDirectTapMode(!found.isPrimaryOwner);
      window.history.pushState({}, '', `/nfc/${found.slug || found.token}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 
        Case 1: Direct NFC Tap Mode for other private clients:
        Per user's explicit request:
        "kew jodi nfc card add korte chai amar website a ami take se subidao dite chai kinto jokhn onek gula information hoye jabe tobe karo informaton kew dekhte parbe na, home/back/next others kono buttan thakbe na. just nfc tap korle sudu oi page ti dekhte parbe sathe r kono page er information dekhte parbe na. karon sobar privace ache."
      */}
      {activeCardProfile && isNfcDirectTapMode ? (
        <NfcCardView
          profile={activeCardProfile}
          isOwnerView={false}
          onOpenClientPortal={handleOpenClientPortal}
        />
      ) : activeCardProfile && !isNfcDirectTapMode ? (
        /* Owner's NFC card view (with button to toggle back to portfolio) */
        <div className="flex-1 flex flex-col">
          <NfcCardView
            profile={activeCardProfile}
            isOwnerView={true}
            onNavigateHome={handleNavigateHome}
            onOpenClientPortal={handleOpenClientPortal}
            onOpenAdmin={() => setShowAdmin(true)}
          />
        </div>
      ) : (
        /* Main Portfolio Home for Owner */
        <div className="flex-1 flex flex-col">
          <Navbar
            primaryProfile={primaryProfile}
            onOpenMyNfc={handleOpenMyNfc}
            onOpenClientPortal={() => handleOpenClientPortal()}
            onOpenAdmin={() => setShowAdmin(true)}
          />

          <main className="flex-1">
            <PortfolioHome
              profile={primaryProfile}
              onOpenNfcCard={handleOpenMyNfc}
              onOpenClientPortal={() => handleOpenClientPortal()}
              onOpenAdmin={() => setShowAdmin(true)}
            />
          </main>

          <Footer
            profile={primaryProfile}
            onOpenMyNfc={handleOpenMyNfc}
            onOpenClientPortal={() => handleOpenClientPortal()}
            onOpenAdmin={() => setShowAdmin(true)}
          />
        </div>
      )}

      {/* Client Self-Service Modal (Requires Secret Token) */}
      <ClientPortalModal
        isOpen={showClientPortal}
        onClose={() => setShowClientPortal(false)}
        prefilledToken={clientPortalPrefilledToken}
        onProfileUpdated={handleProfileUpdated}
        onViewCard={handleViewCardFromModal}
      />

      {/* Master Admin Panel Modal (Requires Admin PIN) */}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onViewCard={handleViewCardFromModal}
          onProfilesChanged={() => {
            setProfiles(getStoredProfiles());
            setPrimaryProfile(getPrimaryOwnerProfile());
          }}
        />
      )}
    </div>
  );
}
