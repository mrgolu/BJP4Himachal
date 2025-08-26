

import React, { useState, useEffect } from 'react';
import type { NewsArticle, SocialLinks, Comment, Meeting, MediaAsset } from './types';
import { NewsCategory, MeetingType, MediaAssetCategory } from './types';
import Header from './components/Header';
import NewsFeed from './components/NewsFeed';
import NewsDetail from './components/NewsDetail';
import ManagePanel from './components/ManagePanel';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import SignIn from './components/SignIn';
import LiveStreamAdmin from './components/LiveStreamAdmin';
import LiveStreamUser from './components/LiveStreamUser';
import MeetingsActivities from './components/MeetingsActivities';
import ManageMeeting from './components/ManageMeeting';
import BottomNav from './components/BottomNav';
import MediaKit from './components/MediaKit';
import db from './lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import NewsCardSkeleton from './components/skeletons/NewsCardSkeleton';
import MeetingCardSkeleton from './components/skeletons/MeetingCardSkeleton';
import MediaAssetCardSkeleton from './components/skeletons/MediaAssetCardSkeleton';
import LoadingSpinner from './components/LoadingSpinner';
import Setup from './components/Setup';


type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting' | 'media-kit';
export type UserRole = 'admin' | 'user';
type AuthStatus = 'unauthenticated' | UserRole;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [userName, setUserName] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [liveStream, setLiveStream] = useState<{ title: string; comments: Comment[] } | null>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ fb: '', insta: '', x: '' });
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  const [selectedPost, setSelectedPost] = useState<NewsArticle | null>(null);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingReturnPath, setMeetingReturnPath] = useState<View>('meetings');
  const [newMeetingType, setNewMeetingType] = useState<MeetingType>(MeetingType.MEETING);

  useEffect(() => {
    const checkAuth = async () => {
        try {
            const persistedAuth = sessionStorage.getItem('authStatus');
            if (persistedAuth === 'admin') {
                setAuthStatus('admin');
            } else if (persistedAuth === 'user') {
                const storedName = sessionStorage.getItem('userName');
                if (storedName) {
                    setUserName(storedName);
                    setAuthStatus('user');
                } else {
                    setAuthStatus('unauthenticated');
                }
            } else {
                setAuthStatus('unauthenticated');
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            setAuthStatus('unauthenticated');
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };
    checkAuth();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [postsData, meetingsData, socialLinksData, mediaAssetsData] = await Promise.all([
            db.getAll<NewsArticle>('posts'),
            db.getAll<Meeting>('meetings'),
            db.get<{key: string, value: SocialLinks}>('settings', 'socialLinks'),
            db.getAll<MediaAsset>('media_assets'),
        ]);

        postsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        meetingsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        mediaAssetsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setPosts(postsData);
        setMeetings(meetingsData);
        setSocialLinks(socialLinksData?.value || { fb: '', insta: '', x: '' });
        setMediaAssets(mediaAssetsData);

    } catch (error) {
        console.error("Failed to load portal data from LocalDB:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'admin' || authStatus === 'user') {
        loadData();
    }
  }, [authStatus]);
  
  const refetchData = loadData;

  const navigateToFeed = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setCurrentView('feed');
  };

  const handleCreatePost = async (newPostData: Omit<NewsArticle, 'id' | 'date' | 'views' | 'link_clicks' | 'created_at'>) => {
    try {
        const now = new Date().toISOString();
        const fullPost: NewsArticle = {
            ...newPostData,
            id: uuidv4(),
            date: now,
            created_at: now,
            views: 0,
            link_clicks: { fb: 0, insta: 0, x: 0 },
        };
        await db.add('posts', fullPost);
        await refetchData();
        navigateToFeed();
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
  };

  const handleUpdatePost = async (updatedPost: NewsArticle) => {
     try {
        await db.put('posts', updatedPost);
        await refetchData();
        if (selectedPost?.id === updatedPost.id) {
            const refreshedPost = await db.get<NewsArticle>('posts', updatedPost.id);
            if (refreshedPost) setSelectedPost(refreshedPost);
        }
        navigateToFeed();
     } catch (error) {
        console.error("Error updating post:", error);
        throw error;
     }
  }

  const handleDeletePost = async (postId: string) => {
    try {
        await db.delete('posts', postId);
        const isViewingDeletedPost = currentView === 'detail' && selectedPost?.id === postId;
        await refetchData();
        if (isViewingDeletedPost) {
          navigateToFeed();
        }
    } catch (error) {
        console.error("Error deleting post:", error);
    }
  };
  
  const handleIncrementView = async (postId: string) => {
    try {
        const post = await db.get<NewsArticle>('posts', postId);
        if (post) {
            post.views += 1;
            await db.put('posts', post);
            setPosts(currentPosts => currentPosts.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p));
            if (selectedPost?.id === postId) {
                setSelectedPost(p => p ? { ...p, views: p.views + 1 } : null);
            }
        }
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  };
  
  const handleIncrementLinkClick = async (postId: string, platform: 'fb' | 'insta' | 'x') => {
    try {
      const post = await db.get<NewsArticle>('posts', postId);
      if(post) {
        post.link_clicks[platform] = (post.link_clicks[platform] || 0) + 1;
        await db.put('posts', post);
        setPosts(currentPosts => currentPosts.map(p => p.id === postId ? { ...p, link_clicks: {...p.link_clicks, [platform]: p.link_clicks[platform] + 1} } : p));
      }
    } catch (error) {
       console.error("Error incrementing link click:", error);
    }
  }

  const handleStartEdit = (post: NewsArticle) => {
    setEditingPost(post);
    setCurrentView('manage');
  }

  const handleSelectPost = (post: NewsArticle) => {
    handleIncrementView(post.id);
    setSelectedPost(post);
    setCurrentView('detail');
  };
  
  const navigateToManage = () => {
      setEditingPost(null);
      setCurrentView('manage');
  }
  
  const navigateToAdmin = () => {
      setCurrentView('admin');
  }
  
  const navigateToMeetings = () => {
      setCurrentView('meetings');
  }
  
  const navigateToActivities = () => {
      setCurrentView('activities');
  }
  
  const navigateToMediaKit = () => {
    setCurrentView('media-kit');
  };

  const navigateToManageMeeting = (meeting: Meeting | null) => {
    if (currentView === 'meetings' || currentView === 'activities') {
      setMeetingReturnPath(currentView);
    }
    if (!meeting) {
      setNewMeetingType(currentView === 'meetings' ? MeetingType.MEETING : MeetingType.ACTIVITY);
    }
    setEditingMeeting(meeting);
    setCurrentView('manage-meeting');
  };

  const handleSaveSocialLinks = async (links: SocialLinks) => {
    try {
        await db.put('settings', { key: 'socialLinks', value: links });
        setSocialLinks(links);
        navigateToFeed();
    } catch (error) {
        console.error("Error saving social links:", error);
        throw error;
    }
  };

  const handleLogin = async (password: string) => {
    if (password === 'bjp4hp') {
        setAuthStatus('admin');
        setLoginError(null);
        setCurrentView('feed');
        sessionStorage.setItem('authStatus', 'admin');
    } else {
        setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = async () => {
    setAuthStatus('unauthenticated');
    sessionStorage.removeItem('authStatus');
    sessionStorage.removeItem('userName');
    setUserName('');
    setPosts([]);
    setMeetings([]);
    setMediaAssets([]);
    setCurrentView('feed');
  };

  const handleUserSignIn = (name: string) => {
    setAuthStatus('user');
    setUserName(name);
    sessionStorage.setItem('authStatus', 'user');
    sessionStorage.setItem('userName', name);
    setCurrentView('feed');
  };

  const handleCreateMeeting = async (newMeetingData: Omit<Meeting, 'id' | 'created_at'>) => {
    try {
      const now = new Date().toISOString();
      const fullMeeting = { ...newMeetingData, id: uuidv4(), created_at: now };
      await db.add('meetings', fullMeeting);
      await refetchData();
      setCurrentView(newMeetingData.type === MeetingType.MEETING ? 'meetings' : 'activities');
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  };

  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    try {
      await db.put('meetings', updatedMeeting);
      await refetchData();
      setCurrentView(updatedMeeting.type === MeetingType.MEETING ? 'meetings' : 'activities');
    } catch (error) {
      console.error("Error updating meeting:", error);
      throw error;
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await db.delete('meetings', meetingId);
      await refetchData();
    } catch (error) {
        console.error("Error deleting meeting:", error);
    }
  };
  
  const handleUploadMediaAsset = async (assetData: Omit<MediaAsset, 'id' | 'created_at'>) => {
    try {
        const now = new Date().toISOString();
        const fullAsset = {
            ...assetData,
            id: uuidv4(),
            created_at: now
        };
        await db.add('media_assets', fullAsset);
        await refetchData();
    } catch (error) {
        console.error("Error uploading media asset:", error);
        throw error;
    }
  };

  const handleDeleteMediaAsset = async (assetId: string) => {
      try {
        await db.delete('media_assets', assetId);
        await refetchData();
      } catch (error) {
          console.error("Error deleting media asset:", error);
      }
  };
  
  const handleStartStream = (title: string) => {
    setLiveStream({ title, comments: [] });
    setCurrentView('live-admin');
  };

  const handleStreamEnd = () => {
    setLiveStream(null);
    navigateToFeed();
  };
  
  const joinLiveStream = () => {
      if(liveStream) {
          setCurrentView('live-user');
      }
  }

  const handleAddComment = (text: string) => {
    if (!liveStream) return;
    const newComment: Comment = {
      id: Date.now(),
      user: authStatus === 'admin' ? 'Admin' : userName,
      text,
    };
    setLiveStream(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
  };
  
  const renderLoadingState = () => {
    switch (currentView) {
      case 'feed':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        );
      case 'meetings':
      case 'activities': {
        const pageTitle = currentView === 'meetings' ? 'Meetings' : 'Activities';
        return (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">{pageTitle}</h1>
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-semibold text-gray-700 border-b-2 border-bjp-orange pb-2 mb-6">Upcoming</h2>
                <div className="space-y-6">
                  <MeetingCardSkeleton />
                  <MeetingCardSkeleton />
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-semibold text-gray-700 border-b-2 border-bjp-orange pb-2 mb-6">Past</h2>
                <div className="space-y-6">
                  <MeetingCardSkeleton />
                </div>
              </section>
            </div>
          </div>
        );
      }
      case 'media-kit':
        return (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Media Kit</h1>
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 animate-pulse">
                <div className="h-9 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
                <div className="h-9 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <MediaAssetCardSkeleton key={i} />)}
            </div>
          </div>
        );
      default:
        return <LoadingSpinner />;
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (authStatus === 'unauthenticated') {
      return <SignIn onAdminLogin={handleLogin} onUserSignIn={handleUserSignIn} error={loginError} />;
    }
    
    switch (currentView) {
      case 'feed':
        return <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={handleStartEdit} onDeletePost={handleDeletePost} userRole={authStatus as UserRole} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={joinLiveStream} />;
      case 'detail':
        return selectedPost && <NewsDetail post={selectedPost} onBack={navigateToFeed} onEdit={handleStartEdit} onDelete={handleDeletePost} onLinkClick={handleIncrementLinkClick} userRole={authStatus as UserRole} />;
      case 'manage':
        return <ManagePanel onCreatePost={handleCreatePost} onUpdatePost={handleUpdatePost} postToEdit={editingPost} onCancel={navigateToFeed} />;
      case 'admin':
        return <AdminPanel onSave={handleSaveSocialLinks} onCancel={navigateToFeed} initialLinks={socialLinks} />;
      case 'live-admin':
        return <LiveStreamAdmin onStreamStart={handleStartStream} onStreamEnd={handleStreamEnd} comments={liveStream?.comments || []} />;
      case 'live-user':
        return liveStream && <LiveStreamUser title={liveStream.title} comments={liveStream.comments} onAddComment={handleAddComment} onBack={navigateToFeed} />;
      case 'meetings':
        return <MeetingsActivities meetings={meetings} eventType={MeetingType.MEETING} userRole={authStatus as UserRole} onAddNew={() => navigateToManageMeeting(null)} onEdit={navigateToManageMeeting} onDelete={handleDeleteMeeting} />;
      case 'activities':
        return <MeetingsActivities meetings={meetings} eventType={MeetingType.ACTIVITY} userRole={authStatus as UserRole} onAddNew={() => navigateToManageMeeting(null)} onEdit={navigateToManageMeeting} onDelete={handleDeleteMeeting} />;
      case 'manage-meeting':
        return <ManageMeeting onCreate={handleCreateMeeting} onUpdate={handleUpdateMeeting} meetingToEdit={editingMeeting} newMeetingType={newMeetingType} onCancel={() => setCurrentView(meetingReturnPath)} />;
      case 'media-kit':
        return <MediaKit assets={mediaAssets} userRole={authStatus as UserRole} onUpload={handleUploadMediaAsset} onDelete={handleDeleteMediaAsset} />;
      default:
        return <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={handleStartEdit} onDeletePost={handleDeletePost} userRole={authStatus as UserRole} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={joinLiveStream} />;
    }
  };

  const showBottomNav = authStatus !== 'unauthenticated';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        onNewPostClick={navigateToManage} 
        onHomeClick={navigateToFeed}
        onMeetingsClick={navigateToMeetings}
        onActivitiesClick={navigateToActivities}
        onMediaKitClick={navigateToMediaKit}
        userRole={authStatus as UserRole}
        userName={userName}
        onLogout={handleLogout}
        isLive={!!liveStream}
        liveTitle={liveStream?.title}
        onGoLive={() => setCurrentView('live-admin')}
        onJoinLive={joinLiveStream}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8 pb-20 md:pb-8">
        {renderContent()}
      </main>
      {showBottomNav && (
        <BottomNav 
          currentView={currentView}
          onHomeClick={navigateToFeed}
          onMeetingsClick={navigateToMeetings}
          onActivitiesClick={navigateToActivities}
          onMediaKitClick={navigateToMediaKit}
          onLiveClick={joinLiveStream}
          isLive={!!liveStream}
        />
      )}
      <Footer links={socialLinks} onAdminClick={navigateToAdmin} userRole={authStatus as UserRole} />
    </div>
  );
};

export default App;