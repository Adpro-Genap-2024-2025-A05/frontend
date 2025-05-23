import React from 'react';
import { User, Clock } from 'lucide-react';

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
      className="bg-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 
                 border border-blue-100 hover:border-blue-200 transform hover:-translate-y-1
                 backdrop-blur-sm hover:bg-blue-50/30"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="mr-4 relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full 
                          flex items-center justify-center shadow-md">
              <User size={28} className="text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full 
                          border-2 border-white shadow-sm">
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-lg truncate">
                {session.user2.name}
              </h3>
              <div className="flex items-center text-blue-500 ml-3">
                <Clock size={14} className="mr-1" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {displayTime}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm truncate flex-1 mr-3">
                {previewText}
              </p>
              <span className={`
                px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm
                ${session.user2.role === 'caregiver' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}>
                {session.user2.role === 'caregiver' ? 'Caregiver' : 'Pacilian'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom border for depth */}
      <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-b-xl opacity-20"></div>
    </div>
  );
}