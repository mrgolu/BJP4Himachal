import React from 'react';

interface HeaderProps {
  onNewPostClick: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewPostClick, onHomeClick }) => {
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
        <div className="flex items-center space-x-2">
            <button
              onClick={onNewPostClick}
              className="bg-bjp-orange text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-bjp-orange focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">New Post</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;