import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import soundManager from '../utils/soundManager';

const RoomChat = ({ socket, roomCode, user, chatList }) => {
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatList]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    
    soundManager.playClick();
    socket.emit('send_message', {
      roomCode,
      message: text.trim(),
      username: user?.username || 'Guest'
    });
    setText('');
  };

  return (
    <div className="glass-panel rounded-2xl border-slate-800 flex flex-col h-[350px] overflow-hidden text-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-850 flex items-center gap-2 text-cyan-400">
        <MessageSquare size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Room Operations Chat</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatList.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500 font-bold">
            Chat logs initialized. Play nice!
          </div>
        ) : (
          chatList.map((chat, idx) => {
            const isSystem = chat.sender === 'System';
            const isMe = chat.sender === user?.username;

            return (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${
                  isSystem ? 'mx-auto text-center text-indigo-400/80 font-semibold' :
                  isMe ? 'ml-auto text-right' : 'mr-auto text-left'
                }`}
              >
                {!isSystem && (
                  <span className="text-[9px] text-gray-500 font-bold px-1 mb-0.5">
                    {chat.sender}
                  </span>
                )}
                <div 
                  className={`p-2.5 rounded-2xl text-xs leading-normal ${
                    isSystem ? 'bg-slate-900/30 border border-indigo-950/40 rounded-lg py-1 px-4' :
                    isMe ? 'bg-cyan-600 text-white rounded-tr-none' : 
                    'bg-slate-900 border border-slate-800 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-850 flex gap-2 bg-slate-950/40">
        <input
          type="text"
          placeholder="Transmit message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950/90 border border-slate-850 focus:border-cyan-500/30 text-gray-200 outline-none transition-all placeholder-gray-600"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shrink-0 hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
};

export default RoomChat;
