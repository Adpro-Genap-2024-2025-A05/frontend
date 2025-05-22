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
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Belum ada pesan. Mulai percakapan!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
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
      ))}
    </div>
  );
}