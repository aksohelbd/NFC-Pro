import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon, Share2 } from 'lucide-react';
import { UserProfile } from '../types';

interface QrCodeModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  cardUrl: string;
}

export function QrCodeModal({ profile, isOpen, onClose, cardUrl }: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(
      cardUrl,
      {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (err) {
          console.error('QR code generation error:', err);
          return;
        }
        setDataUrl(url);
      }
    );
  }, [isOpen, cardUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${profile.slug}-nfc-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="qr-code-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="qr-code-modal-container"
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="qr-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
            <QrIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            NFC Quick Scan QR
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Scan to instantly view <span className="font-semibold text-neutral-800 dark:text-neutral-200">{profile.fullName}</span>'s card
          </p>
        </div>

        {/* QR container */}
        <div className="flex justify-center p-4 bg-white rounded-xl border border-neutral-100 shadow-inner mb-4">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="NFC Smart QR Code"
              className="w-56 h-56 rounded-lg object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-neutral-400">
              Generating QR...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            id="qr-download-btn"
            onClick={handleDownloadQr}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download QR Code Image
          </button>

          <button
            id="qr-copy-btn"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">NFC Card Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-500" />
                <span>Copy Direct Card URL</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1 rounded-md">
            <span>Token:</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{profile.token}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
