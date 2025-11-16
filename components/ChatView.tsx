import React, { useRef, useEffect } from 'react';
import { type Message } from '../types';
import { UserIcon, BotIcon, SendIcon } from './Icons';
import { marked } from 'marked';

interface ChatViewProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: (message: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, input, setInput, isLoading, onSend }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const parseMarkdown = (text: string) => {
    return { __html: marked.parse(text) as string };
  };

  const handleSend = () => {
    onSend(input);
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-lg overflow-hidden border border-[var(--primary-glow)]/20 shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-cyan-500/50 flex items-center justify-center flex-shrink-0 text-cyan-300 border border-cyan-400">
                <BotIcon className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-xl shadow-lg ${
              msg.role === 'user' 
                ? 'bg-cyan-800/50 text-white rounded-br-none border border-cyan-500/70' 
                : 'bg-gray-800/50 text-gray-200 rounded-bl-none border border-gray-600/50 font-mono'
            }`}>
              <div className="prose prose-sm prose-invert max-w-none prose-p:text-gray-200 prose-headings:text-cyan-300 prose-strong:text-cyan-200 prose-ul:text-gray-300" dangerouslySetInnerHTML={parseMarkdown(msg.text)} />
            </div>
             {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-500">
                <UserIcon className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-500/50 flex items-center justify-center flex-shrink-0 text-cyan-300 border border-cyan-400">
                    <BotIcon className="w-5 h-5" />
                </div>
                <div className="max-w-xl p-4 rounded-xl shadow-lg bg-gray-800/50 text-gray-200 rounded-bl-none border border-gray-600/50">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-black/50 border-t border-[var(--primary-glow)]/20">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="SYSTEM READY. AWAITING COMMAND..."
            rows={1}
            className="w-full pl-4 pr-12 py-3 bg-gray-900/80 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)] border border-transparent focus:border-[var(--primary-glow)]/50 font-mono text-cyan-300 placeholder:text-cyan-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 hover:shadow-[0_0_10px_var(--primary-glow)] transition-all"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
