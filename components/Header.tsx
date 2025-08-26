
import React, { useState, useRef, useEffect } from 'react';
import type { UserRole } from '../App';
import type { Notification } from '../types';

interface HeaderProps {
  onNewPostClick: () => void;
  onHomeClick: () => void;
  onMeetingsClick: () => void;
  onActivitiesClick: () => void;
  onMediaKitClick: () => void;
  userRole: UserRole;
  userName?: string;
  onLogout: () => void;
  isLive: boolean;
  liveTitle?: string;
  onGoLive: () => void;
  onJoinLive: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}

const timeSince = (dateString: string): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 5) return "just now";

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return Math.floor(seconds) + " seconds ago";
};

const Header: React.FC<HeaderProps> = ({ 
  onNewPostClick, onHomeClick, onMeetingsClick, onActivitiesClick, onMediaKitClick, 
  userRole, userName, onLogout, isLive, liveTitle, onGoLive, onJoinLive,
  notifications, onNotificationClick, onMarkAllAsRead 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-bjp-orange via-bjp-white to-bjp-green shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={onHomeClick}>
              <div className="relative">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/BJP_logo_with_circle.svg" alt="BJP Logo" className="h-12 w-12 object-contain"/>
              </div>
            <div>
                <h1 className="text-xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                BJP Himachal Pradesh
                </h1>
                <p className="text-sm md:text-md text-gray-600 font-semibold">News Portal</p>
            </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
                <button
                    onClick={onMeetingsClick}
                    className="text-md font-semibold text-gray-700 hover:text-bjp-orange transition-colors relative"
                    aria-label="View Meetings"
                >
                    Meetings
                </button>
                 <button
                    onClick={onActivitiesClick}
                    className="text-md font-semibold text-gray-700 hover:text-bjp-orange transition-colors relative"
                    aria-label="View Activities"
                >
                    Activities
                </button>
                 <button
                    onClick={onMediaKitClick}
                    className="text-md font-semibold text-gray-700 hover:text-bjp-orange transition-colors relative"
                    aria-label="View Media Kit"
                >
                    Media Kit
                </button>
            </nav>
        </div>
        <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(s => !s)}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label={`View notifications. ${unreadCount} unread.`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                      </span>
                  )}
              </button>
              {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-gray-800">Notifications</h4>
                          {unreadCount > 0 && <button onClick={onMarkAllAsRead} className="text-sm text-bjp-orange hover:underline">Mark all as read</button>}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? notifications.map(n => (
                              <div key={n.id} onClick={() => { onNotificationClick(n); setShowNotifications(false); }} className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-orange-50' : ''}`}>
                                  <p className="text-sm text-gray-700">{n.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">{timeSince(n.timestamp)}</p>
                              </div>
                          )) : (
                              <p className="text-center text-gray-500 py-8">No notifications yet.</p>
                          )}
                      </div>
                  </div>
              )}
            </div>
            {userRole === 'admin' ? (
              <>
                 <button
                  onClick={onGoLive}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2"
                  aria-label="Go Live"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 5.106A1 1 0 0116 6v8a1 1 0 01-1.447.894l-3-2A1 1 0 0111 12V8a1 1 0 01.553-.894l3-2z" />
                  </svg>
                  <span className="hidden md:inline">Go Live</span>
                </button>
                <button
                  onClick={onNewPostClick}
                  className="bg-bjp-orange text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">New Post</span>
                </button>
                 <button
                    onClick={onLogout}
                    className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2"
                    aria-label="Sign out"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l7.293 7.293a1 1 0 001.414-1.414L5.414 4H15a1 1 0 100-2H4a1 1 0 00-1 1z" clipRule="evenodd" />
                   </svg>
                   <span className="hidden md:inline">Sign Out</span>
                 </button>
              </>
            ) : (
                <>
                  <span className="font-semibold text-gray-700 hidden sm:inline truncate max-w-xs" title={userName}>
                    Welcome, {userName}
                  </span>
                  {isLive && (
                    <button
                        onClick={onJoinLive}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2 animate-pulse"
                        aria-label="Join Live Stream"
                      >
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <span className="hidden md:inline">LIVE NOW</span>
                      </button>
                  )}
                   <button
                    onClick={onLogout}
                    className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2"
                    aria-label="Sign out"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l7.293 7.293a1 1 0 001.414-1.414L5.414 4H15a1 1 0 100-2H4a1 1 0 00-1 1z" clipRule="evenodd" />
                   </svg>
                   <span className="hidden md:inline">Sign Out</span>
                 </button>
                </>
            )}
        </div>
      </div>
       {isLive && (
        <button onClick={onJoinLive} className="w-full bg-red-700 text-white py-2 text-center font-semibold text-sm truncate px-4">
          LIVE NOW: {liveTitle}
        </button>
      )}
    </header>
  );
};

export default Header;
