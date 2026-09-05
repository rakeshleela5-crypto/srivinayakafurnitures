import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Universal Zero-Focus Bluetooth & Wireless Barcode Scanner Hook
 * Supports all HID Keyboard Wedge Scanners (Zebra, Netum, Eyoyo, Honeywell, TVS, etc.)
 * Features:
 * - Ultra-fast keystroke burst detection (< 50ms interval)
 * - Zero-focus execution (no input element click required)
 * - Native Web Audio API dual-tone laser chimes
 * - Speech Synthesis warehouse dock voice announcements
 */
export function useHardwareBarcodeScanner({
  onScan,
  enabled = true,
  minChars = 3,
  maxIntervalMs = 60,
  enableVoice = true,
  enableAudio = true
}) {
  const [lastScan, setLastScan] = useState('');
  const [scanSpeedMs, setScanSpeedMs] = useState(0);
  const [isScannerReady, setIsScannerReady] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState('Bluetooth / 2.4G HID Laser Gun');

  // Internal buffer refs
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const audioCtxRef = useRef(null);

  // Lazy initialize Web Audio Context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // 🔊 Synthesized Laser Beep (Success: 880Hz -> 1760Hz crisp chirp)
  const playSuccessSound = useCallback(() => {
    if (!enableAudio) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }, [enableAudio, getAudioContext]);

  // 🚨 Synthesized Warning Buzz (Error/Duplicate: 220Hz low buzz)
  const playErrorSound = useCallback(() => {
    if (!enableAudio) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.1);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }, [enableAudio, getAudioContext]);

  // 🗣️ Synthesized Voice Announcer for Loud Warehouse Docks
  const speakVoice = useCallback((text) => {
    if (!enableVoice || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN'; // Indian English voice profile
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Voice synthesis notice:', e);
    }
  }, [enableVoice]);

  // ⚡ Main Keyboard Wedge Scanner Listener
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // If user is typing in standard textarea or rich inputs, evaluate if it's high speed scanner burst
      const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
      const now = performance.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Enter or Tab indicates end of barcode transmission from scanner gun
      if (e.key === 'Enter' || e.key === 'Tab') {
        const fullCode = bufferRef.current.trim();
        const totalDuration = now - startTimeRef.current;

        // If buffer has sufficient characters and was typed rapidly (< 60ms average per char)
        if (fullCode.length >= minChars) {
          const avgCharTime = fullCode.length > 0 ? (totalDuration / fullCode.length) : 0;
          
          // Scanner burst check (or if not in an input, even standard Enter triggers it)
          if (!isInput || avgCharTime < maxIntervalMs) {
            e.preventDefault();
            e.stopPropagation();

            setLastScan(fullCode);
            setScanSpeedMs(Math.round(totalDuration));
            setIsScanning(false);
            playSuccessSound();

            if (onScan) {
              onScan(fullCode);
            }

            bufferRef.current = '';
            return;
          }
        }
        bufferRef.current = '';
        setIsScanning(false);
        return;
      }

      // If key is printable character (length === 1)
      if (e.key && e.key.length === 1) {
        // If elapsed time is large (> 180ms) and we were not mid-burst, reset buffer
        if (timeSinceLastKey > 180) {
          bufferRef.current = e.key;
          startTimeRef.current = now;
          setIsScanning(true);
        } else {
          // Rapid subsequent keystroke
          bufferRef.current += e.key;
          setIsScanning(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, minChars, maxIntervalMs, onScan, playSuccessSound]);

  // 🧪 Helper to test a scan programmatically or from UI test button
  const simulateScan = useCallback((code) => {
    setLastScan(code);
    setScanSpeedMs(18);
    playSuccessSound();
    if (onScan) onScan(code);
  }, [onScan, playSuccessSound]);

  return {
    lastScan,
    scanSpeedMs,
    isScannerReady,
    isScanning,
    connectedDeviceName,
    setConnectedDeviceName,
    playSuccessSound,
    playErrorSound,
    speakVoice,
    simulateScan
  };
}
