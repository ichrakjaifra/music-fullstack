import { createAction, props } from '@ngrx/store';
import { Track, TrackStats, CreateTrackRequest, UpdateTrackRequest } from '../../models/track.model';

// Load Tracks
export const loadTracks = createAction(
  '[Track] Load Tracks',
  props<{ page?: number; size?: number }>()
);

export const loadTracksSuccess = createAction(
  '[Track] Load Tracks Success',
  props<{ tracks: Track[]; total: number; page: number }>()
);

export const loadTracksFailure = createAction(
  '[Track] Load Tracks Failure',
  props<{ error: string }>()
);

// Search Tracks
export const searchTracks = createAction(
  '[Track] Search Tracks',
  props<{ query: string; page?: number; size?: number }>()
);

export const searchTracksSuccess = createAction(
  '[Track] Search Tracks Success',
  props<{ tracks: Track[]; total: number; page: number }>()
);

export const searchTracksFailure = createAction(
  '[Track] Search Tracks Failure',
  props<{ error: string }>()
);

// Get Track by ID
export const loadTrack = createAction(
  '[Track] Load Track',
  props<{ id: string }>()
);

export const loadTrackSuccess = createAction(
  '[Track] Load Track Success',
  props<{ track: Track }>()
);

export const loadTrackFailure = createAction(
  '[Track] Load Track Failure',
  props<{ error: string }>()
);

// Create Track
export const createTrack = createAction(
  '[Track] Create Track',
  props<{
    trackData: CreateTrackRequest;
    audioFile: File;
    imageFile?: File;
  }>()
);

export const createTrackSuccess = createAction(
  '[Track] Create Track Success',
  props<{ track: Track }>()
);

export const createTrackFailure = createAction(
  '[Track] Create Track Failure',
  props<{ error: string }>()
);

// Update Track
export const updateTrack = createAction(
  '[Track] Update Track',
  props<{ id: string; trackData: UpdateTrackRequest }>()
);

export const updateTrackSuccess = createAction(
  '[Track] Update Track Success',
  props<{ track: Track }>()
);

export const updateTrackFailure = createAction(
  '[Track] Update Track Failure',
  props<{ error: string }>()
);

// Delete Track
export const deleteTrack = createAction(
  '[Track] Delete Track',
  props<{ id: string }>()
);

export const deleteTrackSuccess = createAction(
  '[Track] Delete Track Success',
  props<{ id: string }>()
);

export const deleteTrackFailure = createAction(
  '[Track] Delete Track Failure',
  props<{ error: string }>()
);

// Like Track
export const likeTrack = createAction(
  '[Track] Like Track',
  props<{ id: string }>()
);

export const likeTrackSuccess = createAction(
  '[Track] Like Track Success',
  props<{ track: Track }>()
);

export const likeTrackFailure = createAction(
  '[Track] Like Track Failure',
  props<{ error: string }>()
);

// Increment Plays
export const incrementPlays = createAction(
  '[Track] Increment Plays',
  props<{ id: string }>()
);

export const incrementPlaysSuccess = createAction(
  '[Track] Increment Plays Success',
  props<{ track: Track }>()
);

export const incrementPlaysFailure = createAction(
  '[Track] Increment Plays Failure',
  props<{ error: string }>()
);

// Load Stats
export const loadTrackStats = createAction(
  '[Track] Load Stats'
);

export const loadTrackStatsSuccess = createAction(
  '[Track] Load Stats Success',
  props<{ stats: TrackStats }>()
);

export const loadTrackStatsFailure = createAction(
  '[Track] Load Stats Failure',
  props<{ error: string }>()
);

// Load Category Stats
export const loadCategoryStats = createAction(
  '[Track] Load Category Stats'
);

export const loadCategoryStatsSuccess = createAction(
  '[Track] Load Category Stats Success',
  props<{ categoryStats: Record<string, number> }>()
);

export const loadCategoryStatsFailure = createAction(
  '[Track] Load Category Stats Failure',
  props<{ error: string }>()
);

// Filter Tracks
export const filterTracksByCategory = createAction(
  '[Track] Filter By Category',
  props<{ category: string; page?: number; size?: number }>()
);

export const filterTracksByCategorySuccess = createAction(
  '[Track] Filter By Category Success',
  props<{ tracks: Track[]; total: number; page: number }>()
);

export const filterTracksByCategoryFailure = createAction(
  '[Track] Filter By Category Failure',
  props<{ error: string }>()
);

// Load Most Played
export const loadMostPlayed = createAction(
  '[Track] Load Most Played',
  props<{ limit: number }>()
);

export const loadMostPlayedSuccess = createAction(
  '[Track] Load Most Played Success',
  props<{ tracks: Track[] }>()
);

export const loadMostPlayedFailure = createAction(
  '[Track] Load Most Played Failure',
  props<{ error: string }>()
);

// Load Most Liked
export const loadMostLiked = createAction(
  '[Track] Load Most Liked',
  props<{ limit: number }>()
);

export const loadMostLikedSuccess = createAction(
  '[Track] Load Most Liked Success',
  props<{ tracks: Track[] }>()
);

export const loadMostLikedFailure = createAction(
  '[Track] Load Most Liked Failure',
  props<{ error: string }>()
);

// Load Recent Tracks
export const loadRecentTracks = createAction(
  '[Track] Load Recent Tracks',
  props<{ limit: number }>()
);

export const loadRecentTracksSuccess = createAction(
  '[Track] Load Recent Tracks Success',
  props<{ tracks: Track[] }>()
);

export const loadRecentTracksFailure = createAction(
  '[Track] Load Recent Tracks Failure',
  props<{ error: string }>()
);

// Reset State
export const resetTrackState = createAction('[Track] Reset State');
