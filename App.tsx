

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
import { supabase, dataURLtoFile } from './lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Session } from '@supabase/supabase-js';
import NewsCardSkeleton from './components/skeletons/NewsCardSkeleton';
import MeetingCardSkeleton from './components/skeletons/MeetingCardSkeleton';
import MediaAssetCardSkeleton from './components/skeletons/MediaAssetCardSkeleton';
import LoadingSpinner from './components/LoadingSpinner';


type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting' | 'media-kit';
export type UserRole = 'admin' | 'user';
type AuthStatus = 'unauthenticated' | UserRole;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [session, setSession] = useState<Session | null>(null);
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
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setAuthStatus(session ? 'admin' : 'unauthenticated');
        setIsLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (!session) {
            setAuthStatus('unauthenticated');
            setPosts([]);
            setMeetings([]);
            setMediaAssets([]);
        } else {
            setAuthStatus('admin');
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const [postsRes, meetingsRes, linksRes, mediaAssetsRes] = await Promise.all([
            supabase.from('posts').select('*').order('date', { ascending: false }),
            supabase.from('meetings').select('*').order('date', { ascending: false }),
            supabase.from('settings').select('value').eq('key', 'socialLinks').single(),
            supabase.from('media_assets').select('*').order('created_at', { ascending: false }),
        ]);

        if (postsRes.error) throw postsRes.error;
        if (meetingsRes.error) throw meetingsRes.error;
        if (linksRes.error && linksRes.status !== 406) throw linksRes.error; // 406 means no rows, which is fine
        if (mediaAssetsRes.error) throw mediaAssetsRes.error;
        
        setPosts(postsRes.data || []);
        setMeetings(meetingsRes.data || []);
        setSocialLinks(linksRes.data?.value || { fb: '', insta: '', x: '' });
        setMediaAssets(mediaAssetsRes.data || []);

    } catch (error) {
        console.error("Failed to load portal data from Supabase:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus !== 'unauthenticated') {
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
    const { featured_media, ...rest } = newPostData;
    const newPostId = uuidv4();

    try {
        let finalMedia = featured_media;
        if (featured_media.url.startsWith('data:')) {
            const file = dataURLtoFile(featured_media.url, featured_media.name);
            const filePath = `posts/${newPostId}/${file.name}`;
            const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
            finalMedia = { ...featured_media, url: publicUrl };
        }

        const fullPost: Omit<NewsArticle, 'created_at' | 'date'> & {id: string; views: number; link_clicks: object;} = {
            ...rest,
            featured_media: finalMedia,
            id: newPostId,
            views: 0,
            link_clicks: { fb: 0, insta: 0, x: 0 },
        };

        const { error } = await supabase.from('posts').insert(fullPost);
        if (error) throw error;
        
        await refetchData();
        navigateToFeed();
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
  };

  const handleUpdatePost = async (updatedPost: NewsArticle) => {
    const { featured_media, ...rest } = updatedPost;
     try {
        let finalMedia = featured_media;
        if (featured_media.url.startsWith('data:')) {
            // New file uploaded, handle upload and update URL
            const file = dataURLtoFile(featured_media.url, featured_media.name);
            const filePath = `posts/${updatedPost.id}/${file.name}`;
            const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, { upsert: true });
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
            finalMedia = { ...featured_media, url: publicUrl };
        }
        
        const postForUpdate = { ...rest, featured_media: finalMedia };
        const { error } = await supabase.from('posts').update(postForUpdate).eq('id', updatedPost.id);
        if (error) throw error;
        
        await refetchData();
        if (selectedPost?.id === updatedPost.id) {
            // Find the updated post in the newly fetched list to update detail view
            const refreshedPosts = await supabase.from('posts').select('*').eq('id', updatedPost.id).single();
            if(refreshedPosts.data) setSelectedPost(refreshedPosts.data);
        }
        navigateToFeed();
     } catch (error) {
        console.error("Error updating post:", error);
        throw error;
     }
  }

  const handleDeletePost = async (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;

    try {
        // Delete media from storage
        const filePath = postToDelete.featured_media.url.split('/media/')[1];
        if (filePath) await supabase.storage.from('media').remove([filePath]);

        // Delete post from DB
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) throw error;

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
    const { error } = await supabase.rpc('increment_views', { post_id: postId });
    if (error) console.error("Error incrementing view:", error);
    else {
        setPosts(currentPosts => currentPosts.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p));
        if (selectedPost?.id === postId) {
            setSelectedPost(p => p ? { ...p, views: p.views + 1 } : null);
        }
    }
  };
  
  const handleIncrementLinkClick = async (postId: string, platform: 'fb' | 'insta' | 'x') => {
    const { error } = await supabase.rpc('increment_link_click', { post_id: postId, platform_name: platform });
    if (error) console.error("Error incrementing link click:", error);
    else {
       setPosts(currentPosts => currentPosts.map(p => p.id === postId ? { ...p, link_clicks: {...p.link_clicks, [platform]: p.link_clicks[platform] + 1} } : p));
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
    const { error } = await supabase.from('settings').upsert({ key: 'socialLinks', value: links });
    if (error) {
        console.error("Error saving social links:", error);
        throw error;
    }
    setSocialLinks(links);
    navigateToFeed();
  };

  const handleLogin = async (password: string) => {
     const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@bjp.hp', // Fixed admin email for this internal tool
        password: password,
     });

     if (error) {
        setLoginError('Incorrect password. Please try again.');
     } else {
        setAuthStatus('admin');
        setLoginError(null);
        setCurrentView('feed');
     }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleContinueAsGuest = () => {
    setAuthStatus('user');
    setCurrentView('feed');
  };

  const handleCreateMeeting = async (newMeetingData: Omit<Meeting, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('meetings').insert({ ...newMeetingData, id: uuidv4() });
    if (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
    await refetchData();
    setCurrentView(newMeetingData.type === MeetingType.MEETING ? 'meetings' : 'activities');
  };

  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    const { error } = await supabase.from('meetings').update(updatedMeeting).eq('id', updatedMeeting.id);
    if (error) {
      console.error("Error updating meeting:", error);
      throw error;
    }
    await refetchData();
    setCurrentView(updatedMeeting.type === MeetingType.MEETING ? 'meetings' : 'activities');
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const { error } = await supabase.from('meetings').delete().eq('id', meetingId);
    if (error) console.error("Error deleting meeting:", error);
    else await refetchData();
  };
  
  const handleUploadMediaAsset = async (assetData: Omit<MediaAsset, 'id' | 'created_at'>) => {
    const newAssetId = uuidv4();
    try {
        const file = dataURLtoFile(assetData.file.url, assetData.file.name);
        const filePath = `media-kit/${newAssetId}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        
        const fullAsset = {
            ...assetData,
            id: newAssetId,
            file: { ...assetData.file, url: publicUrl }
        };

        const { error: dbError } = await supabase.from('media_assets').insert(fullAsset);
        if (dbError) throw dbError;

        await refetchData();

    } catch (error) {
        console.error("Error uploading media asset:", error);
        throw error;
    }
  };

  const handleDeleteMediaAsset = async (assetId: string) => {
      const assetToDelete = mediaAssets.find(a => a.id === assetId);
      if (!assetToDelete) return;
      try {
        const filePath = assetToDelete.file.url.split('/media/')[1];
        if (filePath) await supabase.storage.from('media').remove([filePath]);

        const { error } = await supabase.from('media_assets').delete().eq('id', assetId);
        if (error) throw error;
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
      user: authStatus === 'admin' ? 'Admin' : 'Guest',
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
    // Show skeleton loaders for data-heavy pages while fetching.
    // The initial check for session is handled by `authStatus`.
    if (isLoading && authStatus !== 'unauthenticated') {
      return renderLoadingState();
    }
    
    if (authStatus === 'unauthenticated') {
      return <SignIn onAdminLogin={handleLogin} onGuestContinue={handleContinueAsGuest} error={loginError} />;
    }
    
    switch (currentView) {
      case 'feed':
        return <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={handleStartEdit} onDeletePost={handleDeletePost} userRole={authStatus} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={joinLiveStream} />;
      case 'detail':
        return selectedPost && <NewsDetail post={selectedPost} onBack={navigateToFeed} onEdit={handleStartEdit} onDelete={handleDeletePost} onLinkClick={handleIncrementLinkClick} userRole={authStatus} />;
      case 'manage':
        return <ManagePanel onCreatePost={handleCreatePost} onUpdatePost={handleUpdatePost} postToEdit={editingPost} onCancel={navigateToFeed} />;
      case 'admin':
        return <AdminPanel initialLinks={socialLinks} onSave={handleSaveSocialLinks} onCancel={navigateToFeed} />;
      case 'live-admin':
        return <LiveStreamAdmin onStreamStart={handleStartStream} onStreamEnd={handleStreamEnd} comments={liveStream?.comments || []} />;
      case 'live-user':
          return liveStream && <LiveStreamUser title={liveStream.title} comments={liveStream.comments} onAddComment={handleAddComment} onBack={navigateToFeed} />;
      case 'meetings':
        return <MeetingsActivities meetings={meetings} eventType={MeetingType.MEETING} userRole={authStatus} onAddNew={() => navigateToManageMeeting(null)} onEdit={navigateToManageMeeting} onDelete={handleDeleteMeeting} />;
      case 'activities':
        return <MeetingsActivities meetings={meetings} eventType={MeetingType.ACTIVITY} userRole={authStatus} onAddNew={() => navigateToManageMeeting(null)} onEdit={navigateToManageMeeting} onDelete={handleDeleteMeeting} />;
      case 'manage-meeting':
        return <ManageMeeting onCreate={handleCreateMeeting} onUpdate={handleUpdateMeeting} meetingToEdit={editingMeeting} newMeetingType={newMeetingType} onCancel={() => setCurrentView(meetingReturnPath)} />;
      case 'media-kit':
        return <MediaKit assets={mediaAssets} userRole={authStatus} onUpload={handleUploadMediaAsset} onDelete={handleDeleteMediaAsset} />;
      default:
        return <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={handleStartEdit} onDeletePost={handleDeletePost} userRole={authStatus} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={joinLiveStream} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {authStatus !== 'unauthenticated' && (
        <Header 
            onNewPostClick={navigateToManage} 
            onHomeClick={navigateToFeed} 
            userRole={authStatus}
            onLogout={handleLogout}
            isLive={!!liveStream}
            liveTitle={liveStream?.title}
            onGoLive={() => setCurrentView('live-admin')}
            onJoinLive={joinLiveStream}
            onMeetingsClick={navigateToMeetings}
            onActivitiesClick={navigateToActivities}
            onMediaKitClick={navigateToMediaKit}
        />
      )}
      <main className="flex-grow container mx-auto px-4 py-8 mb-16 md:mb-0">
        {renderContent()}
      </main>
      {authStatus !== 'unauthenticated' && (
        <>
            <Footer links={socialLinks} onAdminClick={navigateToAdmin} userRole={authStatus} />
            <BottomNav
                currentView={currentView}
                onHomeClick={navigateToFeed}
                onMeetingsClick={navigateToMeetings}
                onActivitiesClick={navigateToActivities}
                onMediaKitClick={navigateToMediaKit}
                onLiveClick={joinLiveStream}
                isLive={!!liveStream}
            />
        </>
      )}
    </div>
  );
};

export default App;