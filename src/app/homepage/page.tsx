'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { verifyTokenForService, ServiceType } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';
import CaregiverHomePage from '@/components/homepage/Caregiver';
import PacilianHomePage from '@/components/homepage/Pacilian';

export default function Homepage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isServiceVerified, setIsServiceVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyService = async () => {
      if (user) {
        const isVerified = await verifyTokenForService('auth');
        setIsServiceVerified(isVerified);
      }
    };

    if (!isLoading && user) {
      verifyService();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      if (isServiceVerified === false) {
        tokenService.clearAuth();
        router.replace('/login');
        return;
      }
    }
  }, [user, isLoading, router, isServiceVerified]);

  if (isLoading || isServiceVerified === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || isServiceVerified === false) {
    return null;
  }

  if (user.role === 'CAREGIVER') {
    return <CaregiverHomePage username={user.name} />;
  }

  if (user.role === 'PACILIAN') {
    return <PacilianHomePage username={user.name} />;
  }

  return <div className="flex items-center justify-center min-h-screen">Unauthorized access</div>;
}
