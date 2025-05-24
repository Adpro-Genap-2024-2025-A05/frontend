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
    <div className="flex items-center space-x-3">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full border-2 border-blue-200 rounded-full px-6 py-3 pr-12 
                   focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                   transition-all duration-200 text-gray-700 placeholder-blue-300
                   shadow-sm hover:border-blue-300"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
        />
        {value.trim() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      <button
        className={`p-3 rounded-full transition-all duration-200 shadow-md transform hover:scale-105 ${
          disabled 
            ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
            : value.trim()
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
              : 'bg-blue-100 text-blue-400 hover:bg-blue-200'
        }`}
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        <Send size={20} />
      </button>
    </div>
  );
}