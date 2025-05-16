import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputBoxProps {
  onSendMessage: (content: string) => void;
}

export default function ChatInputBox({ onSendMessage }: ChatInputBoxProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    try {
      setSending(true);
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white p-4 border-t">
      <div className="flex items-center max-w-4xl mx-auto">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
          className="flex-1 p-3 border rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '100px' }}
        />
        <button
          onClick={handleSend}
          className={`ml-2 p-3 rounded-full ${
            message.trim() && !sending
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}