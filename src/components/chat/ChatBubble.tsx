import React from 'react';
import { useState } from 'react';

interface ChatBubbleProps {
  children: React.ReactNode;
  isOwnMessage: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ children, isOwnMessage }) => {
  return (
    <div
      className={`${
        isOwnMessage
          ? 'bg-blue-500 text-white rounded-t-lg rounded-bl-lg'
          : 'bg-white text-gray-700 rounded-t-lg rounded-br-lg shadow'
      } p-3`}
    >
      {children}
    </div>
  );
};