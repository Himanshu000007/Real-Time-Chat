import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function ChatList({
  chats,
  users,
  showUserList,
  setShowUserList,
  loadingUsers,
  selectedUser,
  onSelectUser,
  loading,
  error,
  currentUserId,
}) {
  const { isOnline } = useSocket();

  if (loading) {
    return (
      <aside className="w-full md:w-96 flex flex-col border-r border-gray-700 bg-[#111b21]">
        <header className="h-14 px-4 flex items-center justify-between border-b border-gray-700 bg-[#202c33]">
          <span className="font-medium text-gray-200">Chats</span>
          <Link
            to="/profile"
            className="text-gray-400 hover:text-white text-sm"
          >
            Profile
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a884]" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-96 flex flex-col border-r border-gray-700 bg-[#111b21]">
      <header className="h-14 px-4 flex items-center justify-between border-b border-gray-700 bg-[#202c33] shrink-0">
        <span className="font-medium text-gray-200">Chats</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUserList(!showUserList)}
            className="text-sm px-2 py-1 rounded text-[#00a884] hover:bg-[#2a3942]"
          >
            {showUserList ? 'Chats' : 'New chat'}
          </button>
          <Link to="/profile" className="text-gray-400 hover:text-white text-sm">
            Profile
          </Link>
        </div>
      </header>
      {error && (
        <div className="p-3 bg-red-500/20 text-red-300 text-sm">{error}</div>
      )}
      <div className="flex-1 overflow-y-auto">
        {showUserList ? (
          <>
            <div className="p-2 text-gray-500 text-sm">Select a user to start chatting</div>
            {loadingUsers ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00a884]" />
              </div>
            ) : (
              users.map((u) => {
                const id = u._id;
                const online = isOnline(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectUser(u)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left border-b border-gray-800 hover:bg-[#2a3942]"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-lg font-semibold text-white">
                        {(u?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111b21]" />
                      )}
                    </div>
                    <p className="font-medium text-gray-100 truncate">{u?.name || 'Unknown'}</p>
                  </button>
                );
              })
            )}
          </>
        ) : chats.length === 0 && !error ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No chats yet. Click &quot;New chat&quot; to start a conversation.
          </div>
        ) : (
          chats.map((chat) => {
            const u = chat.user;
            const id = u?._id;
            const isSelected = selectedUser?._id === id;
            const online = isOnline(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectUser(u)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left border-b border-gray-800 hover:bg-[#2a3942] ${
                  isSelected ? 'bg-[#2a3942]' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-lg font-semibold text-white">
                    {(u?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  {online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111b21]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-100 truncate">{u?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage
                      ? chat.lastMessage.content
                      : 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
