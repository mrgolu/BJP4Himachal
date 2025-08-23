import React, { useState } from 'react';
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


type View = 'feed' | 'manage' | 'detail' | 'admin' | 'live-admin' | 'live-user' | 'meetings' | 'activities' | 'manage-meeting';
export type UserRole = 'admin' | 'user';
type AuthStatus = 'unauthenticated' | UserRole;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('feed');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [liveStream, setLiveStream] = useState<{ title: string; comments: Comment[] } | null>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    fb: 'https://www.facebook.com/BJP4Himachal/',
    insta: 'https://www.instagram.com/bjp4himachal/',
    x: 'https://x.com/BJP4Himachal'
  });
  const [posts, setPosts] = useState<NewsArticle[]>([
    {
      id: '3',
      title: 'राज्यसभा सांसद डॉ. सिकंदर कुमार जी ने संसद में प्लास्टिक अपशिष्ट प्रदूषण के विषय को प्रमुखता से रखा।',
      content: 'साथ ही उन्होंने केंद्र सरकार से आग्रह किया कि इस संकट से निपटने हेतु और भी कड़े कदम व कठोर नियम बनाए जाएं, ताकि आने वाली पीढ़ियों को इसके दुष्परिणामों से बचाया जा सके।',
      featuredMedia: {
        url: 'https://picsum.photos/seed/parliament1/800/600',
        type: 'image',
        name: 'parliament-sikandar-kumar.jpg',
        mimeType: 'image/jpeg',
      },
      category: NewsCategory.PARTY_ACTIVITIES,
      date: new Date().toISOString(),
      views: 102,
      linkClicks: { fb: 12, insta: 5, x: 9 },
      socials: {
        fb: 'https://www.facebook.com/share/r/1BJTQncNFJ/',
        insta: 'https://www.instagram.com/reel/DNnLD_8ht_Y/?igsh=M2FkbjVtdzV5Zjcy',
        x: 'https://x.com/BJP4Himachal/status/1958461746160508985',
      },
    },
    {
      id: '1',
      title: 'Chief Minister inaugurates new development projects in Shimla',
      content: 'Today, the Honorable Chief Minister of Himachal Pradesh, in a grand ceremony, inaugurated several key infrastructure projects in Shimla. These projects, including a new flyover and a water treatment plant, are expected to to significantly improve the quality of life for the residents. The Chief Minister emphasized the government\'s commitment to the state\'s progress and thanked the public for their continuous support. He stated, "Our government is dedicated to Sabka Saath, Sabka Vikas, and these projects are a testament to our resolve to build a prosperous Himachal Pradesh."',
      featuredMedia: {
        url: 'https://picsum.photos/seed/himachal1/800/600',
        type: 'image',
        name: 'shimla-development.jpg',
        mimeType: 'image/jpeg',
      },
      category: NewsCategory.STATE,
      date: new Date(Date.now() - 86400000).toISOString(),
      views: 1543,
      linkClicks: { fb: 0, insta: 0, x: 0 },
    },
    {
      id: '2',
      title: 'Successful "Swachh Bharat" campaign organized in Mandi',
      content: 'A massive cleanliness drive was organized in Mandi under the "Swachh Bharat Abhiyan". Party workers and local citizens participated with great enthusiasm, cleaning public spaces, riversides, and markets. The event was a huge success, promoting awareness about cleanliness and sanitation. Local party leaders addressed the volunteers, highlighting Prime Minister Narendra Modi\'s vision of a clean India and urging everyone to make it a daily habit.',
      featuredMedia: {
        url: 'https://picsum.photos/seed/himachal2/800/600',
        type: 'image',
        name: 'swachh-bharat-mandi.jpg',
        mimeType: 'image/jpeg',
      },
      category: NewsCategory.PARTY_ACTIVITIES,
      date: new Date(Date.now() - 172800000).toISOString(),
      views: 876,
      linkClicks: { fb: 0, insta: 0, x: 0 },
    },
  ]);
  const [selectedPost, setSelectedPost] = useState<NewsArticle | null>(null);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingReturnPath, setMeetingReturnPath] = useState<View>('meetings');
  const [newMeetingType, setNewMeetingType] = useState<MeetingType>(MeetingType.MEETING);

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 'm4',
      title: 'भाजपा आई टी विभाग की बैठक (BJP IT Department Meeting)',
      type: MeetingType.MEETING,
      date: new Date('2025-03-28T18:00:00').toISOString(),
      location: 'Online via Webex',
      description: 'A meeting for the IT department has been called by the BJP IT State Convener, Shri Anil Dadwal ji, with special guidance from State Vice President, Shri Sanjeev Katwal ji. The main topic is the \'Mann Ki Baat\' program.\n\nMeeting Number: 25169153957\nPassword: 12345',
      link: 'https://ithpbjp.webex.com/ithpbjp/j.php?MTID=m0c337f33ba9997b8aa350dfd31c2eb6d',
      invited: [
          'आई टी प्रदेश सह संयोजक',
          'आई टी  प्रदेश कार्यसमिति सदस्य',
          'आई टी  संसदीय क्षेत्र  प्रभारी एवं सह प्रभारी',
          'आई टी जिला संयोजक',
          'आई टी मंडल संयोजक'
      ],
    },
    {
      id: 'm1',
      title: 'District Karyakarini Baithak',
      type: MeetingType.MEETING,
      date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      location: 'BJP Office, Shimla',
      description: 'Monthly review meeting for all district-level office bearers. Agenda includes planning for the upcoming state-wide campaign and review of recent activities.',
      link: 'https://meet.google.com/lookup/h4g5x6y7z8',
      invited: ['All district-level office bearers'],
    },
    {
      id: 'm2',
      title: 'Blood Donation Camp',
      type: MeetingType.ACTIVITY,
      date: new Date(Date.now() + 86400000 * 12).toISOString(), // 12 days from now
      location: 'Community Hall, Mandi',
      description: 'A public blood donation camp organized by the party\'s youth wing. All are welcome to participate and contribute to this noble cause.',
      invited: ['Party youth wing members', 'General public'],
    },
    {
      id: 'm3',
      title: 'State Executive Meeting',
      type: MeetingType.MEETING,
      date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      location: 'Hotel Peterhoff, Shimla',
      description: 'Quarterly state executive meeting to discuss policy matters and organizational strategy. Chaired by the State President.',
      invited: ['State executive members', 'Special invitees'],
    },
]);

  const navigateToFeed = () => {
    setSelectedPost(null);
    setEditingPost(null);
    setCurrentView('feed');
  };

  const handleCreatePost = (newPost: Omit<NewsArticle, 'id' | 'date' | 'views' | 'linkClicks'>) => {
    setPosts(prevPosts => [
      {
        ...newPost,
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
        views: 0,
        linkClicks: { fb: 0, insta: 0, x: 0 },
      },
      ...prevPosts,
    ]);
    navigateToFeed();
  };

  const handleUpdatePost = (updatedPost: NewsArticle) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
    navigateToFeed();
  }

  const handleDeletePost = (postId: string) => {
    const isViewingDeletedPost = currentView === 'detail' && selectedPost?.id === postId;
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
    if (isViewingDeletedPost) {
      navigateToFeed();
    }
  };
  
  const handleIncrementView = (postId: string) => {
    setPosts(posts => posts.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p));
  };
  
  const handleIncrementLinkClick = (postId: string, platform: 'fb' | 'insta' | 'x') => {
      setPosts(posts => posts.map(p => {
          if (p.id === postId) {
              return {
                  ...p,
                  linkClicks: {
                      ...p.linkClicks,
                      [platform]: p.linkClicks[platform] + 1,
                  }
              }
          }
          return p;
      }));
  }

  const handleStartEdit = (post: NewsArticle) => {
    setEditingPost(post);
    setCurrentView('manage');
  }

  const handleSelectPost = (post: NewsArticle) => {
    handleIncrementView(post.id);
    setSelectedPost(prev => posts.find(p => p.id === post.id) || null);
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

  const handleSaveSocialLinks = (links: SocialLinks) => {
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
  
  const handleCreateMeeting = (newMeetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...newMeetingData,
      id: `m-${new Date().getTime()}`,
    };
    setMeetings(prev => [newMeeting, ...prev]);
    setCurrentView(meetingReturnPath);
  };
  
  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
    setCurrentView(meetingReturnPath);
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  const onJoinLive = () => {
    if (liveStream) {
        setCurrentView('live-user');
    }
  }

  const renderContent = (userRole: UserRole) => {
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
      />
    </div>
  );
};

export default App;