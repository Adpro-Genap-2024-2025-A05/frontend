'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } 
      else if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'PACILIAN') {
          router.replace('/homepage/pacilian');
        } else if (user.role === 'CAREGIVER') {
          router.replace('/homepage/caregiver');
        } else {
          router.replace('/');
        }
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="flex items-center justify-center min-h-screen">Unauthorized access</div>;
  }

  return <>{children}</>;
}