'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';

export default function TestPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['CAREGIVER']} requiredService="konsultasi">
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">
            INI PAGE BUAT CARA PAKAI MIDDLEWARENYA
          </h1>
        </div>
      </div>
    </ProtectedRoute>
  );
}