'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Preloader() {
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Lock body scroll and overscroll on mobile/desktop while preloader is active to prevent scroll bleed
  useEffect(() => {
    if (pathname !== '/' || !shouldRender) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [pathname, shouldRender]);

  useEffect(() => {
    // Respect user's reduced-motion preference on mobile/desktop
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const delay = prefersReducedMotion ? 400 : 1150;
    const transitionDuration = prefersReducedMotion ? 200 : 500;

    // Fast, crisp curtain-lift exit starts at 1150ms (or 400ms for reduced-motion)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);

      // Unmount cleanly after curtain lift completes
      setTimeout(() => {
        setShouldRender(false);
      }, transitionDuration);
    }, delay);

    return () => {
      clearTimeout(exitTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (isExiting) return;
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
      onTouchStart={handleDismiss}
      role="status"
      aria-label="Loading BUKKAPP"
      style={{
        zIndex: 9999999,
        transform: isExiting ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
        willChange: 'transform',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
      className={`fixed inset-0 h-screen h-[100dvh] w-screen w-[100dvw] bg-[#0F0F0E] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden px-4 sm:px-6 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] touch-none ${
        isExiting
          ? 'rounded-b-[28px] sm:rounded-b-[44px] md:rounded-b-[60px] border-b border-[#D0E967]/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
          : 'rounded-b-none border-b-0 shadow-none'
      }`}
    >
      {/* Background Ambient Spotlight in Electric Chartreuse (responsively scaled for mobile up to 4K) */}
      <div className="absolute w-56 h-56 min-[380px]:w-64 min-[380px]:h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] rounded-full bg-[#D0E967]/12 blur-3xl pointer-events-none transform-gpu" />

      {/* Motion Graphic Logo & Brand Container (smoothly dissolves during curtain lift) */}
      <div
        className={`relative z-10 flex flex-col items-center space-y-3.5 min-[380px]:space-y-4 sm:space-y-5 md:space-y-6 will-change-transform transition-all duration-300 ease-out ${
          isExiting ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        {/* Kinetic Secondary Logomark Wrapper (expanded clearance prevents any glow cropping) */}
        <div className="relative w-[124px] h-[103px] min-[380px]:w-[140px] min-[380px]:h-[116px] sm:w-[176px] sm:h-[146px] md:w-[196px] md:h-[162px] flex items-center justify-center overflow-visible svg-mark-wrapper">
          <svg
            viewBox="-80 -100 820 680"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Native SVG Gaussian glow filter - immune to WebKit texture box clipping */}
              <filter id="preloader-neon-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="22" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Layer 1: Electric Lime Highlighter Base Streak */}
            <path
              d="M 28 420 C 12 400 24 380 44 372 C 120 340 240 310 360 280 C 475 250 565 224 624 219 C 642 218 653 232 648 248 C 640 274 624 300 592 324 C 512 384 380 430 250 460 C 146 484 76 498 48 486 C 24 476 12 450 28 420 Z"
              fill="#D0E967"
              className="svg-highlighter-streak"
            />

            {/* Layer 2: Radiant Electric Lime Under-Glow Aura (Vector filter, 0% clipping risk) */}
            <path
              d="M 108 194 L 270 346 L 558 50"
              stroke="#D0E967"
              strokeWidth="154"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#preloader-neon-glow)"
              className="svg-checkmark-stroke opacity-75 pointer-events-none"
            />

            {/* Layer 3: Iconic Bold Checkmark Stroke */}
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
            height={40}
            className="h-5 min-[380px]:h-6 sm:h-7 md:h-8 w-auto object-contain mx-auto"
            priority
          />
          <p className="text-[9px] min-[380px]:text-[9.5px] sm:text-[10px] md:text-[11px] font-bold text-neutral-300 sm:text-neutral-400 tracking-[0.2em] sm:tracking-widest uppercase">
            Universal Local Booking
          </p>
        </div>
      </div>
    </div>
  );
}
