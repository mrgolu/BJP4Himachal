import React from 'react';
import type { UserRole } from '../App';

interface HeaderProps {
  onNewPostClick: () => void;
  onHomeClick: () => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewPostClick, onHomeClick, userRole, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-bjp-orange via-bjp-white to-bjp-green shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onHomeClick}>
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1200px-Bharatiya_Janata_Party_logo.svg.png" alt="BJP Logo" className="h-12 w-12 object-contain"/>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
              BJP Himachal Pradesh
            </h1>
            <p className="text-sm md:text-md text-gray-600 font-semibold">News Portal</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            {userRole === 'admin' && (
              <>
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
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;