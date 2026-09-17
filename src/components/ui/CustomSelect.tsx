'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  label?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  name?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  className,
  buttonClassName,
  dropdownClassName,
  disabled = false,
  searchable = false,
  size = 'md',
  id,
  name,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options if searchable
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    return (
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Enable search automatically if there are 8 or more items, unless explicitly false
  const shouldShowSearch = searchable || (searchable === undefined && normalizedOptions.length >= 8);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && shouldShowSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (isOpen) {
      // Find index of current selected option
      const idx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, shouldShowSearch]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      const target = items[highlightedIndex] as HTMLElement;
      if (target) {
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Size styles
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg min-h-[32px]',
    md: 'text-xs px-3 py-2 rounded-xl min-h-[38px]',
    lg: 'text-sm px-3.5 py-2.5 rounded-xl min-h-[44px]',
  };

  return (
    <div ref={containerRef} className={cn('relative w-full text-left', className)} onKeyDown={handleKeyDown}>
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-bold text-brand-muted uppercase tracking-wider block mb-1">
          {label}
        </label>
      )}

      {/* Hidden native input for form compatibility */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Custom Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center justify-between gap-2 font-semibold text-brand-black bg-brand-surface-alt hover:bg-white border transition-all duration-200 select-none cursor-pointer',
          sizeClasses[size],
          isOpen
            ? 'bg-white border-brand-black shadow-xs ring-2 ring-brand-lime/60'
            : 'border-brand-border hover:border-neutral-400',
          disabled && 'opacity-50 cursor-not-allowed hover:border-brand-border hover:bg-brand-surface-alt',
          buttonClassName
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
          )}
          <span className={cn(!selectedOption && 'text-neutral-400 font-normal')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-neutral-500 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-brand-black'
          )}
        />
      </button>

      {/* Custom Dropdown Flyout */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={cn(
            'absolute left-0 right-0 z-50 mt-1.5 bg-white/98 backdrop-blur-xl border border-brand-border shadow-modal rounded-2xl p-1.5 animate-slide-down min-w-[200px] overflow-hidden',
            dropdownClassName
          )}
        >
          {/* Optional Search Filter Input */}
          {shouldShowSearch && normalizedOptions.length > 5 && (
            <div className="p-1.5 border-b border-neutral-100 mb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Type to filter..."
                  className="w-full text-xs font-semibold pl-7 pr-7 py-1.5 rounded-lg bg-brand-surface-alt border border-transparent focus:border-brand-black focus:bg-white focus:outline-hidden text-brand-black"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-neutral-400 hover:text-brand-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options Scrollable Container */}
          <div ref={listRef} className="max-h-60 overflow-y-auto no-scrollbar space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-brand-secondary font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;
                const OptIcon = opt.icon;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'px-2.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer select-none',
                      isSelected
                        ? 'bg-brand-lime/25 text-brand-black font-bold border border-brand-lime/50 shadow-2xs'
                        : isHighlighted
                        ? 'bg-brand-surface-alt text-brand-black'
                        : 'text-neutral-700 hover:bg-brand-surface-alt hover:text-brand-black'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {OptIcon && (
                        <OptIcon className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-brand-black' : 'text-neutral-500')} />
                      )}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-[10px] text-neutral-400 font-normal truncate">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-md bg-brand-black text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 text-brand-lime" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
