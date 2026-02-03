import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Track, MusicCategory } from '../models/track.model';
import { AppState } from '../store/app.state';
import * as TrackActions from '../store/track/track.actions';
import * as TrackSelectors from '../store/track/track.selectors';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private store = inject(Store<AppState>);

  // Observables depuis le store
  tracks$ = this.store.select(TrackSelectors.selectAllTracks);
  filteredTracks$ = this.store.select(TrackSelectors.selectFilteredTracks);
  currentTrack$ = this.store.select(TrackSelectors.selectCurrentTrack);
  stats$ = this.store.select(TrackSelectors.selectTrackStats);
  categoryStats$ = this.store.select(TrackSelectors.selectCategoryStats);
  mostPlayed$ = this.store.select(TrackSelectors.selectMostPlayed);
  mostLiked$ = this.store.select(TrackSelectors.selectMostLiked);
  recentTracks$ = this.store.select(TrackSelectors.selectRecentTracks);
  loading$ = this.store.select(TrackSelectors.selectTrackLoading);
  error$ = this.store.select(TrackSelectors.selectTrackError);
  categories$ = this.store.select(TrackSelectors.selectCategories);
  currentPage$ = this.store.select(TrackSelectors.selectCurrentPage);
  totalPages$ = this.store.select(TrackSelectors.selectTotalPages);

  // Getters compatibles
  get tracks() {
    return this.tracks$;
  }

  get isLoading() {
    return this.loading$;
  }

  get error() {
    return this.error$;
  }

  get categories() {
    return this.categories$;
  }

  get stats() {
    return this.stats$;
  }

  // Dispatch actions
  loadTracks(page?: number, size?: number): void {
    this.store.dispatch(TrackActions.loadTracks({ page, size }));
  }

  searchTracks(query: string, page?: number, size?: number): void {
    this.store.dispatch(TrackActions.searchTracks({ query, page, size }));
  }

  loadTrack(id: string): void {
    this.store.dispatch(TrackActions.loadTrack({ id }));
  }

  createTrack(trackData: any, audioFile: File, imageFile?: File): void {
    this.store.dispatch(TrackActions.createTrack({ trackData, audioFile, imageFile }));
  }

  updateTrack(id: string, trackData: any): void {
    this.store.dispatch(TrackActions.updateTrack({ id, trackData }));
  }

  deleteTrack(id: string): void {
    this.store.dispatch(TrackActions.deleteTrack({ id }));
  }

  likeTrack(id: string): void {
    this.store.dispatch(TrackActions.likeTrack({ id }));
  }

  incrementPlays(id: string): void {
    this.store.dispatch(TrackActions.incrementPlays({ id }));
  }

  loadStats(): void {
    this.store.dispatch(TrackActions.loadTrackStats());
  }

  loadCategoryStats(): void {
    this.store.dispatch(TrackActions.loadCategoryStats());
  }

  filterByCategory(category: string, page?: number, size?: number): void {
    this.store.dispatch(TrackActions.filterTracksByCategory({ category, page, size }));
  }

  loadMostPlayed(limit: number = 10): void {
    this.store.dispatch(TrackActions.loadMostPlayed({ limit }));
  }

  loadMostLiked(limit: number = 10): void {
    this.store.dispatch(TrackActions.loadMostLiked({ limit }));
  }

  loadRecentTracks(limit: number = 10): void {
    this.store.dispatch(TrackActions.loadRecentTracks({ limit }));
  }

  // Helper methods
  getTrackById(id: string): Observable<Track | undefined> {
    return this.store.select(TrackSelectors.selectTrackById(id));
  }

  getTracksByCategory(category: string): Observable<Track[]> {
    return this.store.select(TrackSelectors.selectTracksByCategory(category));
  }

  resetState(): void {
    this.store.dispatch(TrackActions.resetTrackState());
  }
}
