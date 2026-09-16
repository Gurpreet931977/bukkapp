'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountBookingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/account');
  }, [router]);
  return <div className="p-12 text-center text-xs text-neutral-400">Loading bookings...</div>;
}
