
import React, { useState, useEffect } from 'react';
import type { Meeting } from '../types';
import { MeetingType } from '../types';

interface ManageMeetingProps {
  onCreate: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  onUpdate: (meeting: Meeting) => void;
  meetingToEdit: Meeting | null;
  newMeetingType: MeetingType;
  onCancel: () => void;
}

const ManageMeeting: React.FC<ManageMeetingProps> = ({ onCreate, onUpdate, meetingToEdit, newMeetingType, onCancel }) => {
  const isEditMode = !!meetingToEdit;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>(MeetingType.MEETING);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [invited, setInvited] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && meetingToEdit) {
      setTitle(meetingToEdit.title);
      setType(meetingToEdit.type);
      setDate(new Date(meetingToEdit.date).toISOString().slice(0, 16));
      setLocation(meetingToEdit.location);
      setDescription(meetingToEdit.description);
      setLink(meetingToEdit.link || '');
      setInvited(meetingToEdit.invited?.join('\n') || '');
    } else {
      // For new meetings, set the type based on the entry point (Meetings vs Activities page)
      setType(newMeetingType);
    }
  }, [isEditMode, meetingToEdit, newMeetingType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !description) {
      setError('Title, Date, Location, and Description are required fields.');
      return;
    }
    setError('');
    
    const meetingData = {
        title,
        type,
        date: new Date(date).toISOString(),
        location,
        description,
        link: link || undefined,
        invited: invited.split('\n').map(item => item.trim()).filter(item => item),
    };
    
    if (isEditMode && meetingToEdit) {
      onUpdate({ ...meetingData, id: meetingToEdit.id, createdAt: meetingToEdit.createdAt });
    } else {
      onCreate(meetingData);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-bjp-orange pb-2">
          {isEditMode ? `Edit ${type}` : `Add New ${type}`}
        </h2>
        {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" required />
            </div>
             <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                <select id="type" value={type} onChange={e => setType(e.target.value as MeetingType)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange bg-white">
                    {Object.values(MeetingType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input type="datetime-local" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" required />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" required />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link (Optional)</label>
                <input type="url" id="link" value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com/meeting" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" required></textarea>
            </div>
             <div className="md:col-span-2">
                <label htmlFor="invited" className="block text-sm font-medium text-gray-700">Invited Guests/Roles (one per line)</label>
                <textarea id="invited" value={invited} onChange={e => setInvited(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" placeholder="List the groups or individuals expected to attend."></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange">Cancel</button>
                <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">{isEditMode ? 'Update Event' : 'Save Event'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ManageMeeting;
