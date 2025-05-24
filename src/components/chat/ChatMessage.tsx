import React, { useState } from 'react';
import { Edit, Trash, Check, X, Clock } from 'lucide-react';
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
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  
  const isOwnMessage = senderId === currentUserId;

  // Format time to display in HH:MM format
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createdTime = formatTime(createdAt);
  const editedTime = formatTime(editedAt || '');

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(id, editContent);
      setIsEditing(false);
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
          {isEditing ? (
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
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button 
                  onClick={handleCancelEdit} 
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110
                    ${isOwnMessage 
                      ? 'hover:bg-blue-400/30 text-blue-100 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110
                    ${isOwnMessage 
                      ? 'hover:bg-blue-400/30 text-blue-100 hover:text-white' 
                      : 'hover:bg-blue-100 text-blue-500 hover:text-blue-600'
                    }`}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={`leading-relaxed ${deleted ? 'italic opacity-70' : ''}`}>
                {deleted ? 'Pesan telah dihapus' : content}
              </p>
              
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

        {/* Action menu for own messages that are not deleted */}
        {isOwnMessage && !deleted && !isEditing && (
          <div className="flex items-center space-x-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handleStartEdit} 
              className="flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 
                       bg-white hover:bg-blue-50 px-3 py-1 rounded-full shadow-sm border border-blue-200
                       transition-all duration-200 hover:shadow-md"
            >
              <Edit size={12} />
              <span>Edit</span>
            </button>
            <button 
              onClick={handleDelete} 
              className="flex items-center space-x-1 text-xs text-red-500 hover:text-red-600 
                       bg-white hover:bg-red-50 px-3 py-1 rounded-full shadow-sm border border-red-200
                       transition-all duration-200 hover:shadow-md"
            >
              <Trash size={12} />
              <span>Hapus</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};