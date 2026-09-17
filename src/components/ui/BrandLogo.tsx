'use client';

import React from 'react';
import Link from 'next/link';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';
  theme?: 'auto' | 'light' | 'dark' | 'lime' | 'monochrome';
  withIcon?: boolean;
  withTagline?: boolean;
  taglineText?: string;
  href?: string;
  className?: string;
  interactive?: boolean;
}

/**
 * Brand Logomark Icon
 * Dynamically renders the official checkmark + electric-lime streak logomark:
 * - In light mode / light backgrounds: Black checkmark
 * - In dark mode / dark backgrounds: White checkmark
 */
export function BrandMark({
  size = 28,
  theme = 'auto',
  className = '',
}: {
  size?: number;
  theme?: 'auto' | 'light' | 'dark' | 'lime' | 'monochrome';
  className?: string;
}) {
  if (theme === 'dark') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-white shadow-2xs p-1 transition-transform duration-200 group-hover:scale-105 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <img
          src="/logos/secondary-logomark.png"
          alt="BUKKAPP Mark"
          className="w-[82%] h-[82%] object-contain"
          loading="eager"
        />
      </div>
    );
  }

  if (theme === 'light') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <img
          src="/logos/secondary-logomark.png"
          alt="BUKKAPP Mark"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>
    );
  }

  // Dynamic Auto (switches based on system dark mode, Tailwind .dark, or dark parent background)
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Light Mode: Standard Logomark */}
      <img
        src="/logos/secondary-logomark.png"
        alt="BUKKAPP Mark"
        className="w-full h-full object-contain logomark-light"
        loading="eager"
      />
      {/* Dark Mode: Over White Circle for 100% Contrast & Visibility */}
      <div className="w-full h-full rounded-full bg-white shadow-2xs items-center justify-center p-1 logomark-dark">
        <img
          src="/logos/secondary-logomark.png"
          alt="BUKKAPP Mark"
          className="w-[82%] h-[82%] object-contain"
          loading="eager"
        />
      </div>
    </div>
  );
}

/**
 * DoublePHighlight
 * Maintained for backward compatibility in typography text formatting.
 */
export function DoublePHighlight({
  theme = 'light',
  children = 'PP',
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';
  theme?: 'light' | 'dark' | 'lime' | 'monochrome';
  children?: React.ReactNode;
  className?: string;
}) {
  const isDark = theme === 'dark';
  const isLime = theme === 'lime';

  const colorClass = isLime
    ? 'text-brand-black'
    : isDark
    ? 'text-brand-lime'
    : 'text-[#65a30d] dark:text-brand-lime';

  return (
    <span className={`${colorClass} font-black transition-colors ${className}`}>
      {children}
    </span>
  );
}

/**
 * Master Brand Logo Component
 * Dynamically renders the official BUKKAPP wordmark logo with optional secondary logomark.
 * Automatically adapts between black (light mode) and white (dark mode).
 */
export function BrandLogo({
  size = 'md',
  theme = 'auto',
  withIcon = true,
  withTagline = false,
  taglineText = 'Universal Local Booking',
  href,
  className = '',
  interactive = true,
}: BrandLogoProps) {
  const heightClasses = {
    xs: 'h-5',
    sm: 'h-6',
    md: 'h-7 sm:h-8',
    lg: 'h-8 sm:h-9',
    xl: 'h-10 sm:h-12',
    '2xl': 'h-12 sm:h-14',
    display: 'h-14 sm:h-16 md:h-18',
  }[size];

  const iconSizes = {
    xs: 18,
    sm: 22,
    md: 28,
    lg: 34,
    xl: 42,
    '2xl': 52,
    display: 64,
  }[size];

  const content = (
    <div
      className={`group inline-flex items-center gap-2 select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {withIcon && <BrandMark size={iconSizes} theme={theme} />}

      <div className="flex flex-col justify-center">
        {theme === 'dark' ? (
          <img
            src="/logos/primary-wordmark-dark.png"
            alt="BUKKAPP"
            className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]`}
            loading="eager"
          />
        ) : theme === 'light' ? (
          <img
            src="/logos/primary-wordmark.png"
            alt="BUKKAPP"
            className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]`}
            loading="eager"
          />
        ) : (
          <>
            <img
              src="/logos/primary-wordmark.png"
              alt="BUKKAPP"
              className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01] logomark-light`}
              loading="eager"
            />
            <img
              src="/logos/primary-wordmark-dark.png"
              alt="BUKKAPP"
              className={`${heightClasses} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01] logomark-dark`}
              loading="eager"
            />
          </>
        )}

        {withTagline && (
          <span
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 ${
              theme === 'dark' ? 'text-neutral-400' : 'text-brand-muted dark:text-neutral-400'
            }`}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-hidden inline-flex items-center" aria-label="BUKKAPP Home">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * BrandText Component for Body Copy, Headings & Inline Mentions
 */
export function BrandText({
  variant = 'caps',
  theme = 'light',
  className = '',
}: {
  variant?: 'caps' | 'title' | 'lower';
  highlightVariant?: 'pill' | 'text' | 'glow' | 'badge';
  theme?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = theme === 'dark';
  const accentColor = isDark ? 'text-brand-lime' : 'text-[#65a30d]';

  if (variant === 'title') {
    return (
      <span className={`font-black tracking-tight ${className}`}>
        BukkA<span className={accentColor}>pp</span>
      </span>
    );
  }

  if (variant === 'lower') {
    return (
      <span className={`font-black tracking-tight ${className}`}>
        bukka<span className={accentColor}>pp</span>
      </span>
    );
  }

  return (
    <span className={`font-black tracking-tight ${className}`}>
      BUKKA<span className={accentColor}>PP</span>
    </span>
  );
}

/**
 * Security Pass / Header Seal for Tickets and Confirmations
 */
export function BrandHologram({
  reference,
  className = '',
}: {
  reference?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative p-3.5 rounded-2xl bg-brand-black text-white border border-neutral-800 shadow-modal flex items-center justify-between gap-4 select-none ${className}`}
    >
      <div className="flex items-center gap-3">
        <BrandMark size={32} theme="dark" />
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/logos/primary-wordmark-dark.png"
              alt="BUKKAPP"
              className="h-4 w-auto object-contain"
            />
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-lime bg-brand-lime/10 px-1.5 py-0.5 rounded-md">
              Official Ticket
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Verified by BUKKAPP Booking Protocol
          </p>
        </div>
      </div>

      {reference && (
        <div className="text-right hidden sm:block">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold block">
            Security Pass
          </span>
          <span className="font-mono text-xs font-bold text-brand-lime">{reference}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Standalone Brand Badge for Instant Verification & Guarantees
 */
export function BrandBadge({
  label = 'Verified Guarantee',
  variant = 'lime',
  className = '',
}: {
  label?: string;
  variant?: 'lime' | 'dark' | 'white';
  className?: string;
}) {
  const styles = {
    lime: 'bg-brand-lime text-brand-black border border-brand-black/15 shadow-2xs',
    dark: 'bg-brand-black text-white border border-neutral-800 shadow-2xs',
    white: 'bg-white text-brand-black border border-brand-border shadow-2xs',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold ${styles} ${className}`}
    >
      <BrandMark size={14} theme={variant === 'dark' ? 'dark' : 'light'} />
      <img
        src={variant === 'dark' ? '/logos/primary-wordmark-dark.png' : '/logos/primary-wordmark.png'}
        alt="BUKKAPP"
        className="h-3 w-auto object-contain"
      />
      <span className="text-[11px] font-semibold opacity-90">{label}</span>
    </span>
  );
}
