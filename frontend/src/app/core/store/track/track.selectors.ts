import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TrackState } from './track.reducer';

export const selectTrackState = createFeatureSelector<TrackState>('track');

// Basic Selectors
export const selectAllTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.tracks
);

export const selectFilteredTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.filteredTracks
);

export const selectCurrentTrack = createSelector(
  selectTrackState,
  (state: TrackState) => state.currentTrack
);

export const selectSelectedTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.selectedTracks
);

export const selectTrackStats = createSelector(
  selectTrackState,
  (state: TrackState) => state.stats
);

export const selectCategoryStats = createSelector(
  selectTrackState,
  (state: TrackState) => state.categoryStats
);

export const selectMostPlayed = createSelector(
  selectTrackState,
  (state: TrackState) => state.mostPlayed
);

export const selectMostLiked = createSelector(
  selectTrackState,
  (state: TrackState) => state.mostLiked
);

export const selectRecentTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.recentTracks
);

// Loading Selectors
export const selectTrackLoading = createSelector(
  selectTrackState,
  (state: TrackState) => state.loading
);

export const selectStatsLoading = createSelector(
  selectTrackState,
  (state: TrackState) => state.loadingStats
);

export const selectCategoryStatsLoading = createSelector(
  selectTrackState,
  (state: TrackState) => state.loadingCategoryStats
);

// Error Selector
export const selectTrackError = createSelector(
  selectTrackState,
  (state: TrackState) => state.error
);

// Pagination Selectors
export const selectCurrentPage = createSelector(
  selectTrackState,
  (state: TrackState) => state.currentPage
);

export const selectTotalPages = createSelector(
  selectTrackState,
  (state: TrackState) => state.totalPages
);

export const selectPageSize = createSelector(
  selectTrackState,
  (state: TrackState) => state.pageSize
);

export const selectTotalElements = createSelector(
  selectTrackState,
  (state: TrackState) => state.totalElements
);

// Filter Selectors
export const selectSearchQuery = createSelector(
  selectTrackState,
  (state: TrackState) => state.searchQuery
);

export const selectSelectedCategory = createSelector(
  selectTrackState,
  (state: TrackState) => state.selectedCategory
);

// Computed Selectors
export const selectPaginatedTracks = createSelector(
  selectFilteredTracks,
  selectCurrentPage,
  selectPageSize,
  (tracks, currentPage, pageSize) => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return tracks.slice(startIndex, endIndex);
  }
);

export const selectCategories = createSelector(
  selectAllTracks,
  (tracks) => {
    const categories = tracks.map(t => t.category);
    return Array.from(new Set(categories));
  }
);

export const selectTrackById = (id: string) => createSelector(
  selectAllTracks,
  (tracks) => tracks.find(track => track.id === id)
);

export const selectTracksByCategory = (category: string) => createSelector(
  selectAllTracks,
  (tracks) => tracks.filter(track => track.category === category)
);

export const selectIsSelected = (id: string) => createSelector(
  selectSelectedTracks,
  (selected) => selected.includes(id)
);

// Stats Computed Selectors
export const selectTotalDurationFormatted = createSelector(
  selectTrackStats,
  (stats) => {
    if (!stats || !stats.totalDuration) return '0:00';
    return formatDuration(stats.totalDuration);
  }
);

export const selectCategoryPercentages = createSelector(
  selectTrackStats,
  selectCategoryStats,
  (stats, categoryStats) => {
    if (!stats || !categoryStats || stats.totalTracks === 0) {
      return {};
    }

    const percentages: Record<string, number> = {};
    Object.entries(categoryStats).forEach(([category, count]) => {
      percentages[category] = (count / stats.totalTracks) * 100;
    });

    return percentages;
  }
);

// Helper function for formatting
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
