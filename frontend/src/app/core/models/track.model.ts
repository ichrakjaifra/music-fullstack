export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string;
  duration: number;
  category: MusicCategory;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  coverImage?: string;
  coverColor?: string;
  plays: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum MusicCategory {
  POP = 'POP',
  ROCK = 'ROCK',
  RAP = 'RAP',
  JAZZ = 'JAZZ',
  CLASSICAL = 'CLASSICAL',
  ELECTRONIC = 'ELECTRONIC',
  HIPHOP = 'HIPHOP',
  RNB = 'RNB',
  COUNTRY = 'COUNTRY',
  REGGAE = 'REGGAE',
  METAL = 'METAL',
  BLUES = 'BLUES',
  FOLK = 'FOLK'
}

export interface CreateTrackRequest {
  title: string;
  artist: string;
  description?: string;
  category: MusicCategory;
}

export interface UpdateTrackRequest {
  title: string;
  artist: string;
  description?: string;
  category: MusicCategory;
}

export interface TrackStats {
  totalTracks: number;
  totalDuration: number;
  totalPlays: number;
  totalLikes: number;
}
