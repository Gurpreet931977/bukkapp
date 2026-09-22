'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal Root Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#FAFAF8] text-[#111111] p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-8 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center font-black text-2xl mx-auto">
            !
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
              System Recovery
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              BUKKAPP encountered an unexpected interruption. Your appointment data and verified schedule are securely preserved.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Reload BUKKAPP
            </button>
            <a
              href="/"
              className="w-full py-3 px-4 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-colors text-center"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
