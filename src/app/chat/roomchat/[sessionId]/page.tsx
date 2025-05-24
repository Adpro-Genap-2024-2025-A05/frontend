'use client';

import React, { useEffect, useRef, useState, UIEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, AlertCircle, CheckCircle, X } from 'lucide-react';
import ChatMessageList from '../components/ChatMessageList';
import ChatInputBox from '../components/ChatInputBox';
import chatService, { ChatMessage, AjaxState } from '@/api/chatApi';
import tokenService from '@/services/tokenService';

interface UserInfo {
  id: string;
  name: string;
  role: 'pacilian' | 'caregiver';
  avatar?: string | null;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
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
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const prevScrollHeightRef = useRef(0);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = tokenService.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const messages = await chatService.getMessages(params.sessionId);

        const sortedMessages = messages.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setAllMessages(sortedMessages);
        setVisibleMessages(sortedMessages.slice(-MESSAGES_PER_LOAD));
        offsetRef.current = MESSAGES_PER_LOAD;

        const sessions = await chatService.getSessions();
        const currentSession = sessions.find(s => s.id === params.sessionId);

        if (currentSession) {
          setCurrentUser({
            id: user.id,
            name: user.name,
            role: user.role === 'PACILIAN' ? 'pacilian' : 'caregiver',
          });
          setPartnerInfo(currentSession.user2);
        }

        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView();
        });
      } catch (err) {
        console.error('Error fetching messages:', err);

        if (err instanceof Error && err.message === 'Token tidak valid') {
          router.push('/login');
          return;
        }

        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [params.sessionId, router]);

  useEffect(() => {
    if (!params.sessionId || !currentUser) return;

    const pollingInterval = setInterval(async () => {
      try {
        const newMessages = await chatService.getMessages(params.sessionId);
        const sortedMessages = newMessages.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setAllMessages(prev => {
          const prevLastId = prev.at(-1)?.id;
          const newLastId = sortedMessages.at(-1)?.id;
          if (prevLastId === newLastId) return prev;
          return sortedMessages;
        });

        setVisibleMessages(prev => {
          const prevLastId = prev.at(-1)?.id;
          const newLastId = sortedMessages.at(-1)?.id;
          if (prevLastId === newLastId) return prev;
          return sortedMessages.slice(-offsetRef.current);
        });
      } catch (err) {
        console.error('Polling error:', err);
        if (err instanceof Error && err.message === 'Token tidak valid') {
          router.push('/login');
        }
      }
    }, 3000);

    return () => clearInterval(pollingInterval);
  }, [params.sessionId, currentUser]);

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
    setAllMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isEditing: true, error: undefined } : m
    ));
    setVisibleMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isEditing: true, error: undefined } : m
    ));

    try {
      const updatedMessage = await chatService.editMessage(
        messageId,
        newContent,
        (state: AjaxState) => {
          if (state.error) showNotification(state.error, 'error');
        }
      );

      setAllMessages(prev => prev.map(m =>
        m.id === messageId ? { ...updatedMessage, isEditing: false, error: undefined } : m
      ));
      setVisibleMessages(prev => prev.map(m =>
        m.id === messageId ? { ...updatedMessage, isEditing: false, error: undefined } : m
      ));

      showNotification('Pesan berhasil diedit', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengedit pesan';
      setAllMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isEditing: false, error: errorMessage } : m
      ));
      setVisibleMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isEditing: false, error: errorMessage } : m
      ));
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setAllMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isDeleting: true, error: undefined } : m
    ));
    setVisibleMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isDeleting: true, error: undefined } : m
    ));

    try {
      await chatService.deleteMessage(
        messageId,
        (state: AjaxState) => {
          if (state.error) showNotification(state.error, 'error');
        }
      );

      const deletedMessage = { deleted: true, content: 'Pesan telah dihapus' };
      setAllMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, ...deletedMessage, isDeleting: false } : m
      ));
      setVisibleMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, ...deletedMessage, isDeleting: false } : m
      ));

      showNotification('Pesan berhasil dihapus', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus pesan';
      setAllMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isDeleting: false, error: errorMessage } : m
      ));
      setVisibleMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isDeleting: false, error: errorMessage } : m
      ));
      showNotification(errorMessage, 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser || sending) return;

    const messageContent = input.trim();
    setInput('');
    setSending(true);

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      content: messageContent,
      senderId: currentUser.id,
      sessionId: params.sessionId,
      createdAt: new Date().toISOString(),
      edited: false,
      deleted: false,
      isLoading: true,
    };

    setAllMessages(prev => [...prev, tempMessage]);
    setVisibleMessages(prev => [...prev, tempMessage]);

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    try {
      const savedMessage = await chatService.sendMessage(
        params.sessionId,
        messageContent,
        (state: AjaxState) => {
          if (state.error) showNotification(state.error, 'error');
        }
      );

      setAllMessages(prev => prev.map(m =>
        m.id === tempId ? { ...savedMessage, isLoading: false } : m
      ));
      setVisibleMessages(prev => prev.map(m =>
        m.id === tempId ? { ...savedMessage, isLoading: false } : m
      ));

      showNotification('Pesan berhasil dikirim', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim pesan';
      setAllMessages(prev => prev.filter(m => m.id !== tempId));
      setVisibleMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(messageContent);
      showNotification(errorMessage, 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-blue-500 font-medium">Memuat percakapan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="flex justify-center items-center flex-1">
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm max-w-md">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <User size={20} className="text-white" />
              </div>
              <h3 className="text-red-700 font-semibold">Terjadi Kesalahan</h3>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg 
                         font-medium transition-colors duration-200 shadow-sm text-sm"
                onClick={() => window.location.reload()}
              >
                Coba lagi
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg 
                         font-medium transition-colors duration-200 shadow-sm text-sm"
                onClick={() => router.push('/chat/sessions')}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <AlertCircle size={20} />}
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-2 hover:opacity-80"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

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
        {allMessages.length === 0 ? (
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
          disabled={sending}
          placeholder={sending ? 'Mengirim pesan...' : 'Ketik pesan...'}
        />
      </div>
    </div>
  );
}