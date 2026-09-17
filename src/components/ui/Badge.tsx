import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap, Clock, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'dark' | 'neutral' | 'verified' | 'urgent' | 'outline';
  size?: 'sm' | 'md';
  icon?: 'verified' | 'clock' | 'sparkle' | 'urgent' | 'none';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'sm',
  icon = 'none',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium select-none tracking-tight';

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full gap-1',
    md: 'text-xs px-2.5 py-1 rounded-full gap-1.5',
  };

  const variants = {
    lime: 'bg-brand-lime text-brand-black font-semibold shadow-xs',
    dark: 'bg-brand-black text-white',
    neutral: 'bg-brand-surface-alt text-brand-secondary border border-brand-border/60',
    verified: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium',
    urgent: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-medium',
    outline: 'bg-transparent text-brand-black border border-brand-border',
  };

  return (
    <span className={cn(baseStyles, sizes[size], variants[variant], className)} {...props}>
      {icon === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
      {icon === 'clock' && <Clock className="w-3 h-3 text-brand-secondary shrink-0" />}
      {icon === 'sparkle' && <Zap className="w-3 h-3 text-brand-black shrink-0" />}
      {icon === 'urgent' && <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />}
      {children}
    </span>
  );
}

export function VerifiedBadge({ className, text = 'Verified' }: { className?: string; text?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70',
        className
      )}
    >
      <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white shrink-0" />
      <span>{text}</span>
    </span>
  );
}

export function AvailabilityBadge({ text, isAvailable = true }: { text: string; isAvailable?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs',
        isAvailable
          ? 'bg-white/95 text-brand-black border border-brand-border/80'
          : 'bg-neutral-100 text-neutral-600'
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          isAvailable ? 'bg-brand-lime animate-pulse-live' : 'bg-neutral-400'
        )}
      />
      <span>{text}</span>
    </span>
  );
}
