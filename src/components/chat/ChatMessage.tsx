import React, { useState } from 'react';
import { Edit, Trash, Check, X } from 'lucide-react';
import { ChatBubble } from './ChatBubble';

interface ChatMessageProps {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  editedAt?: string;
  isDeleted?: boolean;
  isEdited?: boolean;
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
  isDeleted = false,
  isEdited = false,
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
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-xs md:max-w-md">
        <ChatBubble isOwnMessage={isOwnMessage}>
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
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
                  onClick={handleSaveEdit} 
                  className="p-1 rounded-full hover:bg-blue-200 text-blue-600"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={isDeleted ? 'italic text-gray-400' : ''}>
                {isDeleted ? 'Pesan telah dihapus' : content}
              </p>
              
              <div className="flex justify-between items-center mt-1 text-xs">
                <span className={isOwnMessage ? 'text-blue-100' : 'text-gray-500'}>
                  {isEdited ? `(edited • ${editedTime})` : createdTime}
                </span>
              </div>
            </>
          )}
        </ChatBubble>

        {/* Action menu for own messages that are not deleted */}
        {isOwnMessage && !isDeleted && !isEditing && (
          <div className="flex justify-end mt-1 space-x-2">
            <button 
              onClick={handleStartEdit} 
              className="text-xs text-gray-500 hover:text-blue-500"
            >
              Edit
            </button>
            <button 
              onClick={handleDelete} 
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};