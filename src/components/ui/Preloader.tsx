'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Preloader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // 1500ms full kinetic animation + 400ms smooth fade out
    const timer = setTimeout(() => {
      setIsVisible(false);

      setTimeout(() => {
        setShouldRender(false);
      }, 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Preloader only renders on the home page as requested
  if (pathname !== '/' || !shouldRender) return null;

  return (
    <div
      onClick={() => setIsVisible(false)}
      style={{ zIndex: 9999999 }}
      className={`fixed inset-0 bg-[#111111] flex flex-col items-center justify-center transition-all duration-400 select-none cursor-pointer ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none scale-102'
      }`}
    >
      {/* Background Ambient Spotlight in Electric Chartreuse */}
      <div className="absolute w-80 h-80 rounded-full bg-[#D0E967]/15 blur-3xl pointer-events-none animate-pulse" />

      {/* SVG Motion Graphic Logo Container */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Kinetic Secondary Logomark Wrapper */}
        <div className="relative w-36 h-28 flex items-center justify-center svg-mark-wrapper">
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
        <div className="text-center space-y-1.5 svg-preloader-text">
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

        {/* Micro Progress Track */}
        <div className="w-32 h-1 bg-neutral-800/90 rounded-full overflow-hidden">
          <div className="h-full bg-[#D0E967] rounded-full svg-preloader-bar shadow-[0_0_8px_rgba(208,233,103,0.7)]" />
        </div>
      </div>
    </div>
  );
}
