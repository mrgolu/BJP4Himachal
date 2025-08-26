import React, { useState } from 'react';
import type { SocialLinks } from '../types';

interface AdminPanelProps {
  onSave: (links: SocialLinks) => Promise<void>;
  onCancel: () => void;
  initialLinks: SocialLinks;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onCancel, initialLinks }) => {
  const [links, setLinks] = useState<SocialLinks>(initialLinks);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await onSave(links);
    } catch (error) {
        // Parent component handles error logging, this just resets the button
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-bjp-orange pb-2">Admin Panel</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} disabled={isSaving} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-100">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 flex items-center justify-center min-w-[120px]">
             {isSaving ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                </>
             ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;