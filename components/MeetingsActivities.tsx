import React, { useState, useRef } from 'react';
import type { Meeting } from '../types';
import { MeetingType } from '../types';
import type { UserRole } from '../App';

interface MeetingsActivitiesProps {
  meetings: Meeting[];
  eventType: MeetingType;
  userRole: UserRole;
  onAddNew: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => void;
}

const EventCard: React.FC<{
    event: Meeting;
    userRole: UserRole;
    onEdit: (event: Meeting) => void;
    onDelete: (eventId: string) => void;
}> = ({ event, userRole, onEdit, onDelete }) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const [confirmDelete, setConfirmDelete] = useState(false);
    const confirmTimeoutRef = useRef<number | null>(null);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(event);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirmDelete) {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            onDelete(event.id);
        } else {
            setConfirmDelete(true);
            confirmTimeoutRef.current = window.setTimeout(() => {
                setConfirmDelete(false);
            }, 3000);
        }
    };

    const handleMouseLeave = () => {
        if (confirmDelete) {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            setConfirmDelete(false);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const shareText = `*${event.type}: ${event.title}*\n\n` +
                          `🗓️ *Date:* ${formattedDate}\n` +
                          `🕗 *Time:* ${formattedTime}\n` +
                          `📍 *Location:* ${event.location}\n\n` +
                          `*Details:*\n${event.description}\n\n` +
                          (event.link ? `🔗 *Join/View Link:*\n${event.link}` : '');
        
        const shareData = {
            title: `BJP HP ${event.type}: ${event.title}`,
            text: shareText,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    console.log('Share dialog closed by user.');
                } else {
                    console.error('Error sharing event:', error);
                }
            }
        } else {
            // Fallback for devices/browsers that do not support the Web Share API.
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Event details copied to clipboard. You can now paste it to share.');
            } catch (err) {
                console.error('Failed to copy event details to clipboard:', err);
                alert('Sharing is not supported on this device.');
            }
        }
    };

    const handleJoinClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (event.link) {
            // Forcing a top-level navigation is more reliable for triggering
            // native app deep links (like Webex) from a PWA on mobile.
            window.location.assign(event.link);
        }
    };

    return (
        <div 
            className="bg-white p-6 rounded-lg shadow-md border-l-4 border-bjp-orange relative"
            onMouseLeave={handleMouseLeave}
        >
            {userRole === 'admin' && (
                <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={handleEdit} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors" aria-label="Edit event">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className={`p-2 rounded-full transition-all duration-300 ${confirmDelete ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-red-200'}`} 
                        aria-label={confirmDelete ? 'Confirm Delete' : 'Delete event'}
                    >
                        {confirmDelete ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.707-4.707a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
            )}
            <span className={`inline-block rounded-full text-xs font-semibold px-3 py-1 mb-2 ${event.type === MeetingType.MEETING ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{event.type}</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
            <div className="text-gray-600 text-sm space-y-2 mb-4">
                <p className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> {formattedDate} at {formattedTime}</p>
                <p className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> {event.location}</p>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            
            {event.invited && event.invited.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015.537-4.873A6.97 6.97 0 008 16c0 .34.024.673.07 1H1V6a1 1 0 011-1h4a1 1 0 011 1v5z" />
                        </svg>
                        Invited
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                        {event.invited.map((invitee, index) => (
                            <li key={index}>{invitee}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {(event.link || true) && (
                 <div className="mt-6 pt-4 border-t border-gray-200 flex items-center space-x-4">
                    {event.link && (
                        <a
                            href={event.link}
                            onClick={handleJoinClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-green"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                            {event.type === MeetingType.MEETING ? 'Join Online Meeting' : 'View Activity Link'}
                        </a>
                    )}
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange"
                        aria-label="Share this event"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share
                    </button>
                </div>
            )}
        </div>
    );
};


const MeetingsActivities: React.FC<MeetingsActivitiesProps> = ({ meetings, eventType, userRole, onAddNew, onEdit, onDelete }) => {
  const now = new Date();
  const displayedEvents = meetings.filter(m => m.type === eventType);

  const upcomingEvents = displayedEvents.filter(m => new Date(m.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = displayedEvents.filter(m => new Date(m.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const pageTitle = eventType === MeetingType.MEETING ? 'Meetings' : 'Activities';
  const addEventButtonText = eventType === MeetingType.MEETING ? 'Add New Meeting' : 'Add New Activity';
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">{pageTitle}</h1>
        {userRole === 'admin' && (
          <button onClick={onAddNew} className="bg-bjp-green text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
             <span>{addEventButtonText}</span>
          </button>
        )}
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 border-b-2 border-bjp-orange pb-2 mb-6">Upcoming</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-6">
              {upcomingEvents.map(event => <EventCard key={event.id} event={event} userRole={userRole} onEdit={onEdit} onDelete={onDelete} />)}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No upcoming {pageTitle.toLowerCase()} scheduled.</p>
            </div>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 border-b-2 border-bjp-orange pb-2 mb-6">Past</h2>
          {pastEvents.length > 0 ? (
            <div className="space-y-6">
              {pastEvents.map(event => <EventCard key={event.id} event={event} userRole={userRole} onEdit={onEdit} onDelete={onDelete} />)}
            </div>
          ) : (
             <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No past {pageTitle.toLowerCase()} to show.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MeetingsActivities;