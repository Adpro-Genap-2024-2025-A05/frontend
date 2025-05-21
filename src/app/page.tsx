'use client';
import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import CaregiverHomePage from '@/components/homepage/Caregiver';
import PacilianHomePage from '@/components/homepage/Pacilian';
import UnauthenticatedLanding from '@/components/homepage/UnauthenticatedLanding';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.name || (user.role === 'CAREGIVER' ? 'CareGiver' : 'Pacilian'));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <>
        {user.role === 'CAREGIVER' ? (
          <CaregiverHomePage username={username} />
        ) : (
          <PacilianHomePage username={username} />
        )}
      </>
    );
  }

  return <UnauthenticatedLanding />;
}