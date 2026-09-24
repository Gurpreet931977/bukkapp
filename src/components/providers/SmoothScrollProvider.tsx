'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis smooth scroll engine
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.4,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!node || !(node instanceof HTMLElement)) return false;

        // 1. Explicit data-lenis-prevent attribute or parent with it
        if (node.hasAttribute('data-lenis-prevent') || Boolean(node.closest('[data-lenis-prevent]'))) {
          return true;
        }

        // 2. Modals, dialogs, drawers, popups, command palettes, dropdowns
        if (
          Boolean(
            node.closest(
              '[role="dialog"], [role="listbox"], [role="menu"], [aria-modal="true"], .modal, [data-modal], [data-palette]'
            )
          )
        ) {
          return true;
        }

        // 3. Fixed / sticky overlay layers (modal backdrops, drawer sheets, etc.)
        if (Boolean(node.closest('.fixed.inset-0, .fixed.bottom-0'))) {
          return true;
        }

        // 4. Any scrollable container
        let curr: HTMLElement | null = node;
        while (curr && curr !== document.body && curr !== document.documentElement) {
          if (
            curr.classList.contains('overflow-y-auto') ||
            curr.classList.contains('overflow-auto') ||
            curr.classList.contains('custom-scrollbar')
          ) {
            return true;
          }
          curr = curr.parentElement;
        }

        return false;
      },
    });

    lenisRef.current = lenis;
    if (typeof window !== 'undefined') {
      (window as any).__lenis = lenis;
    }

    // Connect Lenis scroll events to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Synchronize GSAP ticker with Lenis RAF loop
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Initialize smooth entrance animations for reveal targets
    const ctx = gsap.context(() => {
      const revealElements = gsap.utils.toArray<HTMLElement>('.gsap-reveal');
      revealElements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 28,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
      if (typeof window !== 'undefined') {
        (window as any).__lenis = null;
      }
    };
  }, []);

  // Guarantee that hashtags never appear or persist in the browser address bar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stripHashFromUrl = () => {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    stripHashFromUrl();
    window.addEventListener('hashchange', stripHashFromUrl);
    return () => window.removeEventListener('hashchange', stripHashFromUrl);
  }, []);

  // On route changes, check for hash anchor target first or cross-page scroll target, then scroll cleanly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. If arriving with an existing hash (e.g. from an old link or bookmark), scroll to target and strip hash from URL
    if (window.location.hash) {
      const hash = window.location.hash;
      const target = document.querySelector(hash);

      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      if (target && lenisRef.current) {
        setTimeout(() => {
          lenisRef.current?.scrollTo(target as HTMLElement, { offset: -70, immediate: true });
          ScrollTrigger.refresh();
        }, 50);
        return;
      }
    }

    // 2. Check for cross-page scroll target stored in sessionStorage
    const scrollTargetId = sessionStorage.getItem('bukkapp_scroll_target');
    if (scrollTargetId) {
      sessionStorage.removeItem('bukkapp_scroll_target');
      const target = document.getElementById(scrollTargetId);
      if (target && lenisRef.current) {
        setTimeout(() => {
          lenisRef.current?.scrollTo(target, { offset: -70, duration: 0.9 });
          ScrollTrigger.refresh();
        }, 80);
        return;
      }
    }

    // 3. Normal navigation: scroll to top
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
