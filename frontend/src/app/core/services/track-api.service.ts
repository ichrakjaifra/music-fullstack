import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import {
  Track,
  MusicCategory,
  CreateTrackRequest,
  UpdateTrackRequest,
  TrackStats
} from '../models/track.model';
import { SortBy, SortOrder } from '../models/player-state.enum';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TrackApiService {
  // Signals pour le state management
  private tracksSignal = signal<Track[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string>('');
  private currentPageSignal = signal<number>(0);
  private totalPagesSignal = signal<number>(0);
  private totalElementsSignal = signal<number>(0);
  private statsSignal = signal<TrackStats | null>(null);

  // Exposed signals
  readonly tracks = computed(() => this.tracksSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly currentPage = computed(() => this.currentPageSignal());
  readonly totalPages = computed(() => this.totalPagesSignal());
  readonly totalElements = computed(() => this.totalElementsSignal());
  readonly stats = computed(() => this.statsSignal());

  constructor(private apiService: ApiService) {
    this.loadStats();
  }

  // ============ CRUD OPERATIONS ============

  getAllTracks(page: number = 0, size: number = 20): Observable<PaginatedResponse<Track>> {
    this.loadingSignal.set(true);
    this.errorSignal.set('');

    return this.apiService.getPaginated<Track>('/tracks', page, size).pipe(
      tap(response => {
        this.tracksSignal.set(response.content);
        this.currentPageSignal.set(response.number);
        this.totalPagesSignal.set(response.totalPages);
        this.totalElementsSignal.set(response.totalElements);
        this.loadingSignal.set(false);
      }),
      map(response => response)
    );
  }

  getTrack(id: string): Observable<Track> {
    this.loadingSignal.set(true);

    return this.apiService.get<Track>(`/tracks/${id}`).pipe(
      tap(response => {
        this.loadingSignal.set(false);
        if (response.data) {
          // Mettre à jour la liste locale si la piste existe
          const currentTracks = this.tracksSignal();
          const index = currentTracks.findIndex(t => t.id === id);
          if (index !== -1) {
            const updatedTracks = [...currentTracks];
            updatedTracks[index] = response.data;
            this.tracksSignal.set(updatedTracks);
          }
        }
      }),
      map(response => response.data!)
    );
  }

  createTrack(
    trackData: CreateTrackRequest,
    audioFile: File,
    imageFile?: File
  ): Observable<Track> {
    this.loadingSignal.set(true);

    const formData = new FormData();
    formData.append('audioFile', audioFile);

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    Object.keys(trackData).forEach(key => {
      formData.append(key, (trackData as any)[key]);
    });

    return this.apiService.post<Track>('/tracks', formData).pipe(
      tap(response => {
        if (response.data) {
          this.tracksSignal.update(tracks => [...tracks, response.data!]);
        }
        this.loadingSignal.set(false);
        this.loadStats();
      }),
      map(response => response.data!)
    );
  }

  updateTrack(id: string, updates: UpdateTrackRequest): Observable<Track> {
    this.loadingSignal.set(true);

    return this.apiService.put<Track>(`/tracks/${id}`, updates).pipe(
      tap(response => {
        if (response.data) {
          this.tracksSignal.update(tracks =>
            tracks.map(t => t.id === id ? response.data! : t)
          );
        }
        this.loadingSignal.set(false);
      }),
      map(response => response.data!)
    );
  }

  deleteTrack(id: string): Observable<void> {
    this.loadingSignal.set(true);

    return this.apiService.delete<void>(`/tracks/${id}`).pipe(
      tap(() => {
        this.tracksSignal.update(tracks => tracks.filter(t => t.id !== id));
        this.loadingSignal.set(false);
        this.loadStats();
      }),
      map(() => undefined)
    );
  }

  // ============ TRACK ACTIONS ============

  incrementPlays(id: string): Observable<void> {
    return this.apiService.post<void>(`/tracks/${id}/play`, {}).pipe(
      tap(() => {
        this.tracksSignal.update(tracks =>
          tracks.map(track =>
            track.id === id
              ? { ...track, plays: track.plays + 1 }
              : track
          )
        );
        this.loadStats();
      })
    );
  }

  likeTrack(id: string): Observable<Track> {
    return this.apiService.post<Track>(`/tracks/${id}/like`, {}).pipe(
      tap(response => {
        if (response.data) {
          this.tracksSignal.update(tracks =>
            tracks.map(t => t.id === id ? response.data! : t)
          );
          this.loadStats();
        }
      }),
      map(response => response.data!)
    );
  }

  // ============ SEARCH & FILTER ============

  searchTracks(query: string, page: number = 0, size: number = 20): Observable<PaginatedResponse<Track>> {
    this.loadingSignal.set(true);

    return this.apiService.getPaginated<Track>('/tracks/search', page, size, { q: query }).pipe(
      tap(response => {
        this.tracksSignal.set(response.content);
        this.currentPageSignal.set(response.number);
        this.totalPagesSignal.set(response.totalPages);
        this.totalElementsSignal.set(response.totalElements);
        this.loadingSignal.set(false);
      })
    );
  }

  getTracksByCategory(category: string, page: number = 0, size: number = 20): Observable<Track[]> {
    this.loadingSignal.set(true);

    return this.apiService.get<Track[]>(`/tracks/category/${category}`, {
      page: page.toString(),
      size: size.toString()
    }).pipe(
      tap(response => {
        if (response.data) {
          this.tracksSignal.set(response.data);
        }
        this.loadingSignal.set(false);
      }),
      map(response => response.data || [])
    );
  }

  // ============ STATISTICS ============

  getMostPlayed(limit: number = 10): Observable<Track[]> {
    return this.apiService.get<Track[]>('/tracks/most-played', { limit: limit.toString() })
      .pipe(map(response => response.data || []));
  }

  getMostLiked(limit: number = 10): Observable<Track[]> {
    return this.apiService.get<Track[]>('/tracks/most-liked', { limit: limit.toString() })
      .pipe(map(response => response.data || []));
  }

  getRecentTracks(limit: number = 10): Observable<Track[]> {
    return this.apiService.get<Track[]>('/tracks/recent', { limit: limit.toString() })
      .pipe(map(response => response.data || []));
  }

  loadStats(): void {
    this.apiService.get<TrackStats>('/tracks/stats').pipe(
      tap(response => {
        if (response.data) {
          this.statsSignal.set(response.data);
        }
      })
    ).subscribe();
  }

  getCategoryStats(): Observable<Record<string, number>> {
    return this.apiService.get<Record<string, number>>('/tracks/stats/categories')
      .pipe(map(response => response.data || {}));
  }

  // ============ FILE MANAGEMENT ============

  uploadTrackImage(id: string, imageFile: File): Observable<Track> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.apiService.post<Track>(`/tracks/${id}/image`, formData).pipe(
      tap(response => {
        if (response.data) {
          this.tracksSignal.update(tracks =>
            tracks.map(t => t.id === id ? response.data! : t)
          );
        }
      }),
      map(response => response.data!)
    );
  }

  getAudioStreamUrl(id: string): string {
    return `${environment.apiUrl}/tracks/stream/${id}`;
  }

  // ============ UTILITIES ============

  refreshTracks(): Observable<PaginatedResponse<Track>> {
    return this.getAllTracks(this.currentPageSignal(), 20);
  }

  clearError(): void {
    this.errorSignal.set('');
  }
}
