import React from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;      
  editedAt?: string;
  edited?: boolean;
  deleted?: boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
}

export default function ChatMessageList({ messages, currentUserId, onEdit, onDelete }: ChatMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-200"></div>
          </div>
          <p className="text-blue-400 font-medium">Belum ada pesan</p>
          <p className="text-blue-300 text-sm">Mulai percakapan!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator = prevMessage && 
          new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-6">
                <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {new Date(message.createdAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
            <ChatMessage
              key={message.id}
              id={message.id}
              content={message.content}
              senderId={message.senderId}
              createdAt={message.createdAt}
              editedAt={message.editedAt}
              deleted={message.deleted}
              edited={message.edited}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        );
      })}
    </div>
  );
}