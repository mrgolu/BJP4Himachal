import React, { useState, useEffect, useRef } from 'react';
import type { Comment } from '../types';

interface LiveStreamAdminProps {
  onStreamStart: (title: string) => void;
  onStreamEnd: () => void;
  comments: Comment[];
}

const LiveStreamAdmin: React.FC<LiveStreamAdminProps> = ({ onStreamStart, onStreamEnd, comments }) => {
  const [title, setTitle] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming) {
      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setError("Could not access camera/microphone. Please check permissions and try again.");
        }
      };
      startWebcam();
      
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [isStreaming]);
  
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onStreamStart(title);
      setIsStreaming(true);
    }
  };

  if (!isStreaming) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-bjp-orange pb-2">Start Live Stream</h2>
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label htmlFor="streamTitle" className="block text-sm font-medium text-gray-700 mb-1">Stream Title</label>
            <input
              type="text"
              id="streamTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Evening Press Briefing"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              Go Live
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Video and Controls */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
           <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded-md flex items-center animate-pulse">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              LIVE
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button onClick={onStreamEnd} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            End Stream
          </button>
        </div>
      </div>

      {/* Comments Section */}
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
      </div>
    </div>
  );
};

export default LiveStreamAdmin;
