import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers(new Set());
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const url = (SOCKET_URL && SOCKET_URL.trim()) ? SOCKET_URL.trim() : window.location.origin;
    const newSocket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {});

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('online_list', ({ userIds }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        (userIds || []).forEach((id) => next.add(id));
        return next;
      });
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  const isOnline = (userId) => onlineUsers.has(userId?.toString?.() || userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
