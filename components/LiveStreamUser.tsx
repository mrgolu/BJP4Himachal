import React, { useState, useRef, useEffect } from 'react';
import type { Comment } from '../types';

interface LiveStreamUserProps {
  title: string;
  comments: Comment[];
  onAddComment: (text: string) => void;
  onBack: () => void;
}

const LiveStreamUser: React.FC<LiveStreamUserProps> = ({ title, comments, onAddComment, onBack }) => {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div>
        <button
          onClick={onBack}
          className="inline-flex items-center text-bjp-orange hover:text-orange-700 font-semibold transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to News Feed
        </button>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="relative aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 5.106A1 1 0 0116 6v8a1 1 0 01-1.447.894l-3-2A1 1 0 0111 12V8a1 1 0 01.553-.894l3-2z" />
                    </svg>
                    <p className="ml-4 text-xl">Live stream in progress...</p>
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-md flex items-center animate-pulse">
                        <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        LIVE
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col h-[70vh]">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Live Chat</h3>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                     {comments.map(comment => (
                        <div key={comment.id} className={`flex flex-col ${comment.user === 'Admin' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-xs ${comment.user === 'Admin' ? 'bg-bjp-orange text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="font-bold text-sm">{comment.user}</p>
                            <p className="text-md">{comment.text}</p>
                        </div>
                        </div>
                    ))}
                    <div ref={commentsEndRef} />
                </div>
                <form onSubmit={handleCommentSubmit} className="mt-4 flex space-x-2 border-t pt-4">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Say something..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
                        aria-label="Your comment"
                    />
                    <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Send
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default LiveStreamUser;
