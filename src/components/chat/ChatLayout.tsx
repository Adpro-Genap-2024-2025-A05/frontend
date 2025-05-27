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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="px-6 py-4">
          {header}
        </div>
      </div>
      
      {/* Message List */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-25 to-white px-4 py-6"
           style={{ 
             backgroundImage: `
               radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 40% 40%, rgba(219, 234, 254, 0.1) 0%, transparent 50%)
             `
           }}>
        {messageList}
      </div>
      
      {/* Input Box */}
      <div className="bg-white/90 backdrop-blur-md border-t border-blue-100 shadow-lg">
        <div className="px-6 py-4">
          {inputBox}
        </div>
      </div>
    </div>
  );
};