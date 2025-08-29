
import React, { useState, useEffect } from 'react';
import type { NewsArticle, SocialLinks, LiveStreamComment, Comment, Meeting, MediaAsset, Notification, User } from './types';
import { NewsCategory, MeetingType, MediaAssetCategory, NotificationType } from './types';
import Header from './components/Header';
import NewsFeed from './components/NewsFeed';
import NewsDetail from './components/NewsDetail';
import ManagePanel from './components/ManagePanel';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import SignIn from './components/SignIn';
import Setup from './components/Setup';
import LiveStreamAdmin from './components/LiveStreamAdmin';
import LiveStreamUser from './components/LiveStreamUser';
import MeetingsActivities from './components/MeetingsActivities';
import ManageMeeting from './components/ManageMeeting';
import BottomNav from './components/BottomNav';
import MediaKit from './components/MediaKit';
import { supabase, dataURLtoFile } from './lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import NewsCardSkeleton from './components/skeletons/NewsCardSkeleton';
import MeetingCardSkeleton from './components/skeletons/MeetingCardSkeleton';
import MediaAssetCardSkeleton from './components/skeletons/MediaAssetCardSkeleton';
import LoadingSpinner from './components/LoadingSpinner';

type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting' | 'media-kit';
export type UserRole = 'admin' | 'user';
type AuthStatus = 'checking' | 'setup' | 'unauthenticated' | UserRole;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
  const [userName, setUserName] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [liveStream, setLiveStream] = useState<{ title: string; comments: LiveStreamComment[] } | null>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ fb: '', insta: '', x: '' });
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedPost, setSelectedPost] = useState<NewsArticle | null>(null);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingReturnPath, setMeetingReturnPath] = useState<View>('meetings');
  const [newMeetingType, setNewMeetingType] = useState<MeetingType>(MeetingType.MEETING);
  const [initialArticleId, setInitialArticleId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('articleId');
    if (articleId) {
      setInitialArticleId(articleId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

 useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // This is the single entry point for a user becoming authenticated.
        // Ensure the initial settings are created if they don't exist.
        // This handles the case where setup required email confirmation.
        const { data: settings } = await supabase.from('settings').select('key').limit(1);

        if (settings && settings.length === 0) {
            const { error: insertError } = await supabase.from('settings').insert({
                key: 'socialLinks',
                value: { fb: '', insta: '', x: '' }
            });
            if (insertError) {
                console.error("CRITICAL: Failed to create initial settings for admin.", insertError);
            }
        }
        
        setAuthStatus('admin');
        setUserName(session.user.email || 'Admin');
        sessionStorage.setItem('authStatus', 'admin');
      } else {
        // If the session is gone, and the user was an admin, they are now unauthenticated.
        if (sessionStorage.getItem('authStatus') === 'admin') {
            setAuthStatus('unauthenticated');
        }
        sessionStorage.removeItem('authStatus');
        sessionStorage.removeItem('userName');
      }
    });
    
    // Initial check for session or setup
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
            // onAuthStateChange will handle setting the state.
        } else {
            // No session, check if setup has been done by looking for any setting.
            const { data, error } = await supabase.from('settings').select('key').limit(1);
            if (error) {
                console.error("Error checking setup status, defaulting to login screen:", error);
                setAuthStatus('unauthenticated');
            } else if (data && data.length > 0) {
                // Settings exist, so setup is done. Go to login or check for guest session.
                const guestName = sessionStorage.getItem('userName');
                if (guestName) {
                    setAuthStatus('user');
                    setUserName(guestName);
                } else {
                    setAuthStatus('unauthenticated');
                }
            } else {
                // No settings found, assume setup is needed.
                setAuthStatus('setup');
            }
        }
        setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


  const loadData = async () => {
    setIsLoading(true);
    try {
        const [postsRes, meetingsRes, socialLinksRes, mediaAssetsRes, notificationsRes, commentsRes, usersRes] = await Promise.all([
            supabase.from('posts').select('*').order('date', { ascending: false }),
            supabase.from('meetings').select('*').order('date', { ascending: false }),
            supabase.from('settings').select('value').eq('key', 'socialLinks').single(),
            supabase.from('media_assets').select('*').order('created_at', { ascending: false }),
            supabase.from('notifications').select('*').order('timestamp', { ascending: false }),
            supabase.from('comments').select('*').order('created_at', { ascending: true }),
            authStatus === 'admin' ? supabase.from('users').select('*') : { data: [], error: null },
        ]);

        if (postsRes.error) throw postsRes.error;
        if (meetingsRes.error) throw meetingsRes.error;
        if (mediaAssetsRes.error) throw mediaAssetsRes.error;
        if (notificationsRes.error) throw notificationsRes.error;
        if (commentsRes.error) throw commentsRes.error;
        if (usersRes.error) throw usersRes.error;
        // socialLinksRes error is ignored if not found

        setPosts(postsRes.data || []);
        setMeetings(meetingsRes.data || []);
        setSocialLinks(socialLinksRes.data?.value as SocialLinks || { fb: '', insta: '', x: '' });
        setMediaAssets(mediaAssetsRes.data || []);
        setNotifications(notificationsRes.data || []);
        setComments(commentsRes.data || []);
        setUsers(usersRes.data || []);

    } catch (error) {
        console.error("Failed to load portal data from Supabase:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'admin' || authStatus === 'user') {
        loadData();
    }
  }, [authStatus]);
  
  useEffect(() => {
    if (initialArticleId && (authStatus === 'admin' || authStatus === 'user') && posts.length > 0) {
      const post = posts.find(p => p.id === initialArticleId);
      if (post) {
        handleSelectPost(post);
      } else {
        console.warn(`Deep link article with ID ${initialArticleId} not found.`);
      }
      setInitialArticleId(null);
    }
  }, [posts, initialArticleId, authStatus]);

  const refetchData = loadData;

  const navigateToFeed = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setCurrentView('feed');
  };

  const handleCreatePost = async (newPostData: Omit<NewsArticle, 'id' | 'date' | 'views' | 'link_clicks' | 'created_at' | 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // This should ideally not happen since only admins can create posts, but it's a good safeguard.
      throw new Error("User not authenticated. Cannot create post.");
    }
    
    const file = dataURLtoFile(newPostData.featured_media.url, newPostData.featured_media.name);
    const filePath = `public/${uuidv4()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage.from('featured_media').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('featured_media').getPublicUrl(filePath);

    const postToInsert = {
      ...newPostData,
      featured_media: { ...newPostData.featured_media, url: urlData.publicUrl },
      id: uuidv4(),
      user_id: user.id, // Associate post with the creator
      views: 0,
      link_clicks: { fb: 0, insta: 0, x: 0 },
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('posts').insert(postToInsert);
    if (error) throw error;
    
    await refetchData();
    navigateToFeed();
  };

  const handleUpdatePost = async (updatedPost: NewsArticle) => {
    let finalPost = { ...updatedPost };

    // Ensure user_id is present for RLS policies, especially for older data.
    if (!finalPost.user_id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            finalPost.user_id = user.id;
        } else {
            throw new Error("Authentication error: Cannot update post without a user session.");
        }
    }

    // Check if the featured media was changed (it will be a data URL)
    if (updatedPost.featured_media.url.startsWith('data:')) {
        const file = dataURLtoFile(updatedPost.featured_media.url, updatedPost.featured_media.name);
        const filePath = `public/${uuidv4()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage.from('featured_media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('featured_media').getPublicUrl(filePath);
        finalPost.featured_media = { ...updatedPost.featured_media, url: urlData.publicUrl };
    }

    const { error } = await supabase.from('posts').update(finalPost).eq('id', finalPost.id);
    if (error) throw error;

    await refetchData();
    navigateToFeed();
  };

  const handleDeletePost = async (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
    
    const filePath = postToDelete.featured_media.url.split('/featured_media/')[1];
    if (filePath) {
      await supabase.storage.from('featured_media').remove([filePath]);
    }

    await refetchData();
    navigateToFeed();
  };

  const handleSelectPost = async (post: NewsArticle) => {
    const { error } = await supabase.from('posts').update({ views: post.views + 1 }).eq('id', post.id);
    if (error) console.error("Failed to update view count:", error);
    
    setSelectedPost({ ...post, views: post.views + 1 });
    setCurrentView('detail');
    refetchData(); // Update list silently
  };
  
  const handleUpdateLinkClick = async (postId: string, platform: 'fb' | 'insta' | 'x') => {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const newClicks = { ...post.link_clicks, [platform]: post.link_clicks[platform] + 1 };
      const { error } = await supabase.from('posts').update({ link_clicks: newClicks }).eq('id', postId);
      if (error) console.error("Error updating link clicks:", error);
      
      refetchData();
  };
  
  const handleSetupComplete = async (password: string) => {
    setSetupError(null);
    // When setup completes, we sign up the admin user.
    const { data, error } = await supabase.auth.signUp({
        email: 'kartikthakur937@gmail.com',
        password: password,
    });

    if (error) {
        setSetupError(error.message);
        return;
    }

    // After signUp, two things can happen:
    // 1. If email confirmation is disabled, Supabase returns a session, and the user is logged in.
    //    onAuthStateChange will fire and take care of setting the authStatus to 'admin'.
    // 2. If email confirmation is enabled, Supabase returns a user but no session.
    //    We need to manually move to the login screen and show a message.
    if (!data.session && data.user) {
        setLoginError("Account created. Please check your email to confirm, then sign in.");
        setAuthStatus('unauthenticated');
    }
    // If we get a session from signUp, we do nothing here.
    // onAuthStateChange will handle the transition automatically.
  };

  const handleAdminLogin = async (email:string, password: string) => {
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  };
  
   const handleResendConfirmation = async (email: string): Promise<string> => {
        if (email.toLowerCase() !== 'kartikthakur937@gmail.com') {
            return 'Resending is only supported for the kartikthakur937@gmail.com account.';
        }
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) {
            return `Error: ${error.message}`;
        }
        return `A new confirmation link has been sent to ${email}. Check the inbox.`;
    };

  const handleUserSignIn = async (name: string) => {
    setLoginError(null);
    const { data: user, error } = await supabase.from('users').select('*').eq('id', name).single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user status:', error);
        setLoginError('A server error occurred. Please try again.');
        return;
    }
    
    if (user && user.is_blocked) {
        setLoginError('Your access has been blocked by an administrator.');
        return;
    }

    if (!user) {
        const { error: insertError } = await supabase.from('users').insert({ id: name, name: name, is_blocked: false });
        if (insertError) {
            console.error('Error creating user:', insertError);
            setLoginError('A server error occurred. Please try again.');
            return;
        }
    }
    
    sessionStorage.setItem('authStatus', 'user');
    sessionStorage.setItem('userName', name);
    setAuthStatus('user');
    setUserName(name);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setAuthStatus('unauthenticated');
    setUserName('');
    setCurrentView('feed');
  };

  const handleSaveSocials = async (links: SocialLinks) => {
    const { error } = await supabase.from('settings').upsert({ key: 'socialLinks', value: links });
    if (error) throw error;
    await refetchData();
    setCurrentView('feed');
  };

  // Live Stream is local state only, no DB interaction
  const handleLiveStreamStart = (title: string) => setLiveStream({ title, comments: [] });
  const handleLiveStreamEnd = () => setLiveStream(null);
  const handleLiveStreamComment = (text: string) => {
    if (liveStream) {
      const newComment: LiveStreamComment = { id: Date.now(), user: userName, text };
      setLiveStream({ ...liveStream, comments: [...liveStream.comments, newComment] });
    }
  };
  
  const handleAddComment = async (articleId: string, text: string) => {
    const newComment = { article_id: articleId, text, user: userName };
    const { error } = await supabase.from('comments').insert(newComment);
    if (error) throw error;
    await refetchData();
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw error;
    await refetchData();
  };
  
  const handleCreateMeeting = async (meeting: Omit<Meeting, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const meetingToInsert = { 
      ...meeting, 
      id: uuidv4(), 
      user_id: user.id,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('meetings').insert(meetingToInsert);
    if (error) throw error;
    await refetchData();
    setCurrentView(meeting.type === MeetingType.MEETING ? 'meetings' : 'activities');
  };

  const handleUpdateMeeting = async (meeting: Meeting) => {
    const { error } = await supabase.from('meetings').update(meeting).eq('id', meeting.id);
    if (error) throw error;
    await refetchData();
    setCurrentView(meeting.type === MeetingType.MEETING ? 'meetings' : 'activities');
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const { error } = await supabase.from('meetings').delete().eq('id', meetingId);
    if (error) throw error;
    await refetchData();
  };
  
  const handleUploadAsset = async (asset: Omit<MediaAsset, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const file = dataURLtoFile(asset.file.url, asset.file.name);
    const filePath = `public/${uuidv4()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage.from('media_assets').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('media_assets').getPublicUrl(filePath);

    const assetToInsert = {
      ...asset,
      id: uuidv4(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      file: { ...asset.file, url: urlData.publicUrl },
    };
    
    const { error } = await supabase.from('media_assets').insert(assetToInsert);
    if (error) throw error;
    await refetchData();
  };

  const handleDeleteAsset = async (assetId: string) => {
    const assetToDelete = mediaAssets.find(a => a.id === assetId);
    if (!assetToDelete) return;
    
    const { error } = await supabase.from('media_assets').delete().eq('id', assetId);
    if (error) throw error;
    
    const filePath = assetToDelete.file.url.split('/media_assets/')[1];
    if (filePath) {
      await supabase.storage.from('media_assets').remove([filePath]);
    }
    await refetchData();
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    await refetchData();
  };
  
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
    await refetchData();
  };

  const handleToggleUserBlock = async (userId: string, isBlocked: boolean) => {
    const { error } = await supabase.from('users').update({ is_blocked: isBlocked }).eq('id', userId);
    if (error) throw error;
    await refetchData();
  };
  
  const renderContent = () => {
    if (authStatus === 'checking' || (isLoading && (authStatus === 'admin' || authStatus === 'user'))) {
       const SkeletonLoader = () => (
          <div className="container mx-auto px-4 py-8 space-y-8">
              {currentView === 'meetings' || currentView === 'activities' ? (
                  <> <MeetingCardSkeleton /> <MeetingCardSkeleton /> </>
              ) : currentView === 'media-kit' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      <MediaAssetCardSkeleton /> <MediaAssetCardSkeleton /> <MediaAssetCardSkeleton /> <MediaAssetCardSkeleton />
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <NewsCardSkeleton /> <NewsCardSkeleton /> <NewsCardSkeleton />
                  </div>
              )}
          </div>
      );
      return <div className="min-h-screen"><Header {...headerProps} /><SkeletonLoader /><Footer {...footerProps}/></div>;
    }

    if (authStatus === 'setup') {
        return <Setup onSetupComplete={handleSetupComplete} error={setupError} />;
    }

    if (authStatus === 'unauthenticated') {
      return <SignIn onAdminLogin={handleAdminLogin} onUserSignIn={handleUserSignIn} error={loginError} onResendConfirmation={handleResendConfirmation} />;
    }

    let viewComponent;
    switch (currentView) {
      case 'feed':
        viewComponent = <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={(post) => { setEditingPost(post); setCurrentView('manage'); }} onDeletePost={handleDeletePost} userRole={authStatus as UserRole} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={() => setCurrentView('live-user')} />;
        break;
      case 'detail':
        viewComponent = selectedPost ? <NewsDetail post={selectedPost} onBack={navigateToFeed} onEdit={(post) => { setEditingPost(post); setCurrentView('manage'); }} onDelete={handleDeletePost} onLinkClick={handleUpdateLinkClick} userRole={authStatus as UserRole} comments={comments.filter(c => c.article_id === selectedPost.id)} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment}/> : <LoadingSpinner />;
        break;
      case 'manage':
        viewComponent = <ManagePanel onCreatePost={handleCreatePost} onUpdatePost={handleUpdatePost} postToEdit={editingPost} onCancel={navigateToFeed} />;
        break;
      case 'admin':
        viewComponent = <AdminPanel initialLinks={socialLinks} onSaveSocials={handleSaveSocials} onCancel={() => setCurrentView('feed')} users={users} onToggleUserBlock={handleToggleUserBlock} />;
        break;
      case 'live-admin':
        viewComponent = <LiveStreamAdmin onStreamStart={handleLiveStreamStart} onStreamEnd={handleLiveStreamEnd} comments={liveStream?.comments || []} />;
        break;
      case 'live-user':
        viewComponent = liveStream ? <LiveStreamUser title={liveStream.title} comments={liveStream.comments} onAddComment={handleLiveStreamComment} onBack={() => setCurrentView('feed')} /> : <div>Live stream has ended.</div>;
        break;
      case 'meetings':
        viewComponent = <MeetingsActivities meetings={meetings} eventType={MeetingType.MEETING} userRole={authStatus as UserRole} onAddNew={() => { setEditingMeeting(null); setNewMeetingType(MeetingType.MEETING); setMeetingReturnPath('meetings'); setCurrentView('manage-meeting'); }} onEdit={(meeting) => { setEditingMeeting(meeting); setCurrentView('manage-meeting'); }} onDelete={handleDeleteMeeting} />;
        break;
      case 'activities':
        viewComponent = <MeetingsActivities meetings={meetings} eventType={MeetingType.ACTIVITY} userRole={authStatus as UserRole} onAddNew={() => { setEditingMeeting(null); setNewMeetingType(MeetingType.ACTIVITY); setMeetingReturnPath('activities'); setCurrentView('manage-meeting'); }} onEdit={(meeting) => { setEditingMeeting(meeting); setCurrentView('manage-meeting'); }} onDelete={handleDeleteMeeting} />;
        break;
       case 'manage-meeting':
        viewComponent = <ManageMeeting onCreate={handleCreateMeeting} onUpdate={handleUpdateMeeting} meetingToEdit={editingMeeting} newMeetingType={newMeetingType} onCancel={() => setCurrentView(meetingReturnPath)} />;
        break;
      case 'media-kit':
        viewComponent = <MediaKit assets={mediaAssets} userRole={authStatus as UserRole} onUpload={handleUploadAsset} onDelete={handleDeleteAsset} />;
        break;
      default:
        viewComponent = <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={(post) => { setEditingPost(post); setCurrentView('manage'); }} onDeletePost={handleDeletePost} userRole={authStatus as UserRole} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={() => setCurrentView('live-user')} />;
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header {...headerProps}/>
        <main className="flex-grow container mx-auto px-4 py-8">
            {viewComponent}
        </main>
        <div className="pb-16 md:pb-0"> {/* Padding for bottom nav */}
             <Footer {...footerProps} />
        </div>
        <BottomNav 
            currentView={currentView}
            onHomeClick={navigateToFeed}
            onMeetingsClick={() => setCurrentView('meetings')}
            onActivitiesClick={() => setCurrentView('activities')}
            onMediaKitClick={() => setCurrentView('media-kit')}
            onLiveClick={() => setCurrentView(authStatus === 'admin' ? 'live-admin' : 'live-user')}
            isLive={!!liveStream}
            userRole={authStatus as UserRole}
        />
      </div>
    );
  };
  
  const headerProps = {
    onNewPostClick: () => { setEditingPost(null); setCurrentView('manage'); },
    onHomeClick: navigateToFeed,
    onMeetingsClick: () => setCurrentView('meetings'),
    onActivitiesClick: () => setCurrentView('activities'),
    onMediaKitClick: () => setCurrentView('media-kit'),
    userRole: authStatus as UserRole,
    userName: userName,
    onLogout: handleLogout,
    isLive: !!liveStream,
    liveTitle: liveStream?.title,
    onGoLive: () => setCurrentView('live-admin'),
    onJoinLive: () => setCurrentView('live-user'),
    notifications: notifications,
    onNotificationClick: (n: Notification) => {
        handleMarkNotificationAsRead(n.id);
        if (n.type === NotificationType.NEWS) {
            const post = posts.find(p => p.id === n.linkId);
            if (post) handleSelectPost(post);
        }
        // Add navigation for other notification types if needed
    },
    onMarkAllAsRead: handleMarkAllAsRead,
  };

  const footerProps = {
    links: socialLinks,
    onAdminClick: () => setCurrentView('admin'),
    userRole: authStatus as UserRole,
  };

  return <>{renderContent()}</>;
};

export default App;
