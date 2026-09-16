import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const variants = {
      primary: 'bg-brand-black text-white hover:bg-neutral-800 shadow-subtle',
      accent: 'bg-brand-lime text-brand-black font-semibold hover:bg-brand-lime-dark shadow-subtle',
      secondary: 'bg-brand-surface-alt text-brand-black hover:bg-[#EBEBE5] border border-brand-border/60',
      outline: 'bg-white text-brand-black border border-brand-border hover:bg-brand-surface-alt',
      ghost: 'bg-transparent text-brand-black hover:bg-brand-surface-alt',
      danger: 'bg-error text-white hover:bg-red-600',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-[10px] gap-1.5',
      md: 'text-sm px-4 py-2.5 rounded-[12px] gap-2',
      lg: 'text-base px-6 py-3.5 rounded-[14px] gap-2.5 font-semibold',
      icon: 'p-2 rounded-[12px] h-10 w-10',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
