'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

/**
 * Synthesizes a luxury acoustic 'booking confirmed' bell chime using the Web Audio API.
 * Zero external audio files, zero network latency, pure warm harmonic chime.
 */
function playBookingChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master volume control (warm, polite luxury acoustic volume)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    // Warm Lowpass filter for smooth bell/glass acoustic harmonics
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.connect(masterGain);

    // Harmonic chime chord: D5 (587.33Hz) + D6 (1174.66Hz) + F#6 sparkle (1479.98Hz)
    const tones = [
      { freq: 587.33, delay: 0.0, duration: 0.9, peak: 0.65 },
      { freq: 1174.66, delay: 0.08, duration: 1.25, peak: 0.9 },
      { freq: 1479.98, delay: 0.1, duration: 1.1, peak: 0.35 },
    ];

    tones.forEach(({ freq, delay, duration, peak }) => {
      const start = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(start);
      osc.stop(start + duration + 0.05);
    });
  } catch (e) {
    // Graceful fallback if audio permissions are restricted
  }
}

export function Preloader() {
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const chimePlayedRef = useRef(false);

  useEffect(() => {
    // Chime plays right as the checkmark strikes and confirms (850ms)
    const chimeTimer = setTimeout(() => {
      if (!chimePlayedRef.current) {
        chimePlayedRef.current = true;
        playBookingChime();
      }
    }, 850);

    // Smooth creative curtain-lift exit starts at 1550ms
    const exitTimer = setTimeout(() => {
      setIsExiting(true);

      // Unmount after curtain lift completes (700ms)
      setTimeout(() => {
        setShouldRender(false);
      }, 700);
    }, 1550);

    return () => {
      clearTimeout(chimeTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isExiting) return;
    if (!chimePlayedRef.current) {
      chimePlayedRef.current = true;
      playBookingChime();
    }
    setIsExiting(true);
    setTimeout(() => {
      setShouldRender(false);
    }, 700);
  };

  // Preloader only renders on the home page as requested
  if (pathname !== '/' || !shouldRender) return null;

  return (
    <div
      onClick={handleDismiss}
      style={{ zIndex: 9999999 }}
      className={`fixed inset-0 bg-[#0F0F0E] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting
          ? '-translate-y-full rounded-b-[48px] sm:rounded-b-[64px] border-b-2 border-[#D0E967]/30 shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
          : 'translate-y-0 rounded-b-none'
      }`}
    >
      {/* Background Ambient Spotlight in Electric Chartreuse */}
      <div className="absolute w-96 h-96 rounded-full bg-[#D0E967]/15 blur-3xl pointer-events-none animate-pulse" />

      {/* Motion Graphic Logo & Brand Container (floats up and gently dissolves during curtain wipe) */}
      <div
        className={`relative z-10 flex flex-col items-center space-y-6 transition-all duration-350 ease-out ${
          isExiting ? 'opacity-0 -translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Kinetic Secondary Logomark Wrapper */}
        <div className="relative w-36 h-28 flex items-center justify-center svg-mark-wrapper">
          {/* Luminous Confirmation Shockwave Ripple */}
          <div className="absolute w-28 h-28 rounded-full border border-[#D0E967]/50 bg-[#D0E967]/10 svg-shockwave-pulse pointer-events-none" />

          <svg
            viewBox="0 0 660 500"
            className="w-full h-full drop-shadow-[0_0_26px_rgba(208,233,103,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Layer 1: Electric Lime Highlighter Base Streak */}
            <path
              d="M 28 420 C 12 400 24 380 44 372 C 120 340 240 310 360 280 C 475 250 565 224 624 219 C 642 218 653 232 648 248 C 640 274 624 300 592 324 C 512 384 380 430 250 460 C 146 484 76 498 48 486 C 24 476 12 450 28 420 Z"
              fill="#D0E967"
              className="svg-highlighter-streak"
            />

            {/* Layer 2: Iconic Bold Checkmark Stroke */}
            <path
              d="M 108 194 L 270 346 L 558 50"
              stroke="#FAFAF8"
              strokeWidth="130"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="svg-checkmark-stroke"
            />
          </svg>
        </div>

        {/* Official Wordmark and Tagline */}
        <div className="text-center space-y-2 svg-preloader-text">
          <Image
            src="/logos/primary-wordmark-dark.png"
            alt="BUKKAPP"
            width={160}
            height={36}
            className="h-7 sm:h-8 w-auto object-contain mx-auto"
            priority
          />
          <p className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
            Universal Local Booking
          </p>
        </div>
      </div>
    </div>
  );
}
