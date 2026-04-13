import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function NotificationToast() {
  const { notifications } = useSocket();
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (notifications.length === 0) return;

    const latest = notifications[0];
    const id = Date.now();

    setVisible(prev => [...prev, { ...latest, id }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setVisible(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, [notifications.length]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {visible.slice(0, 3).map(notif => (
        <div
          key={notif.id}
          className="glass-card p-4 animate-slide-down flex items-start gap-3 border-l-4 border-neon-cyan/60"
        >
          <div className="flex-1">
            <p className="text-sm text-white font-medium">{notif.message}</p>
            <p className="text-xs text-dark-400 mt-1">
              {new Date(notif.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => setVisible(prev => prev.filter(n => n.id !== notif.id))}
            className="text-dark-500 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
