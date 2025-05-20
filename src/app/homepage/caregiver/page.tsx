'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function CaregiverHomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [username, setUsername] = useState('CareGiver');

  useEffect(() => {
    if (user) {
      setUsername(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'CAREGIVER') {
        router.replace('/homepage/pacilian');
      }
    }
  }, [user, isLoading, router]);

  const handleChatWithPacilian = () => {
    router.push('/chat/sessions');
  };

  return (
    <div className="min-h-screen bg-white">
    

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="w-full mb-6">
        <img 
            src="/pandabanyak.jpg" 
            alt="Panda Doctor and Baby Pandas"
            className="w-full h-auto object-cover"
            style={{ maxHeight: '2000px' }} 
        />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-400">Selamat Datang, {username}!</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-4">
          <button className="flex items-center bg-white border border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="bg-gray-100 p-2 rounded-full mr-4">
              
            </div>
            <span className="text-xl font-semibold">Kelola Jadwal Konsultasi</span>
          </button>
          
          <button 
            onClick={handleChatWithPacilian}
            className="flex items-center bg-white border border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="bg-gray-100 p-2 rounded-full mr-4">
              {/* Ikon chat */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xl font-semibold">Chat dengan Pacilian</span>
          </button>
        </div>
      </main>
    </div>
  );
}