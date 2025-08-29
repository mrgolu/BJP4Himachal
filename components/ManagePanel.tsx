
import React, { useState, useEffect } from 'react';
import type { NewsArticle, FeaturedMedia } from '../types';
import { NewsCategory } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ManagePanelProps {
  onCreatePost: (post: Omit<NewsArticle, 'id' | 'date' | 'views' | 'link_clicks' | 'created_at' | 'user_id'>) => Promise<void>;
  onUpdatePost: (post: NewsArticle) => Promise<void>;
  postToEdit?: NewsArticle | null;
  onCancel: () => void;
}

const ManagePanel: React.FC<ManagePanelProps> = ({ onCreatePost, onUpdatePost, postToEdit, onCancel }) => {
  const isEditMode = !!postToEdit;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NewsCategory>(NewsCategory.STATE);
  const [featuredMedia, setFeaturedMedia] = useState<FeaturedMedia | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [fbLink, setFbLink] = useState('');
  const [instaLink, setInstaLink] = useState('');
  const [xLink, setXLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hold onto original analytics data during an edit
  const [originalAnalytics, setOriginalAnalytics] = useState({
    views: 0,
    link_clicks: { fb: 0, insta: 0, x: 0 },
  });

  useEffect(() => {
    if (isEditMode && postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setCategory(postToEdit.category);
      setFeaturedMedia(postToEdit.featured_media);
      setFbLink(postToEdit.socials?.fb || '');
      setInstaLink(postToEdit.socials?.insta || '');
      setXLink(postToEdit.socials?.x || '');
      setOriginalAnalytics({ views: postToEdit.views, link_clicks: postToEdit.link_clicks });
    }
  }, [isEditMode, postToEdit]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        let fileType: 'image' | 'video' | 'document' = 'document';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
        }
        setFeaturedMedia({
          url: result,
          type: fileType,
          name: file.name,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) {
        setFormError('Please enter a title first to generate content with AI.');
        return;
    }
    setIsGenerating(true);
    setFormError('');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a news article for the BJP Himachal Pradesh news portal. The title of the article is: "${title}". The article should be formal, informative, and reflect the party's perspective. It should be a few paragraphs long. Use "\\n" for new paragraphs.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setContent(response.text);

    } catch (error) {
        console.error('AI content generation failed:', error);
        setFormError('Failed to generate content. Please try again.');
    } finally {
        setIsGenerating(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !featuredMedia) {
      setFormError('All fields including the featured media file are required to publish a post.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);

    const postData = {
      title,
      content,
      category,
      featured_media: featuredMedia,
      socials: {
        fb: fbLink || undefined,
        insta: instaLink || undefined,
        x: xLink || undefined,
      },
    };

    try {
      if (isEditMode && postToEdit) {
        await onUpdatePost({
          ...postData,
          id: postToEdit.id,
          user_id: postToEdit.user_id,
          date: postToEdit.date,
          created_at: postToEdit.created_at,
          views: originalAnalytics.views,
          link_clicks: originalAnalytics.link_clicks
        });
      } else {
        await onCreatePost(postData);
      }
    } catch (error) {
      console.error("Post submission failed:", error);
      setFormError("An error occurred while submitting the post. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* News Form Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-bjp-orange pb-2">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h2>
        {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{formError}</div>}
        <form onSubmit={handlePostSubmit} className="space-y-6">
          <fieldset disabled={isSubmitting}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                  <button
                      type="button"
                      onClick={handleGenerateContent}
                      disabled={isGenerating || !title.trim() || isSubmitting}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      aria-label="Generate content with AI"
                  >
                      {isGenerating ? (
                          <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                          </>
                      ) : (
                          <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Generate with AI
                          </>
                      )}
                  </button>
              </div>
              <textarea
                id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category" value={category} onChange={(e) => setCategory(e.target.value as NewsCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
              >
                {Object.values(NewsCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Media</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {featuredMedia ? (
                    <div className="text-center">
                        {featuredMedia.type === 'image' && (
                            <img src={featuredMedia.url} alt="Preview" className="mx-auto h-48 w-auto rounded-md object-contain"/>
                        )}
                        {featuredMedia.type === 'video' && (
                            <video src={featuredMedia.url} controls className="mx-auto h-48 w-auto rounded-md object-contain" />
                        )}
                        {featuredMedia.type === 'document' && (
                            <div className="py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <p className="mt-2 text-sm text-gray-600 truncate max-w-xs mx-auto">{featuredMedia.name}</p>
                            </div>
                        )}
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-bjp-orange hover:text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-bjp-orange">
                      <span>{featuredMedia ? 'Change file' : 'Upload a file'}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">Images, Videos, Documents</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Social Media Links</h3>
              <p className="text-sm text-gray-500 mb-4">Optionally, add links to social media posts for this article.</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fbLink" className="block text-sm font-medium text-gray-700 mb-1">Facebook Post URL</label>
                  <input
                    type="url" id="fbLink" value={fbLink} onChange={(e) => setFbLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="instaLink" className="block text-sm font-medium text-gray-700 mb-1">Instagram Post URL</label>
                  <input
                    type="url" id="instaLink" value={instaLink} onChange={(e) => setInstaLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="xLink" className="block text-sm font-medium text-gray-700 mb-1">X (Twitter) Post URL</label>
                  <input
                    type="url" id="xLink" value={xLink} onChange={(e) => setXLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange disabled:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 flex items-center justify-center min-w-[130px]">
              {isSubmitting ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                isEditMode ? 'Update Post' : 'Publish Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagePanel;
