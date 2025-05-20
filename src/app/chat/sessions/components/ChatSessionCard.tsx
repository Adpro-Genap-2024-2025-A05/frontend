import React from 'react';
import { User } from 'lucide-react';

interface ChatSessionCardProps {
  session: {
    id: string;
    user2: {
      id: string;
      name: string;
      role: 'pacilian' | 'caregiver';
    };
    updatedAt: string;
    lastMessage?: {
      content: string;
      createdAt: string;
    };
  };
  onClick: () => void;
}

export default function ChatSessionCard({ session, onClick }: ChatSessionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Kemarin';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const displayTime = session.lastMessage
    ? formatDate(session.lastMessage.createdAt)
    : formatDate(session.updatedAt);

  const previewText = session.lastMessage
    ? session.lastMessage.content.length > 50
      ? `${session.lastMessage.content.substring(0, 50)}...`
      : session.lastMessage.content
    : 'Belum ada pesan';

  return (
    <div
      className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center">
        {/* Ikon user tetap, tidak dinamis */}
        <div className="mr-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={24} className="text-gray-500" />
          </div>
        </div>

        {/* Konten teks */}
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{session.user2.name}</h3>
            <span className="text-xs text-gray-500">{displayTime}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-600 truncate">{previewText}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {session.user2.role === 'caregiver' ? 'Caregiver' : 'Pacilian'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
