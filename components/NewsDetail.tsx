import React, { useState, useRef, useEffect } from 'react';
import type { NewsArticle } from '../types';
import type { UserRole } from '../App';

interface NewsDetailProps {
  post: NewsArticle;
  onBack: () => void;
  onEdit: (post: NewsArticle) => void;
  onDelete: (postId: string) => void;
  onLinkClick: (postId: string, platform: 'fb' | 'insta' | 'x') => void;
  userRole: UserRole;
}

const FacebookIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.011 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.316 1.363.364 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.316-2.427.364-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.316-1.363-.364-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049 1.064.218 1.791.465 2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.316 2.427-.364C9.79 2.01 10.145 2 12.315 2zm0 1.623c-2.387 0-2.691.01-3.633.058-1.002.045-1.504.207-1.857.344-.467.182-.86.399-1.249.787-.389.389-.605.782-.787 1.25-.137.353-.3.855-.344 1.857-.048.942-.058 1.246-.058 3.633s.01 2.691.058 3.633c.045 1.002.207 1.504.344 1.857.182.466.399.86.787 1.249.389.389.782.605 1.25.787.353.137.855.3 1.857.344.942.048 1.246.058 3.633.058s2.691-.01 3.633-.058c1.002-.045 1.504-.207 1.857-.344.467-.182.86-.399 1.249-.787.389.389.605-.782.787-1.25.137.353.3-.855-.344-1.857.048-.942.058-1.246.058-3.633s-.01-2.691-.058-3.633c-.045-1.002-.207-1.504-.344-1.857a3.27 3.27 0 00-.787-1.249 3.27 3.27 0 00-1.249-.787c-.353-.137-.855-.3-1.857-.344-.942-.048-1.246-.058-3.633-.058zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 5.823a2.073 2.073 0 110-4.146 2.073 2.073 0 010 4.146zM18.23 6.94a1.2 1.2 0 10-2.4 0 1.2 1.2 0 002.4 0z" clipRule="evenodd" />
  </svg>
);

const XIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


const NewsDetail: React.FC<NewsDetailProps> = ({ post, onBack, onEdit, onDelete, onLinkClick, userRole }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const confirmDeleteTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confirmDeleteTimeoutRef.current) {
        clearTimeout(confirmDeleteTimeoutRef.current);
      }
    };
  }, []);

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      if (confirmDeleteTimeoutRef.current) {
        clearTimeout(confirmDeleteTimeoutRef.current);
      }
      setIsConfirmingDelete(false);
      onDelete(post.id);
    } else {
      setIsConfirmingDelete(true);
      confirmDeleteTimeoutRef.current = window.setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000);
    }
  };
  
  const postDate = new Date(post.date);

  const renderMedia = () => {
    if (!post.featuredMedia) return null;
    
    switch (post.featuredMedia.type) {
      case 'image':
        return <img className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md" src={post.featuredMedia.url} alt={post.title} />;
      case 'video':
        return <video className="w-full h-auto max-h-[500px] rounded-lg shadow-md bg-black" src={post.featuredMedia.url} controls />;
      case 'document':
        return (
          <div className="w-full bg-gray-100 p-8 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
            <svg className="w-24 h-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p className="mt-4 text-lg font-semibold text-gray-800">{post.featuredMedia.name}</p>
            <p className="text-sm text-gray-600">{post.featuredMedia.mimeType}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 200) + '...',
        });
      } catch (error) {
        console.error('Error sharing article:', error);
      }
    } else {
      alert('Share functionality is not supported on this device/browser.');
    }
  };


  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-xl">
       <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center text-bjp-orange hover:text-orange-700 font-semibold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to News Feed
        </button>
        {userRole === 'admin' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(post)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange"
              aria-label="Edit this article"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${isConfirmingDelete ? 'bg-red-700 focus:ring-red-800' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
              aria-label={isConfirmingDelete ? 'Confirm deletion' : 'Delete this article'}
              style={{minWidth: '110px', justifyContent: 'center'}}
            >
              {isConfirmingDelete ? 'Confirm?' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <article>
        <span className="inline-block bg-green-200 text-green-800 text-sm font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {post.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span>{postDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {userRole === 'admin' && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Analytics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm">
                  <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      <span className="font-bold text-xl text-gray-800">{post.views}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total Views</p>
              </div>
              {post.socials?.fb && (
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center text-blue-600">
                          <FacebookIcon className="w-5 h-5 mr-2"/>
                          <span className="font-bold text-xl text-gray-800">{post.linkClicks.fb}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Facebook Clicks</p>
                  </div>
              )}
              {post.socials?.insta && (
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center text-pink-600">
                          <InstagramIcon className="w-5 h-5 mr-2"/>
                          <span className="font-bold text-xl text-gray-800">{post.linkClicks.insta}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Instagram Clicks</p>
                  </div>
              )}
               {post.socials?.x && (
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white shadow-sm">
                      <div className="flex items-center text-gray-800">
                          <XIcon className="w-4 h-4 mr-2"/>
                          <span className="font-bold text-xl text-gray-800">{post.linkClicks.x}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">X Clicks</p>
                  </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mb-8">
            {renderMedia()}
            <div className="flex items-center justify-start space-x-4 mt-4">
                {userRole === 'admin' && (
                  <a
                    href={post.featuredMedia.url}
                    download={post.featuredMedia.name}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    aria-label={`Download ${post.featuredMedia.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange"
                  aria-label="Share this article"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share
                </button>
            </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {post.content.split('\\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
            ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          {post.socials && (post.socials.fb || post.socials.insta || post.socials.x) && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">View on Social Media</h3>
              <div className="flex justify-center items-center space-x-8">
                {post.socials.fb && (
                  <a href={post.socials.fb} onClick={() => onLinkClick(post.id, 'fb')} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook">
                    <FacebookIcon />
                  </a>
                )}
                {post.socials.insta && (
                  <a href={post.socials.insta} onClick={() => onLinkClick(post.id, 'insta')} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors" aria-label="Instagram">
                    <InstagramIcon />
                  </a>
                )}
                {post.socials.x && (
                  <a href={post.socials.x} onClick={() => onLinkClick(post.id, 'x')} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="X">
                    <XIcon />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;
