
import { openDB, type DBSchema } from 'idb';
import type { NewsArticle, Meeting, SocialLinks } from './types';
import { NewsCategory, MeetingType } from './types';

const DB_NAME = 'bjp-hp-news-db';
const DB_VERSION = 1;
const NEWS_STORE = 'news';
const MEETINGS_STORE = 'meetings';
const SETTINGS_STORE = 'settings';

interface AppDB extends DBSchema {
  [NEWS_STORE]: {
    key: string;
    value: NewsArticle;
  };
  [MEETINGS_STORE]: {
    key: string;
    value: Meeting;
  };
  [SETTINGS_STORE]: {
    key: string;
    value: any;
  };
}

const initialPosts: NewsArticle[] = [
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
];

const initialMeetings: Meeting[] = [
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
];

const initialSocialLinks: SocialLinks = {
    fb: 'https://www.facebook.com/BJP4Himachal/',
    insta: 'https://www.instagram.com/bjp4himachal/',
    x: 'https://x.com/BJP4Himachal'
};

const dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    if (!db.objectStoreNames.contains(NEWS_STORE)) {
      db.createObjectStore(NEWS_STORE, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(MEETINGS_STORE)) {
      db.createObjectStore(MEETINGS_STORE, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
      db.createObjectStore(SETTINGS_STORE);
    }
  },
});

export const initDB = async () => {
  const db = await dbPromise;
  const tx = db.transaction([NEWS_STORE, MEETINGS_STORE, SETTINGS_STORE], 'readwrite');
  
  const newsCount = await tx.objectStore(NEWS_STORE).count();
  if (newsCount === 0) {
    initialPosts.forEach(post => tx.objectStore(NEWS_STORE).add(post));
  }

  const meetingsCount = await tx.objectStore(MEETINGS_STORE).count();
  if (meetingsCount === 0) {
    initialMeetings.forEach(meeting => tx.objectStore(MEETINGS_STORE).add(meeting));
  }

  const socialLinks = await tx.objectStore(SETTINGS_STORE).get('socialLinks');
  if (!socialLinks) {
    tx.objectStore(SETTINGS_STORE).put(initialSocialLinks, 'socialLinks');
  }

  await tx.done;
};


// News Article Functions
export const getNewsArticles = async (): Promise<NewsArticle[]> => {
  return (await dbPromise).getAll(NEWS_STORE);
};

export const addNewsArticle = async (postData: Omit<NewsArticle, 'id' | 'date' | 'views' | 'linkClicks'>): Promise<NewsArticle> => {
  const newPost: NewsArticle = {
    ...postData,
    id: new Date().getTime().toString(),
    date: new Date().toISOString(),
    views: 0,
    linkClicks: { fb: 0, insta: 0, x: 0 },
  };
  await (await dbPromise).add(NEWS_STORE, newPost);
  return newPost;
};

export const updateNewsArticle = async (post: NewsArticle): Promise<void> => {
  await (await dbPromise).put(NEWS_STORE, post);
};

export const deleteNewsArticle = async (id: string): Promise<void> => {
  await (await dbPromise).delete(NEWS_STORE, id);
};

// Meeting Functions
export const getMeetings = async (): Promise<Meeting[]> => {
  return (await dbPromise).getAll(MEETINGS_STORE);
};

export const addMeeting = async (meetingData: Omit<Meeting, 'id'>): Promise<Meeting> => {
  const newMeeting: Meeting = {
    ...meetingData,
    id: `m-${new Date().getTime()}`,
  };
  await (await dbPromise).add(MEETINGS_STORE, newMeeting);
  return newMeeting;
};

export const updateMeeting = async (meeting: Meeting): Promise<void> => {
  await (await dbPromise).put(MEETINGS_STORE, meeting);
};

export const deleteMeeting = async (id: string): Promise<void> => {
  await (await dbPromise).delete(MEETINGS_STORE, id);
};

// Settings Functions
export const getSocialLinks = async (): Promise<SocialLinks> => {
  const links = await (await dbPromise).get(SETTINGS_STORE, 'socialLinks');
  return links || { fb: '', insta: '', x: '' };
};

export const saveSocialLinks = async (links: SocialLinks): Promise<void> => {
  await (await dbPromise).put(SETTINGS_STORE, links, 'socialLinks');
};
