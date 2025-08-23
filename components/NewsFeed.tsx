import React from 'react';
import type { NewsArticle } from '../types';
import NewsCard from './NewsCard';
import type { UserRole } from '../App';

interface NewsFeedProps {
  posts: NewsArticle[];
  onSelectPost: (post: NewsArticle) => void;
  onEditPost: (post: NewsArticle) => void;
  onDeletePost: (postId: string) => void;
  userRole: UserRole;
  isLive: boolean;
  liveTitle?: string;
  onJoinLive: () => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ posts, onSelectPost, onEditPost, onDeletePost, userRole, isLive, liveTitle, onJoinLive }) => {
  const showEmptyState = posts.length === 0 && !isLive;

  return (
    <div>
       {isLive && (
        <div 
          onClick={onJoinLive}
          className="bg-red-600 text-white rounded-lg shadow-lg p-6 mb-8 cursor-pointer hover:bg-red-700 transition-colors duration-300 animate-pulse"
          role="button"
          aria-label={`Join live stream: ${liveTitle}`}
        >
          <div className="flex items-center justify-center space-x-4">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
            <div>
              <h2 className="text-2xl font-bold">LIVE NOW</h2>
              <p className="text-red-100">{liveTitle}</p>
            </div>
          </div>
        </div>
      )}

      {showEmptyState ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-700">No News Posted Yet</h2>
          <p className="text-gray-500 mt-2">Click on "New Post" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <NewsCard 
              key={post.id} 
              post={post} 
              onSelectPost={onSelectPost}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost} 
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;