import React from 'react';

interface ChatLayoutProps {
  header: React.ReactNode;
  messageList: React.ReactNode;
  inputBox: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  header,
  messageList,
  inputBox,
}) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 bg-white shadow-sm">
        {header}
      </div>
      
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messageList}
      </div>
      
      {/* Input Box */}
      <div className="border-t p-4 bg-white">
        {inputBox}
      </div>
    </div>
  );
};