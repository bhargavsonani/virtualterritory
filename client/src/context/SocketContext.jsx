import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('vt_token');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    newSocket.on('users:online', (count) => {
      setOnlineCount(count);
    });

    newSocket.on('notification', (data) => {
      setNotifications(prev => [data, ...prev].slice(0, 50));
    });

    newSocket.on('territory:invaded', (data) => {
      setNotifications(prev => [{
        type: 'invasion',
        message: `⚔️ ${data.attackerName} is invading your territory!`,
        timestamp: new Date()
      }, ...prev].slice(0, 50));
    });

    newSocket.on('battle:result', (data) => {
      setNotifications(prev => [{
        type: 'battle',
        message: data.success
          ? `🏆 ${data.attackerName} captured territory!`
          : `🛡️ Territory defense held!`,
        timestamp: new Date()
      }, ...prev].slice(0, 50));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, onlineCount, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
}
