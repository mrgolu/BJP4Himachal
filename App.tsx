
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

// --- LocalStorage Helpers for Notification Timestamps ---
const getLastVisitTimestamp = (section: 'feed' | 'meetings' | 'activities'): number => {
    try {
        const timestamp = localStorage.getItem(`lastVisit_${section}`);
        return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
        console.error("Could not read from localStorage", error);
        return 0;
    }
};

const updateLastVisitTimestamp = (section: 'feed' | 'meetings' | 'activities'): void => {
    try {
        localStorage.setItem(`lastVisit_${section}`, Date.now().toString());
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
};


type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting';
export type UserRole = 'admin' | 'user';
type AuthStatus = 'unauthenticated' | UserRole;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  
  const checkNotifications = (allPosts: NewsArticle[], allMeetings: Meeting[]) => {
      if (authStatus === 'admin') return;

      const lastFeedVisit = getLastVisitTimestamp('feed');
      const lastMeetingsVisit = getLastVisitTimestamp('meetings');
      const lastActivitiesVisit = getLastVisitTimestamp('activities');

      const newPost = allPosts.some(post => new Date(post.createdAt).getTime() > lastFeedVisit);
      setHasNewPosts(newPost);

      const newMeeting = allMeetings.some(m => m.type === MeetingType.MEETING && new Date(m.createdAt).getTime() > lastMeetingsVisit);
      setHasNewMeetings(newMeeting);

      const newActivity = allMeetings.some(m => m.type === MeetingType.ACTIVITY && new Date(m.createdAt).getTime() > lastActivitiesVisit);
      setHasNewActivities(newActivity);
  };
  
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [postsRes, meetingsRes, linksRes] = await Promise.all([
                fetch('/api/posts'),
                fetch('/api/meetings'),
                fetch('/api/settings'),
            ]);

            if (!postsRes.ok || !meetingsRes.ok || !linksRes.ok) {
                throw new Error('Failed to fetch initial data');
            }

            const [dbPosts, dbMeetings, dbLinks] = await Promise.all([
                postsRes.json(),
                meetingsRes.json(),
                linksRes.json(),
            ]);
            
            setPosts(dbPosts);
            setMeetings(dbMeetings);
            setSocialLinks(dbLinks);
            
            checkNotifications(dbPosts, dbMeetings);
        } catch (error) {
            console.error("Failed to load portal data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (authStatus !== 'unauthenticated') {
        loadData();
    }
  }, [authStatus]);

  const refetchData = async () => {
      const [postsRes, meetingsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/meetings'),
      ]);
      const [dbPosts, dbMeetings] = await Promise.all([postsRes.json(), meetingsRes.json()]);
      setPosts(dbPosts);
      setMeetings(dbMeetings);
  };

  const navigateToFeed = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setCurrentView('feed');
    if (hasNewPosts) {
      updateLastVisitTimestamp('feed');
      setHasNewPosts(false);
    }
  };

  const handleCreatePost = async (newPostData: Omit<NewsArticle, 'id' | 'date' | 'views' | 'linkClicks' | 'createdAt'>) => {
    await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminSecret}` },
        body: JSON.stringify(newPostData),
    });
    await refetchData();
    navigateToFeed();
  };

  const handleUpdatePost = async (updatedPost: NewsArticle) => {
    await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminSecret}` },
        body: JSON.stringify(updatedPost),
    });
    await refetchData();
    if (selectedPost?.id === updatedPost.id) {
        const post = await (await fetch(`/api/posts?id=${updatedPost.id}`)).json();
        setSelectedPost(post);
    }
    navigateToFeed();
  }

  const handleDeletePost = async (postId: string) => {
    await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminSecret}` },
    });
    const isViewingDeletedPost = currentView === 'detail' && selectedPost?.id === postId;
    await refetchData();
    if (isViewingDeletedPost) {
      navigateToFeed();
    }
  };
  
  const handleIncrementView = async (postId: string) => {
    await fetch(`/api/posts?action=view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId }),
    });
    // Optimistically update to avoid refetch
    setPosts(posts => posts.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p));
    if (selectedPost?.id === postId) {
        setSelectedPost(prev => prev ? { ...prev, views: prev.views + 1 } : null);
    }
  };
  
  const handleIncrementLinkClick = async (postId: string, platform: 'fb' | 'insta' | 'x') => {
    await fetch(`/api/posts?action=click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, platform }),
    });
    // Optimistically update
    setPosts(posts => posts.map(p => p.id === postId ? { ...p, linkClicks: { ...p.linkClicks, [platform]: p.linkClicks[platform] + 1 } } : p));
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
        updateLastVisitTimestamp('meetings');
        setHasNewMeetings(false);
      }
  }
  
  const navigateToActivities = () => {
      setCurrentView('activities');
      if (hasNewActivities) {
        updateLastVisitTimestamp('activities');
        setHasNewActivities(false);
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
    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminSecret}` },
        body: JSON.stringify(links),
    });
    setSocialLinks(links);
    navigateToFeed();
  };

  const handleLogin = async (password: string) => {
    const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });
    if (response.ok) {
      setAdminSecret(password);
      setAuthStatus('admin');
      setLoginError(null);
      setCurrentView('feed');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setAuthStatus('unauthenticated');
    setAdminSecret(null);
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
  
  const handleCreateMeeting = async (newMeetingData: Omit<Meeting, 'id' | 'createdAt'>) => {
    await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminSecret}` },
        body: JSON.stringify(newMeetingData),
    });
    await refetchData();
    setCurrentView(meetingReturnPath);
  };
  
  const handleUpdateMeeting = async (updatedMeeting: Meeting) => {
    await fetch('/api/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminSecret}` },
        body: JSON.stringify(updatedMeeting),
    });
    await refetchData();
    setCurrentView(meetingReturnPath);
  };
  
  const handleDeleteMeeting = async (meetingId: string) => {
    await fetch(`/api/meetings?id=${meetingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminSecret}` },
    });
    await refetchData();
  };

  const onJoinLive = () => {
    if (liveStream) {
        setCurrentView('live-user');
    }
  }

  const renderContent = (userRole: UserRole) => {
    if (isLoading) {
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
