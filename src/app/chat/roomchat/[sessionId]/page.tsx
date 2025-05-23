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
        setError('');
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

        setAllMessages(prev => prev.map(m => m.id === tempId ? updated : m));
        setVisibleMessages(prev => prev.map(m => m.id === tempId ? updated : m));
      } catch {
        setAllMessages(prev => prev.filter(m => m.id !== tempId));
        setVisibleMessages(prev => prev.filter(m => m.id !== tempId));
        alert('Gagal mengirim pesan. Silakan coba lagi.');
      }
    })();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center">
          <button 
            className="mr-4 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200" 
            onClick={() => router.push('/chat/sessions')}
          >
            <ArrowLeft size={24} className="text-blue-600" />
          </button>
          {partnerInfo && (
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-4 shadow-md">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 text-lg">{partnerInfo.name}</h2>
                <p className="text-sm text-blue-600 font-medium">
                  {partnerInfo.role === 'caregiver' ? 'Caregiver' : 'Pacilian'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={containerRef} 
        onScroll={handleScroll} 
        className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-blue-25 to-white"
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(219, 234, 254, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <User size={32} className="text-blue-500" />
            </div>
            <p className="text-blue-400 text-lg font-medium">Belum ada pesan</p>
            <p className="text-blue-300 text-sm">Mulai percakapan dengan mengirim pesan!</p>
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

      {/* Input Container */}
      <div className="bg-white border-t border-blue-100 px-6 py-4 shadow-lg">
        <ChatInputBox
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}