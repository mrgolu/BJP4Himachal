import React from 'react';

const MediaAssetCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-10 bg-gray-200 rounded mt-auto"></div>
      </div>
    </div>
  );
};

export default MediaAssetCardSkeleton;
