"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatSessionCard from './components/ChatSessionCard';
import { Search } from 'lucide-react';

interface ChatMessage {
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  user2: {
    id: string;
    name: string;
    role: 'pacilian' | 'caregiver';
    avatar?: string | null;
  };
  updatedAt: string;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}

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

        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole') as 'PACILIAN' | 'CAREGIVER' | null;

        if (!token || !userRole) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/chat/session/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data sesi chat');
        }

        const json = await response.json();
        const sessionData = json.data;

        const mapped = sessionData.map((session: any) => {
          const isPacilian = userRole === 'PACILIAN';
          const user2Id = isPacilian ? session.caregiver : session.pacilian;

          return {
            id: session.id,
            user2: {
              id: user2Id,
              name: 'Pengguna', 
              role: isPacilian ? 'caregiver' : 'pacilian',
              avatar: null,
            },
            updatedAt: session.createdAt,
            lastMessage: session.messages?.length
              ? {
                  content: session.messages[session.messages.length - 1].content,
                  timestamp: session.messages[session.messages.length - 1].createdAt,
                }
              : undefined,
          } as ChatSession;
        });

        setSessions(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error('Error fetching chat sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  const filteredSessions = sessions.filter(session =>
    session.user2.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
  };

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-6">Riwayat Chat</h1>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
          <button
            className="mt-2 text-blue-500 hover:underline"
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Tidak ada session chat ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <ChatSessionCard
              key={session.id}
              session={session}
              onClick={() => handleSessionClick(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
