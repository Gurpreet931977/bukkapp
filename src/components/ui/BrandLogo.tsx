'use client';

import React from 'react';
import Link from 'next/link';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';
  theme?: 'light' | 'dark' | 'lime' | 'monochrome';
  withIcon?: boolean;
  withTagline?: boolean;
  taglineText?: string;
  href?: string;
  className?: string;
  interactive?: boolean;
}

/**
 * Minimal & Refined Brand Monogram SVG Icon
 * Features interlocking geometric 'P' marks with a subtle electric-lime accent.
 */
export function BrandMark({
  size = 28,
  theme = 'light',
  className = '',
}: {
  size?: number;
  theme?: 'light' | 'dark' | 'lime' | 'monochrome';
  className?: string;
}) {
  const isDark = theme === 'dark';
  const isLime = theme === 'lime';

  const bgFill = isLime ? '#C7F36B' : isDark ? '#1C1C1C' : '#111111';
  const primaryFill = isLime ? '#111111' : isDark ? '#FFFFFF' : '#FFFFFF';
  const secondaryFill = isLime ? '#111111' : '#C7F36B';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size, backgroundColor: bgFill }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[74%] h-[74%]"
      >
        {/* First Geometric 'P' */}
        <path
          d="M8 7H17C19.7614 7 22 9.23858 22 12C22 14.7614 19.7614 17 17 17H12.5V29H8V7Z"
          fill={primaryFill}
        />
        <path
          d="M12.5 11.5H16.5C17.6046 11.5 18.5 12.3954 18.5 13.5C18.5 14.6046 17.6046 15.5 16.5 15.5H12.5V11.5Z"
          fill={bgFill}
        />

        {/* Second Stepped 'P' */}
        <path
          d="M17 11H25C27.2091 11 29 12.7909 29 15C29 17.2091 27.2091 19 25 19H21V29H17V11Z"
          fill={secondaryFill}
        />
        <path
          d="M21 14.5H24.5C25.3284 14.5 26 15.1716 26 16C26 16.8284 25.3284 17.5 24.5 17.5H21V14.5Z"
          fill={bgFill}
        />
      </svg>
    </div>
  );
}

/**
 * Minimal Double-P Highlight
 * Renders 'PP' seamlessly in-line with a subtle, clean color accent.
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
 * Renders the cohesive BUKKAPP wordmark with minimal, elegant double-P accent.
 */
export function BrandLogo({
  size = 'md',
  theme = 'light',
  withIcon = false,
  withTagline = false,
  taglineText = 'Universal Local Booking',
  href,
  className = '',
  interactive = true,
}: BrandLogoProps) {
  const textSizeClasses = {
    xs: 'text-sm font-black',
    sm: 'text-base font-black',
    md: 'text-xl sm:text-2xl font-black',
    lg: 'text-2xl sm:text-3xl font-black',
    xl: 'text-3xl sm:text-4xl font-black',
    '2xl': 'text-4xl sm:text-5xl font-black',
    display: 'text-5xl sm:text-6xl md:text-7xl font-black',
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

  const isDark = theme === 'dark';
  const isLime = theme === 'lime';
  const textColor = isLime ? 'text-brand-black' : isDark ? 'text-white' : 'text-brand-black';
  const accentColor = isLime ? 'text-neutral-800' : isDark ? 'text-brand-lime' : 'text-[#65a30d]';

  const content = (
    <div
      className={`group inline-flex items-center gap-2 font-display select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {withIcon && <BrandMark size={iconSizes} theme={theme} />}

      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span className={`${textSizeClasses} ${textColor} tracking-tight`}>
            BUKKA<span className={accentColor}>PP</span>
          </span>
        </div>

        {withTagline && (
          <span
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isDark ? 'text-neutral-400' : 'text-brand-muted'
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
      <Link href={href} className="focus:outline-hidden inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * BrandText Component for Body Copy, Headings & Inline Mentions
 * Seamlessly formats BUKKAPP with minimal double-P styling.
 */
export function BrandText({
  variant = 'caps', // 'caps' (BUKKAPP), 'title' (BukkApp), 'lower' (bukkapp)
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
            <span className="text-xs font-black tracking-tight text-white">
              BUKKA<span className="text-brand-lime">PP</span>
            </span>
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${styles} ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-brand-lime shrink-0 animate-pulse" />
      <span className="font-display font-black tracking-tight">
        BUKKA<span className="text-lime-700">PP</span>
      </span>
      <span className="text-[11px] font-semibold opacity-90">{label}</span>
    </span>
  );
}
