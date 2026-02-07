import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatWindow({ selectedUser, messages, loading, onUpdateMessageStatus }) {
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !socket || !selectedUser) return;
    setSending(true);
    socket.emit(
      'send_message',
      { receiverId: selectedUser._id, content: trimmed },
      (res) => {
        setSending(false);
        if (res?.success) setInput('');
      }
    );
    if (!socket.connected) setSending(false);
  };

  useEffect(() => {
    if (!selectedUser || !socket) return;
    const myId = user?._id;
    const senderId = selectedUser._id;
    const toMark = messages
      .filter(
        (m) =>
          (m.senderId?._id === senderId || m.senderId === senderId) &&
          (m.receiverId?._id === myId || m.receiverId === myId) &&
          m.status !== 'seen'
      )
      .map((m) => m._id);
    if (toMark.length > 0) {
      socket.emit('mark_seen', { messageIds: toMark, senderId });
    }
  }, [messages, selectedUser?._id, user?._id, socket]);

  if (!selectedUser) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] text-gray-500">
        <p>Select a chat or start a new conversation</p>
      </main>
    );
  }

  const online = isOnline(selectedUser._id);

  return (
    <main className="flex-1 flex flex-col bg-[#0b141a] min-w-0">
      <header className="h-14 px-4 flex items-center gap-3 border-b border-gray-700 bg-[#202c33] shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-semibold text-white">
          {(selectedUser.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-100 truncate">{selectedUser.name}</p>
          <p className="text-xs text-gray-500">
            {online ? (
              <span className="text-green-400">online</span>
            ) : (
              'offline'
            )}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a] bg-chat-pattern"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%231a2332\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a884]" />
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = (msg.senderId?._id || msg.senderId) === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    isMe
                      ? 'bg-[#005c4b] text-white rounded-br-none'
                      : 'bg-[#202c33] text-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-green-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {isMe && (
                      <span className="ml-1">
                        {msg.status === 'seen'
                          ? ' ✓✓'
                          : msg.status === 'delivered'
                          ? ' ✓✓'
                          : ' ✓'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 border-t border-gray-700 bg-[#202c33] shrink-0"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            maxLength={5000}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#2a3942] text-white placeholder-gray-500 border border-gray-600 focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-5 py-2.5 rounded-lg bg-[#00a884] text-white font-medium hover:bg-[#06cf9c] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
