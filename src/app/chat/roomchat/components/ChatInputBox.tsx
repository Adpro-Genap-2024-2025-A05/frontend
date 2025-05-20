// src/app/chat/roomchat/components/ChatInputBox.tsx
import React from 'react';
import { Send } from 'lucide-react';

export interface ChatInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInputBox({
  value,
  onChange,
  onSend,
  placeholder = "Ketik pesan...",
  disabled = false
}: ChatInputBoxProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={disabled}
      />
      <button
        className={`ml-2 p-2 rounded-full ${
          disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        onClick={onSend}
        disabled={disabled}
      >
        <Send size={20} />
      </button>
    </div>
  );
}
