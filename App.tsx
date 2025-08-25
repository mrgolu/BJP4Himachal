
import React, { useState, useEffect } from 'react';
import type { NewsArticle, SocialLinks, Comment, Meeting } from './types';
import { NewsCategory, MeetingType } from './types';
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
import { 
  initDB, 
  getNewsArticles, 
  addNewsArticle, 
  updateNewsArticle, 
  deleteNewsArticle,
  getMeetings,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  getSocialLinks,
  saveSocialLinks,
  getLastVisitTimestamp,
  updateLastVisitTimestamp
} from './db';


type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting';
export type UserRole = 'admin' | 'user';
type AuthStatus = 'unauthenticated' | UserRole;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  const [liveStream, setLiveStream] = useState<{ title: string; comments: Comment[] } | null>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ fb: '', insta: '', x: '' });
  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [hasNewMeetings, setHasNewMeetings] = useState(false);
  const [hasNewActivities, setHasNewActivities] = useState(false);

  const [selectedPost, setSelectedPost] = useState<NewsArticle | null>(null);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingReturnPath, setMeetingReturnPath] = useState<View>('meetings');
  const [newMeetingType, setNewMeetingType] = useState<MeetingType>(MeetingType.MEETING);
  
  const checkNotifications = async (allPosts: NewsArticle[], allMeetings: Meeting[]) => {
      if (authStatus === 'admin') return; // Don't show notifications for admin

      const [lastFeedVisit, lastMeetingsVisit, lastActivitiesVisit] = await Promise.all([
          getLastVisitTimestamp('feed'),
          getLastVisitTimestamp('meetings'),
          getLastVisitTimestamp('activities'),
      ]);

      const newPost = allPosts.some(post => {
          // Assuming post.id can be parsed as a number (timestamp)
          const postIdTimestamp = parseInt(post.id, 10);
          return !isNaN(postIdTimestamp) && postIdTimestamp > lastFeedVisit;
      });
      setHasNewPosts(newPost);

      const newMeeting = allMeetings.some(m => m.type === MeetingType.MEETING && parseInt(m.id.split('-')[1]) > lastMeetingsVisit);
      setHasNewMeetings(newMeeting);

      const newActivity = allMeetings.some(m => m.type === MeetingType.ACTIVITY && parseInt(m.id.split('-')[1]) > lastActivitiesVisit);
      setHasNewActivities(newActivity);
  };
  
  useEffect(() => {
    const initializeData = async () => {
      await initDB();
      const [dbPosts, dbMeetings, dbLinks] = await Promise.all([
        getNewsArticles(),
        getMeetings(),
        getSocialLinks(),
      ]);
      const sortedPosts = dbPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(sortedPosts);
      setMeetings(dbMeetings);
      setSocialLinks(dbLinks);
      setIsDbInitialized(true);
      
      checkNotifications(sortedPosts, dbMeetings);
    };
    initializeData();
  }, [authStatus]);


  const navigateToFeed = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setCurrentView('feed');
    if (hasNewPosts) {
      updateLastVisitTimestamp('feed').then(() => setHasNewPosts(false));
    }
  };

  const handleCreatePost = async (newPostData: Omit<NewsArticle, 'id' | 'date' | 'views' | 'linkClicks'>) => {
    const newPost = await addNewsArticle(newPostData);
    setPosts(prevPosts => [newPost, ...prevPosts]);
    navigateToFeed();
  };

  const handleUpdatePost = async (updatedPost: NewsArticle) => {
    await updateNewsArticle(updatedPost);
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
    if (selectedPost?.id === updatedPost.id) {
        setSelectedPost(updatedPost);
    }
    navigateToFeed();
  }

  const handleDeletePost = async (postId: string) => {
    await deleteNewsArticle(postId);
    const isViewingDeletedPost = currentView === 'detail' && selectedPost?.id === postId;
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    if (isViewingDeletedPost) {
      navigateToFeed();
    }
  };
  
  const handleIncrementView = async (postId: string) => {
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate) {
        const updatedPost = { ...postToUpdate, views: postToUpdate.views + 1 };
        await updateNewsArticle(updatedPost);
        setPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
        if (selectedPost?.id === postId) {
            setSelectedPost(updatedPost);
        }
    }
  };
  
  const handleIncrementLinkClick = async (postId: string, platform: 'fb' | 'insta' | 'x') => {
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate) {
        const updatedPost = {
            ...postToUpdate,
            linkClicks: {
                ...postToUpdate.linkClicks,
                [platform]: postToUpdate.linkClicks[platform] + 1,
            }
        };
        await updateNewsArticle(updatedPost);
        setPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
    }
  }

  const handleStartEdit = (post: NewsArticle) => {
    setEditingPost(post);
    setCurrentView('manage');
  }

  const handleSelectPost = (post: NewsArticle) => {
    handleIncrementView(post.id);
    setSelectedPost(posts.find(p => p.id === post.id) || null);
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
      if (hasNewMeetings) {
        updateLastVisitTimestamp('meetings').then(() => setHasNewMeetings(false));
      }
  }
  
  const navigateToActivities = () => {
      setCurrentView('activities');
      if (hasNewActivities) {
        updateLastVisitTimestamp('activities').then(() => setHasNewActivities(false));
      }
  }

  const navigateToManageMeeting = (meeting: Meeting | null) => {
    if (currentView === 'meetings' || currentView === 'activities') {
      setMeetingReturnPath(currentView);
    }
    if (!meeting) { // This is a new event
      setNewMeetingType(currentView === 'meetings' ? MeetingType.MEETING : MeetingType.ACTIVITY);
    }
    setEditingMeeting(meeting);
    setCurrentView('manage-meeting');
  };

  const handleSaveSocialLinks = async (links: SocialLinks) => {
    await saveSocialLinks(links);
    setSocialLinks(links);
    navigateToFeed();
  };

  const handleLogin = (password: string) => {
    if (password === 'bjp4hp') {
      setAuthStatus('admin');
      setLoginError(null);
      setCurrentView('feed');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setAuthStatus('unauthenticated');
    setCurrentView('feed');
  };

  const handleContinueAsGuest = () => {
    setAuthStatus('user');
    setCurrentView('feed');
  };

  const handleStartStream = (title: string) => {
    setLiveStream({
      title,
      comments: [{
        id: Date.now(),
        user: 'Admin',
        text: 'Welcome to the live stream!'
      }]
    });
    setCurrentView('live-admin');
  };

  const handleEndStream = () => {
    setLiveStream(null);
    setCurrentView('feed');
  };

  const handleAddComment = (text: string) => {
    if (!liveStream) return;
    const newComment: Comment = {
      id: Date.now(),
      user: authStatus === 'admin' ? 'Admin' : 'Guest',
      text
    };
    setLiveStream(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
  };
  
  const handleCreateMeeting = async (newMeetingData: Omit<Meeting, 'id'>) => {
    const newMeeting = await addMeeting(newMeetingData);
    setMeetings(prev => [newMeeting, ...prev]);
    setCurrentView(meetingReturnPath);
  };
  
  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    await updateMeeting(updatedMeeting);
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
    setCurrentView(meetingReturnPath);
  };
  
  const handleDeleteMeeting = async (meetingId: string) => {
    await deleteMeeting(meetingId);
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  const onJoinLive = () => {
    if (liveStream) {
        setCurrentView('live-user');
    }
  }

  const renderContent = (userRole: UserRole) => {
    if (!isDbInitialized) {
        return <div className="flex justify-center items-center h-64"><p>Loading data...</p></div>
    }
    const postForDetailView = posts.find(p => p.id === selectedPost?.id)
    switch (currentView) {
      case 'manage-meeting':
        return <ManageMeeting
            onCreate={handleCreateMeeting}
            onUpdate={handleUpdateMeeting}
            meetingToEdit={editingMeeting}
            newMeetingType={newMeetingType}
            onCancel={() => setCurrentView(meetingReturnPath)}
        />
      case 'meetings':
        return <MeetingsActivities
          meetings={meetings}
          eventType={MeetingType.MEETING}
          userRole={userRole}
          onAddNew={() => navigateToManageMeeting(null)}
          onEdit={navigateToManageMeeting}
          onDelete={handleDeleteMeeting}
        />
      case 'activities':
        return <MeetingsActivities
          meetings={meetings}
          eventType={MeetingType.ACTIVITY}
          userRole={userRole}
          onAddNew={() => navigateToManageMeeting(null)}
          onEdit={navigateToManageMeeting}
          onDelete={handleDeleteMeeting}
        />
      case 'live-admin':
        return <LiveStreamAdmin 
                  onStreamEnd={handleEndStream} 
                  onStreamStart={handleStartStream}
                  comments={liveStream?.comments || []}
                />
      case 'live-user':
        return liveStream ? <LiveStreamUser 
                  title={liveStream.title} 
                  comments={liveStream.comments}
                  onAddComment={handleAddComment}
                  onBack={navigateToFeed}
                /> : null;
      case 'manage':
        return <ManagePanel 
            onCreatePost={handleCreatePost} 
            onUpdatePost={handleUpdatePost}
            postToEdit={editingPost}
            onCancel={navigateToFeed} 
        />
      case 'detail':
        return postForDetailView ? <NewsDetail post={postForDetailView} onBack={navigateToFeed} onEdit={handleStartEdit} onDelete={handleDeletePost} onLinkClick={handleIncrementLinkClick} userRole={userRole} /> : null;
      case 'admin':
        return <AdminPanel initialLinks={socialLinks} onSave={handleSaveSocialLinks} onCancel={navigateToFeed} />
      case 'feed':
      default:
        return <NewsFeed posts={posts} onSelectPost={handleSelectPost} onEditPost={handleStartEdit} onDeletePost={handleDeletePost} userRole={userRole} isLive={!!liveStream} liveTitle={liveStream?.title} onJoinLive={() => setCurrentView('live-user')} />;
    }
  };

  if (authStatus === 'unauthenticated') {
    return (
      <SignIn
        onAdminLogin={handleLogin}
        onGuestContinue={handleContinueAsGuest}
        error={loginError}
      />
    );
  }

  const userRole = authStatus;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header 
        onNewPostClick={navigateToManage} 
        onHomeClick={navigateToFeed} 
        onMeetingsClick={navigateToMeetings}
        onActivitiesClick={navigateToActivities}
        userRole={userRole} 
        onLogout={handleLogout} 
        isLive={!!liveStream}
        liveTitle={liveStream?.title}
        onGoLive={() => setCurrentView('live-admin')}
        onJoinLive={onJoinLive}
        hasNewPosts={hasNewPosts}
        hasNewMeetings={hasNewMeetings}
        hasNewActivities={hasNewActivities}
      />
      <main className="container mx-auto p-4 md:p-8 flex-grow pb-20 md:pb-0">
        {renderContent(userRole)}
      </main>
      <Footer links={socialLinks} onAdminClick={navigateToAdmin} userRole={userRole} />
      <BottomNav
        currentView={currentView}
        onHomeClick={navigateToFeed}
        onMeetingsClick={navigateToMeetings}
        onActivitiesClick={navigateToActivities}
        onLiveClick={onJoinLive}
        isLive={!!liveStream}
        hasNewPosts={hasNewPosts}
        hasNewMeetings={hasNewMeetings}
        hasNewActivities={hasNewActivities}
      />
    </div>
  );
};

export default App;
