'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog / Bottom Sheet on Mobile */}
      <div
        className={cn(
          'relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-modal border-t sm:border border-brand-border/80 overflow-hidden z-10 animate-slide-up sm:animate-slide-down flex flex-col max-h-[90vh] sm:max-h-[calc(100vh-4rem)] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:pb-0',
          maxWidths[maxWidth]
        )}
      >
        {/* Mobile Pull / Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-5 sm:px-6 pt-3 sm:pt-6 pb-3 sm:pb-4 border-b border-brand-border/60 flex items-start justify-between gap-4 shrink-0">
            <div>
              {title && <h3 className="text-lg sm:text-xl font-bold text-brand-black tracking-tight">{title}</h3>}
              {description && (
                <p className="text-xs sm:text-sm text-brand-secondary mt-0.5 sm:mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-brand-black rounded-lg hover:bg-brand-surface-alt transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-brand-black bg-white/80 rounded-full hover:bg-brand-surface-alt transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

