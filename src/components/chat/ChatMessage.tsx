import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubble } from './ChatBubble';

export interface ChatMessageProps {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isDeleted: boolean;
  isEdited: boolean;
  currentUserId: string;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  senderId,
  timestamp,
  isDeleted,
  isEdited,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(content);
  const isOwnMessage = senderId === currentUserId;
  
  const formattedTime = React.useMemo(() => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  }, [timestamp]);

  const handleEdit = () => {
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
      <div className="max-w-[70%]">
        <ChatBubble isOwnMessage={isOwnMessage}>
          {isDeleted ? (
            <span className="italic text-gray-500">This message was deleted</span>
          ) : isEditing ? (
            <div className="flex flex-col">
              <textarea
                className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{content}</p>
              {isEdited && <span className="text-xs text-gray-500 ml-1">(edited)</span>}
            </>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {formattedTime}
          </div>
        </ChatBubble>
        
        {isOwnMessage && !isDeleted && !isEditing && (
          <div className="flex justify-end mt-1 space-x-2">
            <button 
              onClick={() => setIsEditing(true)} 
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