
import React, { useState } from 'react';
import type { SocialLinks, User } from '../types';

interface AdminPanelProps {
  onSaveSocials: (links: SocialLinks) => Promise<void>;
  onToggleUserBlock: (userId: string, isBlocked: boolean) => void;
  onCancel: () => void;
  initialLinks: SocialLinks;
  users: User[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSaveSocials, onToggleUserBlock, onCancel, initialLinks, users }) => {
  const [links, setLinks] = useState<SocialLinks>(initialLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinks(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await onSaveSocials(links);
        setHasChanges(false);
    } catch (error) {
        // Parent component handles error logging
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-bjp-orange pb-2">Admin Panel</h2>
        
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-700">Social Media Links</h3>
          <fieldset disabled={isSaving}>
              <div>
              <label htmlFor="fb" className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <input
                  type="url"
                  id="fb"
                  name="fb"
                  value={links.fb}
                  onChange={handleChange}
                  placeholder="https://facebook.com/your-page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
              />
              </div>
              <div>
              <label htmlFor="insta" className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input
                  type="url"
                  id="insta"
                  name="insta"
                  value={links.insta}
                  onChange={handleChange}
                  placeholder="https://instagram.com/your-profile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
              />
              </div>
              <div>
              <label htmlFor="x" className="block text-sm font-medium text-gray-700 mb-1">X (Twitter) URL</label>
              <input
                  type="url"
                  id="x"
                  name="x"
                  value={links.x}
                  onChange={handleChange}
                  placeholder="https://x.com/your-handle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
              />
              </div>
          </fieldset>
          {hasChanges && (
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 flex items-center justify-center min-w-[120px]">
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Link Changes'}
                </button>
            </div>
          )}
        </div>
      </div>

      <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pt-6 border-t">User Management</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {users.length > 0 ? users.map(user => (
                  <div key={user.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border">
                      <span className="font-medium text-gray-800">{user.name}</span>
                      <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${user.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                          <label htmlFor={`block-toggle-${user.id}`} className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                id={`block-toggle-${user.id}`} 
                                className="sr-only peer"
                                checked={!user.isBlocked}
                                onChange={() => onToggleUserBlock(user.id, !user.isBlocked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bjp-green"></div>
                          </label>
                      </div>
                  </div>
              )) : (
                <p className="text-center text-gray-500 py-4">No users have signed in yet.</p>
              )}
          </div>
      </div>
        <div className="flex justify-end pt-6 border-t">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Close
          </button>
        </div>
    </div>
  );
};

export default AdminPanel;
