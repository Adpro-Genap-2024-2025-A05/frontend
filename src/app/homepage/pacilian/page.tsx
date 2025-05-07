"use client";
import { useState } from 'react';

export default function PandaCareHomepage() {
  const [username, setUsername] = useState('Pacilian');

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
            <span className="text-xl font-semibold">Cari Dokter Sekarang</span>
          </button>
          
          <button className="flex items-center bg-white border border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="bg-gray-100 p-2 rounded-full mr-4">
            </div>
            <span className="text-xl font-semibold">Chat dengan Dokter</span>
          </button>
        </div>

        <div className="flex justify-center max-w-3xl mx-auto">
          <button className="flex items-center bg-white border border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition w-full md:w-1/2">
            <div className="bg-gray-100 p-2 rounded-full mr-4">
            </div>
            <span className="text-xl font-semibold">Status dan Jadwal Konsultasi Anda</span>
          </button>
        </div>
      </main>
    </div>
  );
}