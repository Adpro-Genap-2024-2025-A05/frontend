'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { verifyTokenForService, ServiceType } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredService?: ServiceType; 
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requiredService = 'auth'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isServiceVerified, setIsServiceVerified] = useState<boolean | null>(null);
  
  useEffect(() => {
    const verifyService = async () => {
      if (user) {
        const isVerified = await verifyTokenForService(requiredService);
        setIsServiceVerified(isVerified);
      }
    };
    
    if (!isLoading && user) {
      verifyService();
    }
  }, [user, isLoading, requiredService]);

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
      
      if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace('/');
      }
    }
  }, [user, isLoading, router, allowedRoles, isServiceVerified]);

  if (isLoading || isServiceVerified === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || isServiceVerified === false) {
    return null; 
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="flex items-center justify-center min-h-screen">Unauthorized access</div>;
  }

  return <>{children}</>;
}