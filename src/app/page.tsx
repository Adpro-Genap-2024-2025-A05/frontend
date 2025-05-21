'use client';
import useAuth from '@/hooks/useAuth';
import CaregiverHomePage from '@/components/homepage/Caregiver';
import PacilianHomePage from '@/components/homepage/Pacilian';
import UnauthenticatedLanding from '@/components/homepage/UnauthenticatedLanding';

export default function RootPage() {
  const { user, isLoading } = useAuth();

  const getDisplayName = () => {
    if (!user) return '';
    if (user.name) return user.name;
    return user.role === 'CAREGIVER' ? 'CareGiver' : 'Pacilian';
  };

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
    return user.role === 'CAREGIVER' ? (
      <CaregiverHomePage username={getDisplayName()} />
    ) : (
      <PacilianHomePage username={getDisplayName()} />
    );
  }

  return <UnauthenticatedLanding />;
}