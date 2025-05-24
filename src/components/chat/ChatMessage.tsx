import React, { useState } from 'react';
import { Edit, Trash, Check, X, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { ChatBubble } from './ChatBubble';

interface ChatMessageProps {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  editedAt?: string;
  deleted?: boolean;
  edited?: boolean;
  currentUserId: string;
  isLoading?: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  error?: string;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  senderId,
  createdAt,
  editedAt,
  deleted = false,
  edited = false,
  currentUserId,
  isLoading = false,
  isEditing = false,
  isDeleting = false,
  error,
  onEdit,
  onDelete,
}) => {
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const isOwnMessage = senderId === currentUserId;

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createdTime = formatTime(createdAt);
  const editedTime = formatTime(editedAt || '');

  const handleStartEdit = () => {
    setIsLocalEditing(true);
    setEditContent(content);
  };

  const handleCancelEdit = () => setIsLocalEditing(false);

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(id, editContent);
      setIsLocalEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-full`}>
        <ChatBubble isOwnMessage={isOwnMessage}>
          {isLocalEditing ? (
            <div className="w-full">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full p-3 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 transition-all duration-200
                  ${isOwnMessage 
                    ? 'bg-blue-400/20 border-blue-300 text-white placeholder-blue-200 focus:ring-blue-300/50' 
                    : 'bg-gray-50 border-blue-200 text-gray-800 placeholder-gray-400 focus:ring-blue-300/50'
                  }`}
                rows={3}
                autoFocus
                placeholder="Edit pesan..."
                disabled={isEditing}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button 
                  onClick={handleCancelEdit} 
                  className="p-2 rounded-full hover:scale-110 transition"
                  disabled={isEditing}
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="p-2 rounded-full hover:scale-110 transition"
                  disabled={isEditing}
                >
                  {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex items-center text-xs text-gray-400">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Mengirim pesan...
                </div>
              ) : (
                <p className={`leading-relaxed ${deleted ? 'italic opacity-70' : ''}`}>
                  {deleted ? 'Pesan telah dihapus' : content}
                </p>
              )}

              {error && (
                <div className="flex items-center text-xs text-red-500 mt-1">
                  <AlertTriangle size={14} className="mr-1" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex items-center">
                  <Clock size={12} className={`mr-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'}`} />
                  <span className={isOwnMessage ? 'text-blue-200' : 'text-gray-500'}>
                    {edited ? `Diedit • ${editedTime}` : createdTime}
                  </span>
                </div>
              </div>
            </>
          )}
        </ChatBubble>

        {/* Action buttons */}
        {isOwnMessage && !deleted && !isLocalEditing && (
          <div className="flex items-center space-x-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handleStartEdit} 
              className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 
                       bg-white hover:bg-blue-50 px-3 py-1 rounded-full shadow-sm border border-blue-200
                       transition-all duration-200 hover:shadow-md"
              disabled={isEditing || isDeleting}
            >
              <Edit size={12} />
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDelete} 
              className="flex items-center space-x-1 text-xs text-red-500 hover:text-red-600 
                       bg-white hover:bg-red-50 px-3 py-1 rounded-full shadow-sm border border-red-200
                       transition-all duration-200 hover:shadow-md"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash size={12} />}
              <span>Hapus</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
