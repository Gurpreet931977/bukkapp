'use client';

import React, { useState, useEffect } from 'react';

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if preloader was already shown this session
    try {
      if (sessionStorage.getItem('bukkapp_preloader_seen')) {
        setShouldRender(false);
        setIsVisible(false);
        return;
      }
    } catch (e) {
      // Storage unavailable in incognito/restricted modes
    }

    // Fast timer: 750ms animation + 300ms fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      try {
        sessionStorage.setItem('bukkapp_preloader_seen', 'true');
      } catch (e) {}

      setTimeout(() => {
        setShouldRender(false);
      }, 350);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden="true"
      onClick={() => setIsVisible(false)}
      className={`fixed inset-0 z-100 bg-[#111111] flex flex-col items-center justify-center transition-all duration-350 cursor-pointer ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none scale-102'
      }`}
    >
      {/* Background Ambient Spotlight */}
      <div className="absolute w-72 h-72 rounded-full bg-[#C7F36B]/10 blur-3xl pointer-events-none animate-pulse" />

      {/* SVG Motion Graphic Logo Container */}
      <div className="relative z-10 flex flex-col items-center space-y-5">
        {/* Kinetic SVG Logo Mark */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(199,243,107,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Geometric Frame */}
            <rect
              x="6"
              y="6"
              width="108"
              height="108"
              rx="28"
              stroke="#2A2A2A"
              strokeWidth="3"
            />
            <rect
              x="6"
              y="6"
              width="108"
              height="108"
              rx="28"
              stroke="#C7F36B"
              strokeWidth="3"
              className="svg-preloader-stroke"
            />

            {/* Letter 'B' Geometric Path */}
            <path
              d="M34 32H54C62 32 68 36 68 43C68 48 64 52 58 54C66 56 70 61 70 68C70 76 63 81 53 81H34V32Z"
              stroke="#FAFAF8"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="svg-preloader-letter"
            />
            <path
              d="M34 54H54"
              stroke="#FAFAF8"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Signature Double 'PP' Accent Badge */}
            <circle cx="86" cy="34" r="14" fill="#C7F36B" className="svg-preloader-badge" />
            <text
              x="86"
              y="39"
              textAnchor="middle"
              fill="#111111"
              fontSize="12"
              fontWeight="900"
              fontFamily="var(--font-display), sans-serif"
              letterSpacing="-0.5px"
            >
              PP
            </text>
          </svg>
        </div>

        {/* Wordmark and Tagline */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            <span className="font-display font-black text-2xl tracking-tighter text-white">
              BUKKA
            </span>
            <span className="font-display font-black text-2xl tracking-tighter text-[#C7F36B]">
              PP
            </span>
          </div>
          <p className="text-[10px] font-semibold text-neutral-400 tracking-widest uppercase">
            Universal Local Booking
          </p>
        </div>

        {/* Micro Progress Track */}
        <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#C7F36B] rounded-full svg-preloader-bar" />
        </div>
      </div>

      <style jsx>{`
        .svg-preloader-stroke {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawOutline 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .svg-preloader-letter {
          stroke-dasharray: 260;
          stroke-dashoffset: 260;
          animation: drawLetter 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.15s forwards;
        }
        .svg-preloader-badge {
          transform-origin: 86px 34px;
          animation: popBadge 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
        }
        .svg-preloader-bar {
          animation: loadProgress 0.8s ease-in-out forwards;
        }

        @keyframes drawOutline {
          0% {
            stroke-dashoffset: 400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawLetter {
          0% {
            stroke-dashoffset: 260;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes popBadge {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes loadProgress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
