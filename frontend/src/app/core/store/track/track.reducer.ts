import { createReducer, on } from '@ngrx/store';
import * as TrackActions from './track.actions';
import { Track } from '../../models/track.model';
import { TrackStats } from '../../models/track.model';

export interface TrackState {
  tracks: Track[];
  currentTrack: Track | null;
  filteredTracks: Track[];
  selectedTracks: string[];

  stats: TrackStats | null;
  categoryStats: Record<string, number> | null;

  mostPlayed: Track[];
  mostLiked: Track[];
  recentTracks: Track[];

  loading: boolean;
  loadingStats: boolean;
  loadingCategoryStats: boolean;

  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;

  searchQuery: string;
  selectedCategory: string;
}

export const initialState: TrackState = {
  tracks: [],
  currentTrack: null,
  filteredTracks: [],
  selectedTracks: [],

  stats: null,
  categoryStats: null,

  mostPlayed: [],
  mostLiked: [],
  recentTracks: [],

  loading: false,
  loadingStats: false,
  loadingCategoryStats: false,

  error: null,
  currentPage: 0,
  totalPages: 0,
  pageSize: 20,
  totalElements: 0,

  searchQuery: '',
  selectedCategory: 'all'
};

export const trackReducer = createReducer(
  initialState,

  // Load Tracks
  on(TrackActions.loadTracks, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.loadTracksSuccess, (state, { tracks, total, page }) => ({
    ...state,
    tracks: tracks,
    filteredTracks: tracks,
    loading: false,
    currentPage: page,
    totalElements: total,
    totalPages: Math.ceil(total / state.pageSize),
    searchQuery: '',
    selectedCategory: 'all'
  })),

  on(TrackActions.loadTracksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Search Tracks
  on(TrackActions.searchTracks, (state, { query }) => ({
    ...state,
    loading: true,
    searchQuery: query,
    selectedCategory: 'all',
    error: null
  })),

  on(TrackActions.searchTracksSuccess, (state, { tracks, total, page }) => ({
    ...state,
    filteredTracks: tracks,
    loading: false,
    currentPage: page,
    totalElements: total,
    totalPages: Math.ceil(total / state.pageSize)
  })),

  on(TrackActions.searchTracksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Track by ID
  on(TrackActions.loadTrack, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.loadTrackSuccess, (state, { track }) => ({
    ...state,
    currentTrack: track,
    loading: false
  })),

  on(TrackActions.loadTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Track
  on(TrackActions.createTrack, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.createTrackSuccess, (state, { track }) => ({
    ...state,
    tracks: [...state.tracks, track],
    filteredTracks: [...state.filteredTracks, track],
    loading: false,
    totalElements: state.totalElements + 1
  })),

  on(TrackActions.createTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Track
  on(TrackActions.updateTrack, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.updateTrackSuccess, (state, { track }) => ({
    ...state,
    tracks: state.tracks.map(t => t.id === track.id ? track : t),
    filteredTracks: state.filteredTracks.map(t => t.id === track.id ? track : t),
    currentTrack: state.currentTrack?.id === track.id ? track : state.currentTrack,
    loading: false
  })),

  on(TrackActions.updateTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Track
  on(TrackActions.deleteTrack, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.deleteTrackSuccess, (state, { id }) => ({
    ...state,
    tracks: state.tracks.filter(track => track.id !== id),
    filteredTracks: state.filteredTracks.filter(track => track.id !== id),
    selectedTracks: state.selectedTracks.filter(trackId => trackId !== id),
    loading: false,
    totalElements: Math.max(0, state.totalElements - 1)
  })),

  on(TrackActions.deleteTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Like Track
  on(TrackActions.likeTrack, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.likeTrackSuccess, (state, { track }) => ({
    ...state,
    tracks: state.tracks.map(t => t.id === track.id ? track : t),
    filteredTracks: state.filteredTracks.map(t => t.id === track.id ? track : t),
    currentTrack: state.currentTrack?.id === track.id ? track : state.currentTrack,
    mostLiked: state.mostLiked.map(t => t.id === track.id ? track : t),
    loading: false
  })),

  on(TrackActions.likeTrackFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Increment Plays
  on(TrackActions.incrementPlaysSuccess, (state, { track }) => ({
    ...state,
    tracks: state.tracks.map(t => t.id === track.id ? track : t),
    filteredTracks: state.filteredTracks.map(t => t.id === track.id ? track : t),
    currentTrack: state.currentTrack?.id === track.id ? track : state.currentTrack,
    mostPlayed: state.mostPlayed.map(t => t.id === track.id ? track : t),
    loading: false
  })),

  // Load Stats
  on(TrackActions.loadTrackStats, (state) => ({
    ...state,
    loadingStats: true,
    error: null
  })),

  on(TrackActions.loadTrackStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    loadingStats: false
  })),

  on(TrackActions.loadTrackStatsFailure, (state, { error }) => ({
    ...state,
    loadingStats: false,
    error
  })),

  // Load Category Stats
  on(TrackActions.loadCategoryStats, (state) => ({
    ...state,
    loadingCategoryStats: true,
    error: null
  })),

  on(TrackActions.loadCategoryStatsSuccess, (state, { categoryStats }) => ({
    ...state,
    categoryStats,
    loadingCategoryStats: false
  })),

  on(TrackActions.loadCategoryStatsFailure, (state, { error }) => ({
    ...state,
    loadingCategoryStats: false,
    error
  })),

  // Filter by Category
  on(TrackActions.filterTracksByCategory, (state, { category }) => ({
    ...state,
    loading: true,
    selectedCategory: category,
    searchQuery: '',
    error: null
  })),

  on(TrackActions.filterTracksByCategorySuccess, (state, { tracks, total, page }) => ({
    ...state,
    filteredTracks: tracks,
    loading: false,
    currentPage: page,
    totalElements: total,
    totalPages: Math.ceil(total / state.pageSize)
  })),

  on(TrackActions.filterTracksByCategoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Most Played
  on(TrackActions.loadMostPlayed, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.loadMostPlayedSuccess, (state, { tracks }) => ({
    ...state,
    mostPlayed: tracks,
    loading: false
  })),

  on(TrackActions.loadMostPlayedFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Most Liked
  on(TrackActions.loadMostLiked, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.loadMostLikedSuccess, (state, { tracks }) => ({
    ...state,
    mostLiked: tracks,
    loading: false
  })),

  on(TrackActions.loadMostLikedFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Recent Tracks
  on(TrackActions.loadRecentTracks, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(TrackActions.loadRecentTracksSuccess, (state, { tracks }) => ({
    ...state,
    recentTracks: tracks,
    loading: false
  })),

  on(TrackActions.loadRecentTracksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Reset State
  on(TrackActions.resetTrackState, () => initialState)
);
