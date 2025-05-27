'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatSessionCard from './components/ChatSessionCard';
import { Search, MessageSquare, Users } from 'lucide-react';
import chatService, { ChatSession } from '@/api/chatApi';

export default function ChatSessionsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sessionData = await chatService.getSessions();
        setSessions(sessionData);
      } catch (err) {
        console.error('Error fetching chat sessions:', err);
        
        if (err instanceof Error && err.message === 'Token tidak valid') {
          router.push('/login');
          return;
        }
        
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  const filteredSessions = sessions.filter((session) =>
    session.user2.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat/roomchat/${sessionId}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl 
                          flex items-center justify-center mr-4 shadow-lg">
              <MessageSquare size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Riwayat Chat</h1>
              <p className="text-blue-600">Kelola percakapan Anda</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau pesan..."
              className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl 
                       focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                       transition-all duration-200 text-gray-700 placeholder-blue-300
                       shadow-sm hover:border-blue-300 bg-white/80 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <p className="text-blue-500 font-medium">Memuat riwayat chat...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <MessageSquare size={20} className="text-white" />
              </div>
              <h3 className="text-red-700 font-semibold">Terjadi Kesalahan</h3>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg 
                       font-medium transition-colors duration-200 shadow-sm"
              onClick={handleRetry}
            >
              Coba lagi
            </button>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? 'Tidak ada hasil' : 'Belum ada percakapan'}
              </h3>
              <p className="text-blue-400">
                {searchTerm 
                  ? `Tidak ditemukan chat dengan kata kunci "${searchTerm}"`
                  : 'Mulai percakapan baru dengan caregiver atau pacilian'
                }
              </p>
            </div>
            {searchTerm && (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg 
                         font-medium transition-colors duration-200 shadow-sm"
                onClick={() => setSearchTerm('')}
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-blue-600 font-medium">
                {filteredSessions.length} percakapan
                {searchTerm && ` untuk "${searchTerm}"`}
              </p>
              {searchTerm && (
                <button
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium
                           hover:underline transition-colors duration-200"
                  onClick={() => setSearchTerm('')}
                >
                  Hapus filter
                </button>
              )}
            </div>

            {[...filteredSessions]
            .sort((a, b) => {
              const dateA = new Date(a.lastMessage?.createdAt ?? a.updatedAt).getTime();
              const dateB = new Date(b.lastMessage?.createdAt ?? b.updatedAt).getTime();
              return dateB - dateA; 
            })
            .map((session) => (
              <ChatSessionCard
                key={session.id}
                session={session}
                onClick={() => handleSessionClick(session.id)}
              />
          ))}
          </div>
        )}
      </div>
    </div>
  );
}