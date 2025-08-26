


import React, { useState, useMemo } from 'react';
import type { MediaAsset } from '../types';
import { MediaAssetCategory } from '../types';
import type { UserRole } from '../App';

interface UploadAssetFormProps {
    onUpload: (asset: Omit<MediaAsset, 'id' | 'created_at'>) => Promise<void>;
    onCancel: () => void;
}

const UploadAssetForm: React.FC<UploadAssetFormProps> = ({ onUpload, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<MediaAssetCategory>(MediaAssetCategory.GENERAL);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !file) {
            setError('Title and a file are required.');
            return;
        }
        setError('');
        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Url = reader.result as string;
                const assetData = {
                    title,
                    description,
                    category,
                    file: {
                        url: base64Url,
                        name: file.name,
                        mimeType: file.type,
                    },
                };
                await onUpload(assetData as Omit<MediaAsset, 'id' | 'created_at'>);
            } catch (uploadError) {
                console.error("Upload failed", uploadError);
                setError("An error occurred during upload. Please try again.");
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-bjp-orange pb-2">Upload New Asset</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isUploading}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="asset-title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="asset-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange" required />
                        </div>
                        <div>
                            <label htmlFor="asset-category" className="block text-sm font-medium text-gray-700">Category</label>
                            <select id="asset-category" value={category} onChange={e => setCategory(e.target.value as MediaAssetCategory)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange bg-white">
                                {Object.values(MediaAssetCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="asset-description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea id="asset-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bjp-orange focus:border-bjp-orange"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">File</label>
                        <div className="mt-1 flex items-center space-x-4">
                            {preview && <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-md bg-gray-100" />}
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-bjp-orange hover:text-orange-600 focus-within:outline-none">
                                    <span>{file ? 'Change file' : 'Select a file'}</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                </label>
                            </div>
                            {file && <p className="text-sm text-gray-500">{file.name}</p>}
                        </div>
                    </div>
                </fieldset>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} disabled={isUploading} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100">Cancel</button>
                    <button type="submit" disabled={isUploading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bjp-green hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center min-w-[130px]">
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : 'Upload Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};


interface MediaAssetCardProps {
    asset: MediaAsset;
    userRole: UserRole;
    onDelete: (id: string) => void;
}

const MediaAssetCard: React.FC<MediaAssetCardProps> = ({ asset, userRole, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden group relative flex flex-col border">
             {userRole === 'admin' && (
                <button 
                    onClick={() => onDelete(asset.id)}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/70 rounded-full hover:bg-red-200 transition-colors"
                    aria-label="Delete Asset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <img src={asset.file.url} alt={asset.title} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-md font-bold text-gray-800">{asset.title}</h3>
                <p className="text-sm text-gray-600 flex-grow mb-2">{asset.description}</p>
                <a 
                    href={asset.file.url} 
                    download={asset.file.name}
                    className="mt-auto w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-bjp-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bjp-orange"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                </a>
            </div>
        </div>
    );
};

interface MediaKitProps {
    assets: MediaAsset[];
    userRole: UserRole;
    onUpload: (asset: Omit<MediaAsset, 'id' | 'created_at'>) => Promise<void>;
    onDelete: (id: string) => void;
}

const MediaKit: React.FC<MediaKitProps> = ({ assets, userRole, onUpload, onDelete }) => {
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [activeFilter, setActiveFilter] = useState<MediaAssetCategory | 'All'>('All');

    const filteredAssets = useMemo(() => {
        if (activeFilter === 'All') return assets;
        return assets.filter(asset => asset.category === activeFilter);
    }, [assets, activeFilter]);

    const handleUploadSuccess = async (asset: Omit<MediaAsset, 'id' | 'created_at'>) => {
        await onUpload(asset);
        setShowUploadForm(false);
    };

    const categories = ['All', ...Object.values(MediaAssetCategory)];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-bold text-gray-800">Media Kit</h1>
                {userRole === 'admin' && !showUploadForm && (
                    <button onClick={() => setShowUploadForm(true)} className="bg-bjp-green text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13h-2.5z" /><path d="M9 13h2v5a1 1 0 11-2 0v-5z" /></svg>
                        <span>Upload New Asset</span>
                    </button>
                )}
            </div>

            {userRole === 'admin' && showUploadForm && (
                <UploadAssetForm onUpload={handleUploadSuccess} onCancel={() => setShowUploadForm(false)} />
            )}

            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat as MediaAssetCategory | 'All')}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                activeFilter === cat
                                ? 'bg-bjp-orange text-white shadow'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredAssets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => (
                        <MediaAssetCard key={asset.id} asset={asset} userRole={userRole} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No assets found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default MediaKit;