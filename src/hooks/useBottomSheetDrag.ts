'use client';

import { useRef, useCallback, useEffect } from 'react';

interface UseBottomSheetDragOptions {
  onClose: () => void;
  isOpen?: boolean;
  dismissThreshold?: number; // Distance in px needed to dismiss
  velocityThreshold?: number; // Velocity in px/ms needed to dismiss
}

export function useBottomSheetDrag({
  onClose,
  isOpen = true,
  dismissThreshold = 70,
  velocityThreshold = 0.35,
}: UseBottomSheetDragOptions) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const currentYRef = useRef(0);
  const startTimeRef = useRef(0);
  const isIntentLockedRef = useRef(false);
  const pointerHistoryRef = useRef<{ y: number; time: number }[]>([]);
  const isClosingRef = useRef(false);

  // Reset transforms whenever the sheet opens
  useEffect(() => {
    if (isOpen) {
      isClosingRef.current = false;
      if (sheetRef.current) {
        sheetRef.current.style.transform = '';
        sheetRef.current.style.transition = '';
      }
      if (backdropRef.current) {
        backdropRef.current.style.opacity = '';
        backdropRef.current.style.transition = '';
      }
    }
  }, [isOpen]);

  const dismissWithAnimation = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)';
      sheetRef.current.style.transform = 'translateY(100%)';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'opacity 0.22s ease';
      backdropRef.current.style.opacity = '0';
    }

    setTimeout(() => {
      onClose();
      if (sheetRef.current) {
        sheetRef.current.style.transform = '';
        sheetRef.current.style.transition = '';
      }
      if (backdropRef.current) {
        backdropRef.current.style.opacity = '';
        backdropRef.current.style.transition = '';
      }
      isClosingRef.current = false;
    }, 220);
  }, [onClose]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only activate for mobile viewports (bottom sheet mode, < 640px)
    if (typeof window !== 'undefined' && window.innerWidth >= 640) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (isClosingRef.current) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    isDraggingRef.current = true;
    isIntentLockedRef.current = false;
    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    currentYRef.current = 0;
    startTimeRef.current = performance.now();
    pointerHistoryRef.current = [{ y: e.clientY, time: performance.now() }];

    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'none';
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || isClosingRef.current) return;

    const deltaY = e.clientY - startYRef.current;
    const deltaX = e.clientX - startXRef.current;

    // Intent detection: prevent horizontal swipes from triggering sheet dismiss
    if (!isIntentLockedRef.current) {
      const dist = Math.hypot(deltaX, deltaY);
      if (dist < 6) return;
      isIntentLockedRef.current = true;
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        isDraggingRef.current = false;
        return;
      }
    }

    // Direct tracking: downwards movement translates 1:1, upwards has soft rubberband resistance
    let translateY = deltaY;
    if (translateY < 0) {
      translateY = deltaY * 0.18;
    }

    currentYRef.current = translateY;

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${translateY}px)`;
    }
    if (backdropRef.current && translateY > 0) {
      const opacity = Math.max(0.1, 1 - translateY / 380);
      backdropRef.current.style.opacity = String(opacity);
    }

    const now = performance.now();
    pointerHistoryRef.current.push({ y: e.clientY, time: now });
    pointerHistoryRef.current = pointerHistoryRef.current.filter((p) => now - p.time <= 90);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (!isDraggingRef.current || isClosingRef.current) return;
    isDraggingRef.current = false;

    const deltaY = e.clientY - startYRef.current;
    const deltaX = e.clientX - startXRef.current;
    const totalDist = Math.hypot(deltaX, deltaY);
    const duration = performance.now() - startTimeRef.current;

    // 1. Direct Tap on the Handle/Header (< 8px movement, < 250ms) -> dismiss smoothly
    if (totalDist < 8 && duration < 250) {
      dismissWithAnimation();
      return;
    }

    // 2. Velocity calculation for flick-down dismiss
    const now = performance.now();
    const history = pointerHistoryRef.current.filter((p) => now - p.time <= 90);
    let velocity = 0;
    if (history.length >= 2) {
      const oldest = history[0];
      const newest = history[history.length - 1];
      const dt = newest.time - oldest.time;
      if (dt > 10) {
        velocity = (newest.y - oldest.y) / dt; // px/ms
      }
    }

    const shouldDismiss =
      currentYRef.current > dismissThreshold ||
      (currentYRef.current > 20 && velocity > velocityThreshold);

    if (shouldDismiss) {
      dismissWithAnimation();
    } else {
      // Snap back to original position
      if (sheetRef.current) {
        sheetRef.current.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        sheetRef.current.style.transform = 'translateY(0px)';
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = 'opacity 0.28s ease';
        backdropRef.current.style.opacity = '1';
      }
    }
  }, [dismissThreshold, velocityThreshold, dismissWithAnimation]);

  const handlePointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    if (!isDraggingRef.current || isClosingRef.current) return;
    isDraggingRef.current = false;

    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      sheetRef.current.style.transform = 'translateY(0px)';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'opacity 0.25s ease';
      backdropRef.current.style.opacity = '1';
    }
  }, []);

  return {
    sheetRef,
    backdropRef,
    dismissWithAnimation,
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      style: {
        touchAction: 'none' as const,
        userSelect: 'none' as const,
        WebkitUserSelect: 'none' as const,
        WebkitTouchCallout: 'none' as const,
      },
    },
  };
}
