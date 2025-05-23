import React from 'react';
import { useState } from 'react';

interface ChatBubbleProps {
  children: React.ReactNode;
  isOwnMessage: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ children, isOwnMessage }) => {
  return (
    <div
      className={`
        max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl relative
        ${isOwnMessage
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' +
            ' rounded-2xl rounded-br-md transform hover:scale-[1.02] transition-all duration-200'
          : 'bg-white text-gray-800 shadow-md shadow-gray-200/50 border border-blue-100' +
            ' rounded-2xl rounded-bl-md hover:shadow-lg transition-all duration-200'
        } p-4 backdrop-blur-sm
      `}
    >
      {children}
      
      {/* Message tail */}
      <div className={`
        absolute w-3 h-3 transform rotate-45
        ${isOwnMessage 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 -bottom-1 -right-1' 
          : 'bg-white border-r border-b border-blue-100 -bottom-1 -left-1'
        }
      `}></div>
    </div>
  );
};