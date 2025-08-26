import React from 'react';

const NewsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="space-y-2 flex-grow mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default NewsCardSkeleton;
