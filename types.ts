
export enum NewsCategory {
  STATE = 'State News',
  NATIONAL = 'National News',
  LOCAL_EVENTS = 'Local Events',
  GOVERNMENT_SCHEMES = 'Government Schemes',
  PARTY_ACTIVITIES = 'Party Activities',
}

export interface FeaturedMedia {
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  mimeType: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  featured_media: FeaturedMedia;
  category: NewsCategory;
  date: string;
  views: number;
  link_clicks: {
    fb: number;
    insta: number;
    x: number;
  };
  socials?: {
    fb?: string;
    insta?: string;
    x?: string;
  };
  created_at: string;
}

export interface SocialLinks {
  fb: string;
  insta: string;
  x: string;
}

export interface Comment {
  id: number;
  user: string;
  text: string;
}

export enum MeetingType {
  MEETING = 'Meeting',
  ACTIVITY = 'Activity',
}

export interface Meeting {
  id:string;
  title: string;
  type: MeetingType;
  date: string; // ISO string for date and time
  location: string;
  description: string;
  link?: string;
  invited?: string[];
  created_at: string;
}

export enum MediaAssetCategory {
  LOGO = 'Logos',
  BANNER = 'Banners',
  LEADER_PHOTOS = 'Leader Photos',
  EVENT_TEMPLATES = 'Event Templates',
  GENERAL = 'General',
}

export interface MediaAsset {
  id: string;
  title: string;
  description?: string;
  category: MediaAssetCategory;
  file: {
    url: string;
    name: string;
    mimeType: string;
  };
  created_at: string;
}

export enum NotificationType {
  NEWS = 'news',
  MEETING = 'meeting',
  ACTIVITY = 'activity',
  LIVE = 'live',
}

export interface Notification {
  id: string;
  text: string;
  type: NotificationType;
  linkId: string;
  timestamp: string;
  read: boolean;
}
