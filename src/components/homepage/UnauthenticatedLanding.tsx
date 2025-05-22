'use client';
import { useRouter } from 'next/navigation';

export default function UnauthenticatedLanding() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="w-full mb-6">
          <img 
            src="/pandabanyak.jpg" 
            alt="Panda Doctor and Baby Pandas"
            className="w-full h-auto object-cover"
            style={{ maxHeight: '500px' }} 
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-400">Welcome to Our Platform</h1>
          <p className="mt-4 text-xl">Connect with healthcare professionals easily and securely</p>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Log In
          </button>
          <button 
            onClick={() => router.push('/register')}
            className="px-8 py-3 border border-blue-500 text-blue-500 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Register
          </button>
        </div>
      </main>
    </div>
  );
}