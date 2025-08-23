import React, { useState } from 'react';
import type { SocialLinks } from '../types';

interface AdminPanelProps {
  onSave: (links: SocialLinks) => void;
  onCancel: () => void;
  initialLinks: SocialLinks;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onCancel, initialLinks }) => {
  const [links, setLinks] = useState<SocialLinks>(initialLinks);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(links);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-bjp-orange pb-2">Admin Panel</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;
