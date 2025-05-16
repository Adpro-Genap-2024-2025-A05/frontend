import React from 'react';
import { MoreVertical, Edit, Trash, Check, X } from 'lucide-react';
import { useState } from 'react';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isDeleted?: boolean;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
}

export default function ChatMessageList({ messages, currentUserId, onEdit, onDelete }: ChatMessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
    setShowMenu(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleSaveEdit = (messageId: string) => {
    onEdit(messageId, editText);
    setEditingMessageId(null);
  };

  const toggleMenu = (messageId: string) => {
    setShowMenu(showMenu === messageId ? null : messageId);
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Belum ada pesan. Mulai percakapan!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.senderId === currentUserId;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`relative max-w-xs md:max-w-md ${
                isCurrentUser 
                  ? 'bg-blue-500 text-white rounded-t-lg rounded-bl-lg' 
                  : 'bg-white text-gray-700 rounded-t-lg rounded-br-lg shadow'
              } p-3`}
            >
              {editingMessageId === message.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border rounded text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button 
                      onClick={handleCancelEdit}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      onClick={() => handleSaveEdit(message.id)}
                      className="p-1 rounded-full hover:bg-blue-200 text-blue-600"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={message.isDeleted ? 'italic text-gray-500' : ''}>
                    {message.content}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                    
                    {isCurrentUser && !message.isDeleted && (
                      <div className="relative">
                        <button 
                          className={`p-1 rounded-full ${
                            isCurrentUser ? 'text-blue-100 hover:bg-blue-600' : 'text-gray-500 hover:bg-gray-200'
                          }`}
                          onClick={() => toggleMenu(message.id)}
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {showMenu === message.id && (
                          <div className="absolute bottom-full right-0 mb-1 bg-white text-gray-700 rounded shadow-lg p-1 w-32">
                            <button 
                              className="flex items-center w-full p-2 hover:bg-gray-100 rounded text-left"
                              onClick={() => handleStartEdit(message)}
                            >
                              <Edit size={14} className="mr-2" />
                              <span>Edit</span>
                            </button>
                            <button 
                              className="flex items-center w-full p-2 hover:bg-gray-100 rounded text-left text-red-500"
                              onClick={() => {
                                onDelete(message.id);
                                setShowMenu(null);
                              }}
                            >
                              <Trash size={14} className="mr-2" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}