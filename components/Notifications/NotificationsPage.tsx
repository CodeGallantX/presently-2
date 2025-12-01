import React from 'react';
import { Bell, Clock, Info, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '../Button';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  time: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Class Reminder: CS402',
      message: 'Advanced Web Development starts in 15 minutes at LH 1.',
      type: 'reminder',
      time: '10 mins ago',
      read: false
    },
    {
      id: '2',
      title: 'Attendance Marked',
      message: 'You have successfully marked attendance for Database Systems.',
      type: 'success',
      time: '2 hours ago',
      read: false
    },
    {
      id: '3',
      title: 'Low Attendance Alert',
      message: 'Your attendance in ENG101 is below 75%. Please attend upcoming classes.',
      type: 'warning',
      time: '1 day ago',
      read: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'Presently will undergo scheduled maintenance on Sunday at 2 AM.',
      type: 'info',
      time: '2 days ago',
      read: true
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'reminder': return <Calendar className="text-primary" size={20} />;
      case 'info': default: return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-zinc-400">Stay updated with your classes and account activity.</p>
        </div>
        <Button variant="secondary" onClick={markAllAsRead}>Mark all as read</Button>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-xl border transition-all ${
                notification.read 
                  ? 'bg-zinc-900/50 border-zinc-800' 
                  : 'bg-zinc-900 border-zinc-700 shadow-md shadow-black/20'
              }`}
            >
              <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-full h-fit ${notification.read ? 'bg-zinc-800' : 'bg-zinc-800 ring-1 ring-zinc-700'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${notification.read ? 'text-zinc-300' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Bell size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white">No notifications</h3>
            <p className="text-zinc-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};