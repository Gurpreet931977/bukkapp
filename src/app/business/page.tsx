'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/business/dashboard');
  }, [router]);
  return <div className="p-12 text-center text-xs text-neutral-400">Loading Business Dashboard...</div>;
}
