"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User } from 'lucide-react';
import ChatMessageList from './components/ChatMessageList';
import ChatInputBox from './components/ChatInputBox';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  sessionId: string;
  timestamp: string;
  isDeleted: boolean;
}

interface User {
  id: string;
  name: string;
  role: 'pacilian' | 'caregiver';
  avatar?: string | null;
}

export default function ChatSessionPage({ params }: { params: { sessionId: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const router = useRouter();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/chat/session/${params.sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil pesan chat');
        }

        const data = await response.json();
        setMessages(data);
        
        
        if (data.length > 0) {
          
          const demoPartner = {
            id: "partner-id",
            name: "Partner Name",
            role: data[0].senderId === "current-user-id" ? 'pacilian' : 'caregiver'
          } as User;
          
          setPartnerInfo(demoPartner);
          setCurrentUser({ id: "current-user-id" });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [params.sessionId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentUser) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const tempId = `temp-${Date.now()}`;
      const tempMessage: ChatMessage = {
        id: tempId,
        content,
        senderId: currentUser.id,
        sessionId: params.sessionId,
        timestamp: new Date().toISOString(),
        isDeleted: false
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      const response = await fetch('/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          sessionId: params.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengirim pesan');
      }
      
      const savedMessage = await response.json();
      
     
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? savedMessage : msg)
      );
      
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      
      alert('Gagal mengirim pesan. Silakan coba lagi.');
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent } 
            : msg
        )
      );
      
      const response = await fetch(`/chat/message/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newContent
        })
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengedit pesan');
      }
      
      const updatedMessage = await response.json();
      
      // Update the message with the response from server
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? updatedMessage : msg)
      );
      
    } catch (err) {
      console.error('Error editing message:', err);
      
      alert('Gagal mengedit pesan. Silakan coba lagi.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: true, content: 'Pesan telah dihapus' } 
            : msg
        )
      );
      
      const response = await fetch(`/chat/message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus pesan');
      }
      
    } catch (err) {
      console.error('Error deleting message:', err);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: false } 
            : msg
        )
      );
      alert('Gagal menghapus pesan. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow flex items-center">
        <button 
          className="mr-3" 
          onClick={() => router.push('/chat/sessions')}
        >
          <ArrowLeft size={24} />
        </button>
        
        {partnerInfo ? (
          <div className="flex items-center">
            {partnerInfo.avatar ? (
              <img 
                src={partnerInfo.avatar} 
                alt={partnerInfo.name} 
                className="w-10 h-10 rounded-full mr-3" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <User size={20} className="text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="font-medium">{partnerInfo.name}</h2>
              <p className="text-xs text-gray-500">
                {partnerInfo.role === 'caregiver' ? 'Caregiver' : 'Pacilian'}
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-pulse flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mx-auto max-w-md">
            <p>{error}</p>
            <button 
              className="mt-2 text-blue-500 hover:underline"
              onClick={() => window.location.reload()}
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <ChatMessageList 
            messages={messages} 
            currentUserId={currentUser?.id || ''} 
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <ChatInputBox onSendMessage={handleSendMessage} />
    </div>
  );
}