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
  featuredMedia: FeaturedMedia;
  category: NewsCategory;
  date: string;
  views: number;
  linkClicks: {
    fb: number;
    insta: number;
    x: number;
  };
  socials?: {
    fb?: string;
    insta?: string;
    x?: string;
  };
}

export interface SocialLinks {
  fb: string;
  insta: string;
  x: string;
}

export interface Comment {
  id: number;
  user: 'Admin' | 'Guest';
  text: string;
}