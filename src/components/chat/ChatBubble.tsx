import React from 'react';

interface ChatBubbleProps {
  children: React.ReactNode;
  isOwnMessage: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ children, isOwnMessage }) => {
  return (
    <div
      className={`p-3 rounded-lg ${
        isOwnMessage
          ? 'bg-blue-500 text-white rounded-br-none'
          : 'bg-gray-200 text-gray-800 rounded-bl-none'
      }`}
    >
      {children}
    </div>
  );
};