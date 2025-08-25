import React, { useState, useRef } from 'react';
import type { NewsArticle } from '../types';
import type { UserRole } from '../App';

interface NewsCardProps {
  post: NewsArticle;
  onSelectPost: (post: NewsArticle) => void;
  onEditPost: (post: NewsArticle) => void;
  onDeletePost: (postId: string) => void;
  userRole: UserRole;
}

const NewsCard: React.FC<NewsCardProps> = ({ post, onSelectPost, onEditPost, onDeletePost, userRole }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimeoutRef = useRef<number | null>(null);
  
  const snippet = post.content.substring(0, 100) + '...';
  const postDate = new Date(post.date);
  const totalClicks = post.linkClicks.fb + post.linkClicks.insta + post.linkClicks.x;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPost(post);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      onDeletePost(post.id);
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


  const renderMediaPreview = () => {
    switch (post.featuredMedia.type) {
      case 'image':
        return <img className="w-full h-48 object-contain bg-gray-100" src={post.featuredMedia.url} alt={post.title} />;
      case 'video':
        return (
          <video
            src={post.featuredMedia.url}
            className="w-full h-48 object-contain bg-black"
            autoPlay
            loop
            muted
            playsInline
          />
        );
      case 'document':
        return (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
        );
      default:
        return <div className="w-full h-48 bg-gray-100" />;
    }
  };


  return (
    <div
      onClick={() => onSelectPost(post)}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ease-in-out group relative flex flex-col"
    >
      {userRole === 'admin' && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button onClick={handleEdit} className="p-2 bg-white/70 rounded-full hover:bg-white transition-colors" aria-label="Edit Post">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleDelete} 
            className={`p-2 rounded-full transition-all duration-300 ${confirmDelete ? 'bg-red-600 text-white shadow-lg' : 'bg-white/70 hover:bg-white'}`} 
            aria-label={confirmDelete ? 'Confirm Delete' : 'Delete Post'}
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
      {renderMediaPreview()}
      <div className="p-6 flex-grow flex flex-col">
        <span className="inline-block bg-orange-200 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide mb-2 self-start">
          {post.category}
        </span>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-bjp-orange transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">{snippet}</p>
        <div className="flex items-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center" title="Date Published">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{postDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          {userRole === 'admin' && (
            <div className="ml-auto flex items-center space-x-4">
              <div className="flex items-center" title="Post Views">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{post.views}</span>
              </div>
              <div className="flex items-center" title="Total Link Clicks">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                <span>{totalClicks}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;