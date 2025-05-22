'use client';

import React, { useEffect, useRef, useState, UIEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import ChatMessageList from '../components/ChatMessageList';
import ChatInputBox from '../components/ChatInputBox';
import { verifyTokenForService } from '@/middleware/apiMiddleware';
import tokenService from '@/services/tokenService';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  sessionId: string;
  createdAt: string;
  editedAt?: string;
  edited: boolean;
  deleted: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  role: 'pacilian' | 'caregiver';
  avatar?: string | null;
}

const MESSAGES_PER_LOAD = 15;

export default function ChatSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<UserInfo | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    const fetchMessages = async () => {
      const isValid = await verifyTokenForService('chat');
      if (!isValid) {
        router.push('/login');
        return;
      }

      const token = tokenService.getToken();
      const user = tokenService.getUser();
      if (!token || !user) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/chat/session/${params.sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Gagal mengambil pesan chat');

        const responseJson = await res.json();
        const data = responseJson.data;

        const formattedMessages: ChatMessage[] = data.messages
          .map((msg: any): ChatMessage => ({
            ...msg,
            edited: msg.edited,
            deleted: msg.deleted,
            createdAt: msg.createdAt,
          }))
          .sort((a: ChatMessage, b: ChatMessage) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setAllMessages(formattedMessages);
        setVisibleMessages(formattedMessages.slice(-MESSAGES_PER_LOAD));
        offsetRef.current = MESSAGES_PER_LOAD;

        const isCurrentUserPacilian = user.id === data.pacilian;
        setCurrentUser({
          id: user.id,
          name: user.name,
          role: isCurrentUserPacilian ? 'pacilian' : 'caregiver',
        });

        setPartnerInfo({
          id: isCurrentUserPacilian ? data.caregiver : data.pacilian,
          name: isCurrentUserPacilian ? data.caregiverName : data.pacilianName,
          role: isCurrentUserPacilian ? 'caregiver' : 'pacilian',
        });

        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView();
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [params.sessionId, router]);

  const loadMoreMessages = () => {
    const total = allMessages.length;
    const nextOffset = offsetRef.current + MESSAGES_PER_LOAD;
    const start = Math.max(0, total - nextOffset);
    const newMessages = allMessages.slice(start, total);
    setVisibleMessages(newMessages);
    offsetRef.current = nextOffset;
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop === 0 && offsetRef.current < allMessages.length) {
      prevScrollHeightRef.current = container.scrollHeight;
      loadMoreMessages();
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/chat/message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) throw new Error('Gagal mengedit pesan');

      const saved = (await res.json()).data;

      const updated: ChatMessage = {
        id: saved.id,
        content: saved.content,
        senderId: saved.senderId,
        sessionId: saved.session?.id || params.sessionId,
        createdAt: saved.createdAt,
        editedAt: saved.editedAt,
        edited: saved.edited,
        deleted: saved.deleted,
      };

      setAllMessages(prev => prev.map(m => m.id === messageId ? updated : m));
      setVisibleMessages(prev => prev.map(m => m.id === messageId ? updated : m));
    } catch {
      alert('Gagal mengedit pesan.');
    }
  };


  const handleDeleteMessage = async (messageId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus pesan');

      setAllMessages(prev => prev.map(m => m.id === messageId
        ? { ...m, deleted: true, content: 'Pesan telah dihapus' }
        : m));
      setVisibleMessages(prev => prev.map(m => m.id === messageId
        ? { ...m, deleted: true, content: 'Pesan telah dihapus' }
        : m));
    } catch {
      alert('Gagal menghapus pesan.');
    }
  };

  const handleSendMessage = () => {
    if (!input.trim() || !currentUser) return;

    const token = tokenService.getToken();
    if (!token) return router.push('/login');

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      content: input,
      senderId: currentUser.id,
      sessionId: params.sessionId,
      createdAt: new Date().toISOString(),
      editedAt: '',
      edited: false,
      deleted: false,
    };

    // Tambahkan pesan sementara
    setAllMessages(prev => [...prev, tempMessage]);
    setVisibleMessages(prev => [...prev, tempMessage]);
    setInput('');

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: tempMessage.content, sessionId: params.sessionId }),
        });

        if (!res.ok) throw new Error('Gagal mengirim pesan');

        const saved = (await res.json()).data;

        const updated: ChatMessage = {
          id: saved.id,
          content: saved.content,
          senderId: saved.senderId,
          sessionId: saved.session?.id || params.sessionId,
          createdAt: saved.createdAt,
          editedAt: saved.editedAt,
          edited: saved.edited,
          deleted: saved.deleted,
        };

        // Ganti tempMessage dengan yang dari backend
        setAllMessages(prev => prev.map(m => m.id === tempId ? updated : m));
        setVisibleMessages(prev => prev.map(m => m.id === tempId ? updated : m));
      } catch {
        // Hapus pesan sementara jika gagal
        setAllMessages(prev => prev.filter(m => m.id !== tempId));
        setVisibleMessages(prev => prev.filter(m => m.id !== tempId));
        alert('Gagal mengirim pesan. Silakan coba lagi.');
      }
    })();
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white p-4 shadow flex items-center">
        <button className="mr-3" onClick={() => router.push('/chat/sessions')}>
          <ArrowLeft size={24} />
        </button>
        {partnerInfo && (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <User size={20} className="text-gray-500" />
            </div>
            <div>
              <h2 className="font-medium">{partnerInfo.name}</h2>
              <p className="text-xs text-gray-500">
                {partnerInfo.role === 'caregiver' ? 'Caregiver' : 'Pacilian'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mx-auto max-w-md">
            <p>{error}</p>
            <button className="mt-2 text-blue-500 hover:underline" onClick={() => window.location.reload()}>
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            <ChatMessageList
              messages={visibleMessages}
              currentUserId={currentUser?.id || ''}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <ChatInputBox
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}
