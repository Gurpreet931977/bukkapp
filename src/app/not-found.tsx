import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAFAF8] px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-black text-brand-lime flex items-center justify-center font-black text-2xl mx-auto shadow-card">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
            The page, business profile, or booking link you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full justify-center font-bold text-xs bg-brand-black text-white gap-1.5">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>

          <Link href="/search" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full justify-center font-bold text-xs gap-1.5">
              <Search className="w-4 h-4" />
              <span>Search Businesses</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
