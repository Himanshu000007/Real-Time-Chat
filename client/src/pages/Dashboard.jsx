import { useState, useEffect, useRef } from 'react';
import { getChats, getMessages, getUsers } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const messagesFetched = useRef(false);

  const fetchChats = () => {
    setLoadingChats(true);
    setError('');
    getChats()
      .then((res) => setChats(res.data.chats || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load chats'))
      .finally(() => setLoadingChats(false));
  };

  const fetchUsers = () => {
    setLoadingUsers(true);
    getUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (showUserList && users.length === 0) fetchUsers();
  }, [showUserList]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      messagesFetched.current = false;
      return;
    }
    setLoadingMessages(true);
    getMessages(selectedUser._id)
      .then((res) => {
        setMessages(res.data.messages || []);
        messagesFetched.current = true;
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const onNewMessage = (msg) => {
      const isForThisChat =
        (msg.senderId?._id === selectedUser._id || msg.senderId === selectedUser._id) ||
        (msg.receiverId?._id === selectedUser._id || msg.receiverId === selectedUser._id);
      if (isForThisChat) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
      }
      fetchChats();
    };

    const onMessageSent = (msg) => {
      const isForThisChat =
        (msg.receiverId?._id === selectedUser._id || msg.receiverId === selectedUser._id);
      if (isForThisChat) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
      }
      fetchChats();
    };

    const onMessagesSeen = (payload) => {
      setMessages((prev) =>
        prev.map((m) =>
          payload.messageIds?.includes(m._id) ? { ...m, status: 'seen' } : m
        )
      );
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_sent', onMessageSent);
    socket.on('messages_seen', onMessagesSeen);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_sent', onMessageSent);
      socket.off('messages_seen', onMessagesSeen);
    };
  }, [socket, selectedUser]);

  const updateMessageStatus = (messageId, status) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? { ...m, status } : m))
    );
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setShowUserList(false);
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden">
      <ChatList
        chats={chats}
        users={users}
        showUserList={showUserList}
        setShowUserList={setShowUserList}
        loadingUsers={loadingUsers}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        loading={loadingChats}
        error={error}
        currentUserId={user?._id}
      />
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        loading={loadingMessages}
        onUpdateMessageStatus={updateMessageStatus}
      />
    </div>
  );
}
