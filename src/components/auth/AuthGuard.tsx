'use client';

// ============================================================================
// BUKKAPP Role-Based Access Control (RBAC) Route Guard
// Defends /admin, /business/*, and /account/* against unauthorized access
// ============================================================================

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { BrandText } from '@/components/ui/BrandLogo';
import { ShieldAlert, Lock, ArrowRight, Home, Store, UserCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function AuthGuard({
  children,
  allowedRoles = ['customer', 'business_owner', 'admin'],
  requireAuth = true,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-lime flex items-center justify-center font-display font-black text-xl text-brand-black animate-pulse shadow-md">
          B
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-muted">
          Verifying Security Credentials...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF8]">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-brand-border shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-display font-extrabold text-brand-black mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed mb-6">
            Please log in to your verified <BrandText /> account to access this area.
          </p>

          <div className="space-y-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-black text-white font-bold text-sm hover:bg-neutral-800 transition-all shadow-md active:scale-98"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4 text-brand-lime" />
            </Link>

            <Link
              href={`/signup?redirect=${encodeURIComponent(pathname)}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-100 text-brand-black font-bold text-sm hover:bg-neutral-200 transition-all border border-brand-border active:scale-98"
            >
              <span>Create New Account</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-brand-muted hover:text-brand-black font-semibold pt-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated but unauthorized role (Master Admin has universal clearance)
  const hasAllowedRole = role ? (role === 'admin' || allowedRoles.includes(role)) : false;

  if (!hasAllowedRole) {
    const isAdminOnly = allowedRoles.length === 1 && allowedRoles[0] === 'admin';
    const isBusinessOnly = allowedRoles.includes('business_owner') && !allowedRoles.includes('customer');

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAFAF8]">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 border-2 border-brand-border shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-display font-extrabold text-brand-black mb-2">
            {isAdminOnly ? 'Admin Privilege Required' : 'Access Restricted'}
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed mb-6">
            {isAdminOnly
              ? 'This administration control room is exclusively accessible to verified BUKKAPP administrators.'
              : isBusinessOnly
              ? 'This merchant management portal requires a registered business owner account. Standard customer accounts cannot view merchant controls.'
              : 'Your current account does not have permission to access this resource.'}
          </p>

          {/* Current Persona Badge */}
          <div className="mb-6 p-4 rounded-2xl bg-neutral-50 border border-brand-border/80 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-black text-white font-bold text-xs flex items-center justify-center">
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-brand-black">{user?.name}</p>
                <p className="text-[11px] text-brand-muted">{user?.email}</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-800 border border-neutral-300">
              {user?.role}
            </span>
          </div>

          <div className="space-y-3">
            {isAdminOnly ? (
              <Link
                href="/login?tab=admin"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-black text-white font-bold text-sm hover:bg-neutral-800 transition-all shadow-md active:scale-98"
              >
                <span>Log In with Admin Passkey</span>
                <ArrowRight className="w-4 h-4 text-brand-lime" />
              </Link>
            ) : isBusinessOnly ? (
              <Link
                href="/business/onboarding"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C7F36B] text-brand-black font-extrabold text-sm hover:bg-[#bbf054] transition-all border border-brand-black shadow-md active:scale-98"
              >
                <Store className="w-4 h-4 text-brand-black" />
                <span>Register Your Business On BUKKAPP</span>
              </Link>
            ) : null}

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-100 text-brand-black font-bold text-sm hover:bg-neutral-200 transition-all border border-brand-border active:scale-98"
            >
              <UserCheck className="w-4 h-4 text-brand-muted" />
              <span>Switch or Log Into Another Account</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-brand-muted hover:text-brand-black font-semibold pt-2"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
