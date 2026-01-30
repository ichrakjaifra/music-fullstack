import { Injectable, signal, computed, effect } from '@angular/core';
import { Track, MusicCategory } from '../models/track.model';
import { SortBy, SortOrder } from '../models/player-state.enum';
import { TrackApiService } from './track-api.service';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  // Dépendre du service API
  constructor(private trackApiService: TrackApiService) {
    // Charger les pistes au démarrage
    this.loadTracks();

    // Synchroniser les signaux
    effect(() => {
      this.tracksSignal.set(this.trackApiService.tracks());
      this.loadingState.set(this.trackApiService.isLoading() ? 'loading' : 'idle');

      const error = this.trackApiService.error();
      if (error) {
        this.errorMessage.set(error);
        this.loadingState.set('error');
      }
    });
  }

  // Signals locaux pour le filtrage et tri
  private loadingState = signal<LoadingState>('idle');
  private errorMessage = signal<string>('');
  private currentFilter = signal<string>('all');
  private sortBySignal = signal<SortBy>(SortBy.DATE);
  private sortOrderSignal = signal<SortOrder>(SortOrder.DESC);
  private tracksSignal = signal<Track[]>([]);
  private localStatsSignal = signal<Record<string, number>>({});

  // Computed signals
  readonly tracks = computed(() => {
    let filtered = [...this.tracksSignal()];

    // Appliquer le filtre
    const filter = this.currentFilter();
    if (filter !== 'all') {
      filtered = filtered.filter(track => track.category === filter);
    }

    // Appliquer le tri
    return this.sortTracks(filtered);
  });

  readonly isLoading = computed(() => this.loadingState() === 'loading');
  readonly error = computed(() => this.errorMessage());

  readonly categories = computed(() => {
    const categories = this.tracksSignal().map(t => t.category);
    const uniqueCategories = Array.from(new Set(categories));
    return ['all', ...uniqueCategories];
  });

  readonly stats = computed(() => {
    const apiStats = this.trackApiService.stats();
    const tracks = this.tracksSignal();

    return {
      totalTracks: apiStats?.totalTracks || tracks.length,
      totalDuration: apiStats?.totalDuration || tracks.reduce((sum, track) => sum + track.duration, 0),
      totalPlays: apiStats?.totalPlays || tracks.reduce((sum, track) => sum + (track.plays || 0), 0),
      totalLikes: apiStats?.totalLikes || tracks.reduce((sum, track) => sum + (track.likes || 0), 0),
      byCategory: this.getCategoryStats(tracks)
    };
  });

  // ============ CRUD OPERATIONS ============

  async loadTracks(page: number = 0): Promise<void> {
    this.loadingState.set('loading');
    this.errorMessage.set('');

    try {
      await this.trackApiService.getAllTracks(page).toPromise();
      this.loadingState.set('success');

      // Charger les stats des catégories
      this.trackApiService.getCategoryStats().subscribe(stats => {
        this.localStatsSignal.set(stats);
      });
    } catch (error) {
      this.errorMessage.set('Erreur lors du chargement des pistes');
      this.loadingState.set('error');
    }
  }

  async createTrack(
    trackData: Partial<Track>,
    audioFile: File,
    imageFile?: File
  ): Promise<Track> {
    this.loadingState.set('loading');
    this.errorMessage.set('');

    try {
      const createRequest = {
        title: trackData.title!,
        artist: trackData.artist!,
        description: trackData.description,
        category: trackData.category as MusicCategory
      };

      const track = await this.trackApiService.createTrack(createRequest, audioFile, imageFile).toPromise();
      this.loadingState.set('success');
      return track;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.errorMessage.set(message);
      this.loadingState.set('error');
      throw error;
    }
  }

  async updateTrack(id: string, updates: Partial<Track>): Promise<void> {
    this.loadingState.set('loading');

    try {
      const updateRequest = {
        title: updates.title!,
        artist: updates.artist!,
        description: updates.description,
        category: updates.category as MusicCategory
      };

      await this.trackApiService.updateTrack(id, updateRequest).toPromise();
      this.loadingState.set('success');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.errorMessage.set(message);
      this.loadingState.set('error');
      throw error;
    }
  }

  async deleteTrack(id: string): Promise<void> {
    this.loadingState.set('loading');

    try {
      await this.trackApiService.deleteTrack(id).toPromise();
      this.loadingState.set('success');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.errorMessage.set(message);
      this.loadingState.set('error');
      throw error;
    }
  }

  // ============ TRACK ACTIONS ============

  async playTrack(id: string): Promise<void> {
    try {
      await this.trackApiService.incrementPlays(id).toPromise();
    } catch (error) {
      console.error('Error incrementing plays:', error);
    }
  }

  async likeTrack(id: string): Promise<number> {
    try {
      const track = await this.trackApiService.likeTrack(id).toPromise();
      return track.likes;
    } catch (error) {
      console.error('Error toggling like:', error);
      return 0;
    }
  }

  // ============ FILTERING & SORTING ============

  setFilter(category: string): void {
    this.currentFilter.set(category);
  }

  setSort(sortBy: SortBy, sortOrder: SortOrder): void {
    this.sortBySignal.set(sortBy);
    this.sortOrderSignal.set(sortOrder);
  }

  // ============ SEARCH ============

  async searchTracks(query: string): Promise<Track[]> {
    try {
      const response = await this.trackApiService.searchTracks(query, 0, 100).toPromise();
      return response.content;
    } catch (error) {
      this.errorMessage.set('Erreur lors de la recherche');
      return [];
    }
  }

  // ============ STATISTICS ============

  async getMostPlayed(limit: number = 10): Promise<Track[]> {
    try {
      return await this.trackApiService.getMostPlayed(limit).toPromise();
    } catch (error) {
      console.error('Error getting most played:', error);
      return [];
    }
  }

  async getMostLiked(limit: number = 10): Promise<Track[]> {
    try {
      return await this.trackApiService.getMostLiked(limit).toPromise();
    } catch (error) {
      console.error('Error getting most liked:', error);
      return [];
    }
  }

  async getRecent(limit: number = 10): Promise<Track[]> {
    try {
      return await this.trackApiService.getRecentTracks(limit).toPromise();
    } catch (error) {
      console.error('Error getting recent:', error);
      return [];
    }
  }

  // ============ UTILITIES ============

  getTrackById(id: string): Track | undefined {
    return this.tracksSignal().find(track => track.id === id);
  }

  getTracksByCategory(category: string): Track[] {
    return this.tracksSignal().filter(track => track.category === category);
  }

  // ============ PRIVATE METHODS ============

  private sortTracks(tracks: Track[]): Track[] {
    const sortBy = this.sortBySignal();
    const sortOrder = this.sortOrderSignal();

    const sorted = [...tracks].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case SortBy.TITLE:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case SortBy.ARTIST:
          aValue = a.artist.toLowerCase();
          bValue = b.artist.toLowerCase();
          break;
        case SortBy.DATE:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case SortBy.DURATION:
          aValue = a.duration;
          bValue = b.duration;
          break;
        case SortBy.PLAYS:
          aValue = a.plays || 0;
          bValue = b.plays || 0;
          break;
        case SortBy.LIKES:
          aValue = a.likes || 0;
          bValue = b.likes || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === SortOrder.ASC) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }

  private getCategoryStats(tracks: Track[]): Record<string, number> {
    const stats: Record<string, number> = {};

    tracks.forEach(track => {
      stats[track.category] = (stats[track.category] || 0) + 1;
    });

    return stats;
  }

  // ============ DATA MANAGEMENT ============

  async exportData(): Promise<Blob> {
    const tracks = this.tracksSignal();
    const data = {
      tracks,
      exportDate: new Date(),
      version: '1.0'
    };

    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  async importData(file: File): Promise<void> {
    this.loadingState.set('loading');

    try {
      // Cette fonctionnalité nécessiterait un endpoint d'import
      // Pour l'instant, on ne fait rien
      console.warn('Import functionality not implemented with API');
      this.loadingState.set('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'importation';
      this.errorMessage.set(message);
      this.loadingState.set('error');
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    this.loadingState.set('loading');

    try {
      // Supprimer toutes les pistes une par une
      const tracks = [...this.tracksSignal()];

      for (const track of tracks) {
        await this.deleteTrack(track.id);
      }

      this.loadingState.set('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors du nettoyage';
      this.errorMessage.set(message);
      this.loadingState.set('error');
      throw error;
    }
  }
}
