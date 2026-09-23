'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

let hasActuallyPlayedChime = false;

/**
 * Plays the luxury acoustic booking chime at 50% volume.
 * Uses studio-rendered /sounds/booking-chime.wav with Web Audio API synthesis fallback and gesture unlock.
 */
function playBookingChime() {
  if (hasActuallyPlayedChime) return;

  try {
    // 1. Primary method: HTML5 Audio with 50% volume
    const audio = new Audio('/sounds/booking-chime.wav');
    audio.volume = 0.50; // exactly 50% volume
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasActuallyPlayedChime = true;
        })
        .catch(() => {
          // 2. Fallback method: Web Audio API synthesis with user-gesture unlock
          playWebAudioChime();
        });
    }
  } catch (e) {
    playWebAudioChime();
  }
}

/**
 * Web Audio API synthesized backup chime at 50% volume.
 */
function playWebAudioChime() {
  if (hasActuallyPlayedChime) return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const triggerNotes = () => {
      if (hasActuallyPlayedChime) return;
      hasActuallyPlayedChime = true;
      const now = ctx.currentTime;

      // Master volume at 50% (0.50)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.50, now);
      masterGain.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.connect(masterGain);

      // Acoustic chime chord
      const tones = [
        { freq: 587.33, delay: 0.0, peak: 0.5 },
        { freq: 1174.66, delay: 0.07, peak: 0.8 },
        { freq: 1479.98, delay: 0.09, peak: 0.35 },
      ];

      tones.forEach(({ freq, delay, peak }) => {
        const start = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.015);
        gain.gain.setTargetAtTime(0.0001, start + 0.02, 0.25);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(start);
        osc.stop(start + 1.2);
      });
    };

    const armUnlock = () => {
      const unlock = () => {
        if (!hasActuallyPlayedChime) {
          playBookingChime();
        }
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
        window.removeEventListener('touchstart', unlock, true);
      };
      window.addEventListener('pointerdown', unlock, { once: true, capture: true });
      window.addEventListener('keydown', unlock, { once: true, capture: true });
      window.addEventListener('touchstart', unlock, { once: true, capture: true });
    };

    if (ctx.state === 'running') {
      triggerNotes();
    } else {
      ctx.resume().then(() => {
        if (ctx.state === 'running') {
          triggerNotes();
        } else {
          armUnlock();
        }
      }).catch(armUnlock);
    }
  } catch (e) {}
}

export function Preloader() {
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Reset chime state on component mount for fresh reload
    hasActuallyPlayedChime = false;

    // Preload audio asset for instant 0ms latency playback
    try {
      const preloadAudio = new Audio('/sounds/booking-chime.wav');
      preloadAudio.volume = 0.50;
      preloadAudio.load();
    } catch (e) {}

    // Chime plays right as the checkmark strikes and confirms (650ms)
    const chimeTimer = setTimeout(() => {
      playBookingChime();
    }, 650);

    // Fast, crisp curtain-lift exit starts at 1150ms
    const exitTimer = setTimeout(() => {
      setIsExiting(true);

      // Unmount cleanly after curtain lift completes (500ms)
      setTimeout(() => {
        setShouldRender(false);
      }, 500);
    }, 1150);

    return () => {
      clearTimeout(chimeTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isExiting) return;
    if (!hasActuallyPlayedChime) {
      playBookingChime();
    }
    setIsExiting(true);
    setTimeout(() => {
      setShouldRender(false);
    }, 500);
  };

  // Preloader only renders on the home page as requested
  if (pathname !== '/' || !shouldRender) return null;

  return (
    <div
      onClick={handleDismiss}
      style={{
        zIndex: 9999999,
        transform: isExiting ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
      className="fixed inset-0 h-screen h-[100dvh] w-screen w-[100dvw] bg-[#0F0F0E] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden px-4 sm:px-6 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] rounded-b-[28px] sm:rounded-b-[44px] md:rounded-b-[60px] border-b border-[#D0E967]/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] touch-none"
    >
      {/* Background Ambient Spotlight in Electric Chartreuse (responsively scaled for mobile up to 4K) */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] rounded-full bg-[#D0E967]/12 blur-3xl pointer-events-none" />

      {/* Motion Graphic Logo & Brand Container (smoothly dissolves during curtain lift) */}
      <div
        className={`relative z-10 flex flex-col items-center space-y-4 sm:space-y-5 md:space-y-6 will-change-transform transition-all duration-300 ease-out ${
          isExiting ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Kinetic Secondary Logomark Wrapper (responsive width/height scaling) */}
        <div className="relative w-28 h-22 sm:w-36 sm:h-28 md:w-40 md:h-32 flex items-center justify-center svg-mark-wrapper">
          <svg
            viewBox="0 0 660 500"
            className="w-full h-full drop-shadow-[0_0_24px_rgba(208,233,103,0.35)]"
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
        <div className="text-center space-y-1.5 sm:space-y-2 svg-preloader-text">
          <Image
            src="/logos/primary-wordmark-dark.png"
            alt="BUKKAPP"
            width={160}
            height={36}
            className="h-6 sm:h-7 md:h-8 w-auto object-contain mx-auto"
            priority
          />
          <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-neutral-400 tracking-widest uppercase">
            Universal Local Booking
          </p>
        </div>
      </div>
    </div>
  );
}
