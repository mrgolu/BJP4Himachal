
import React from 'react';

type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting';

interface BottomNavProps {
  currentView: View;
  onHomeClick: () => void;
  onMeetingsClick: () => void;
  onActivitiesClick: () => void;
  onLiveClick: () => void;
  isLive: boolean;
  hasNewPosts: boolean;
  hasNewMeetings: boolean;
  hasNewActivities: boolean;
}

const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-bjp-orange' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
);

const LiveIcon = ({ isActive, isLive }: { isActive: boolean; isLive: boolean; }) => (
    <div className="relative">
        <svg className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-bjp-orange' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        {isLive && (
             <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        )}
    </div>
);

const MeetingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-bjp-orange' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);

const ActivitiesIcon = ({ isActive }: { isActive: boolean }) => (
 <svg className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-bjp-orange' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2z"></path></svg>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onHomeClick, onMeetingsClick, onActivitiesClick, onLiveClick, isLive, hasNewPosts, hasNewMeetings, hasNewActivities }) => {
  const isViewActive = (view: View) => currentView === view;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-50">
      <div className="flex justify-around h-16">
        <button onClick={onHomeClick} className="flex flex-col items-center justify-center w-full text-xs font-medium focus:outline-none" aria-label="Home">
          <div className="relative">
            <HomeIcon isActive={isViewActive('feed')} />
            {hasNewPosts && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
          </div>
          <span className={`transition-colors ${isViewActive('feed') ? 'text-bjp-orange' : 'text-gray-600'}`}>Home</span>
        </button>
        <button onClick={onLiveClick} className="flex flex-col items-center justify-center w-full text-xs font-medium focus:outline-none" aria-label="Live Stream" disabled={!isLive}>
          <LiveIcon isActive={isViewActive('live-user')} isLive={isLive} />
          <span className={`transition-colors ${isViewActive('live-user') ? 'text-bjp-orange' : 'text-gray-600'} ${!isLive ? 'text-gray-400' : ''}`}>Live</span>
        </button>
        <button onClick={onMeetingsClick} className="flex flex-col items-center justify-center w-full text-xs font-medium focus:outline-none" aria-label="Meetings">
          <div className="relative">
            <MeetingsIcon isActive={isViewActive('meetings')} />
            {hasNewMeetings && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
          </div>
          <span className={`transition-colors ${isViewActive('meetings') ? 'text-bjp-orange' : 'text-gray-600'}`}>Meetings</span>
        </button>
        <button onClick={onActivitiesClick} className="flex flex-col items-center justify-center w-full text-xs font-medium focus:outline-none" aria-label="Activities">
          <div className="relative">
            <ActivitiesIcon isActive={isViewActive('activities')} />
            {hasNewActivities && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
          </div>
          <span className={`transition-colors ${isViewActive('activities') ? 'text-bjp-orange' : 'text-gray-600'}`}>Activity</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
