
import React from 'react';
import type { NewsArticle } from '../types';
import NewsCard from './NewsCard';

interface NewsFeedProps {
  posts: NewsArticle[];
  onSelectPost: (post: NewsArticle) => void;
  onEditPost: (post: NewsArticle) => void;
  onDeletePost: (postId: string) => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ posts, onSelectPost, onEditPost, onDeletePost }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-700">No News Posted Yet</h2>
        <p className="text-gray-500 mt-2">Click on "New Post" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map(post => (
        <NewsCard 
          key={post.id} 
          post={post} 
          onSelectPost={onSelectPost}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost} 
        />
      ))}
    </div>
  );
};

export default NewsFeed;