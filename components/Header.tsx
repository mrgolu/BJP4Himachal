
import React from 'react';
import type { UserRole } from '../App';

interface HeaderProps {
  onNewPostClick: () => void;
  onHomeClick: () => void;
  onMeetingsClick: () => void;
  onActivitiesClick: () => void;
  onMediaKitClick: () => void;
  userRole: UserRole;
  onLogout: () => void;
  isLive: boolean;
  liveTitle?: string;
  onGoLive: () => void;
  onJoinLive: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewPostClick, onHomeClick, onMeetingsClick, onActivitiesClick, onMediaKitClick, userRole, onLogout, isLive, liveTitle, onGoLive, onJoinLive }) => {
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
            ) : isLive && (
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
