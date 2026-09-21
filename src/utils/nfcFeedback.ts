/**
 * Realistic NFC Sound and Haptic Feedback System
 * Generates an authentic NFC chip tap detection chime using Web Audio API
 * and triggers device haptic vibration.
 */

class NfcFeedbackService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Proactively unlocks audio on any initial mobile tap/click
   */
  public initTouchUnlock(): void {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.getAudioContext();
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('touchend', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
  }

  /**
   * Plays an authentic, crystal-clear single contactless NFC tap chime
   * Modeled after Apple Pay and modern contactless terminals:
   * - 1 single unified crystal chime (high clarity, zero harshness)
   * - Soft pure dual-frequency resonance (1046.5Hz & 1318.5Hz)
   * - Immediate crisp response with gentle exponential decay
   */
  public playNfcChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Crystal Pure Contactless Ping (C6: 1046.5Hz & Harmonic E6: 1318.5Hz)
      const oscPrimary = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const masterGain = ctx.createGain();

      oscPrimary.type = 'sine';
      oscHarmonic.type = 'sine';

      oscPrimary.frequency.setValueAtTime(1046.5, now);
      oscHarmonic.frequency.setValueAtTime(1318.5, now);

      // Fast, gentle attack (no click) and clean natural bell decay
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.24, now + 0.008);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      oscPrimary.connect(masterGain);
      oscHarmonic.connect(masterGain);
      masterGain.connect(ctx.destination);

      oscPrimary.start(now);
      oscHarmonic.start(now);

      oscPrimary.stop(now + 0.36);
      oscHarmonic.stop(now + 0.36);
    } catch {
      // Audio playback may fail if user hasn't interacted with document yet
    }
  }

  /**
   * Triggers realistic NFC mobile haptic vibration
   */
  public triggerHaptic(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Subtle NFC pattern: short crisp pulse (35ms), pause (40ms), confirmation pulse (75ms)
        navigator.vibrate([35, 40, 75]);
      } catch {
        // Haptics not supported or permitted
      }
    }
  }

  /**
   * Triggers both audio chime and haptic feedback simultaneously
   */
  public triggerNfcTapFeedback(): void {
    this.playNfcChime();
    this.triggerHaptic();
  }
}

export const nfcFeedback = new NfcFeedbackService();
