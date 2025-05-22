'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScheduleIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/schedule');
  }, [router]);

  return null;
}