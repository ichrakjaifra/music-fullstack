import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Track, TrackStats, CreateTrackRequest, UpdateTrackRequest } from '../models/track.model';
import { PaginatedResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TrackApiService {
  private apiService = inject(ApiService);
  private readonly apiUrl = environment.apiUrl;

  // ============ CRUD OPERATIONS ============

  getAllTracks(page: number = 0, size: number = 20): Observable<PaginatedResponse<Track>> {
    return this.apiService.getPaginated<Track>('/tracks', page, size);
  }

  getTrack(id: string): Observable<Track> {
    return this.apiService.get<Track>(`/tracks/${id}`);
  }

  createTrack(trackData: CreateTrackRequest, audioFile: File, imageFile?: File): Observable<Track> {
    const formData = new FormData();

    formData.append('audioFile', audioFile);

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    // Append track data
    formData.append('title', trackData.title);
    formData.append('artist', trackData.artist);
    formData.append('category', trackData.category);

    if (trackData.description) {
      formData.append('description', trackData.description);
    }

    return this.apiService.uploadFile<Track>('/tracks', formData);
  }

  updateTrack(id: string, trackData: UpdateTrackRequest): Observable<Track> {
    return this.apiService.put<Track>(`/tracks/${id}`, trackData);
  }

  deleteTrack(id: string): Observable<void> {
    return this.apiService.delete<void>(`/tracks/${id}`);
  }

  // ============ TRACK ACTIONS ============

  likeTrack(id: string): Observable<Track> {
    return this.apiService.post<Track>(`/tracks/${id}/like`, {});
  }

  incrementPlays(id: string): Observable<void> {
    return this.apiService.post<void>(`/tracks/${id}/play`, {});
  }

  // ============ SEARCH & FILTER ============

  searchTracks(query: string, page: number = 0, size: number = 20): Observable<PaginatedResponse<Track>> {
    const params = { q: query };
    return this.apiService.getPaginated<Track>('/tracks/search', page, size, params);
  }

  getTracksByCategory(category: string, page: number = 0, size: number = 20): Observable<Track[]> {
    return this.apiService.get<Track[]>(`/tracks/category/${category}`, {
      page: page.toString(),
      size: size.toString()
    });
  }

  // ============ STATISTICS ============

  getMostPlayed(limit: number = 10): Observable<Track[]> {
    return this.apiService.get<Track[]>('/tracks/most-played', { limit: limit.toString() });
  }

  getMostLiked(limit: number = 10): Observable<Track[]> {
    return this.apiService.get<Track[]>('/tracks/most-liked', { limit: limit.toString() });
  }

  getRecentTracks(limit: number = 10): Observable<Track[]> {
    return this.apiService.get<Track[]>('/tracks/recent', { limit: limit.toString() });
  }

  getStats(): Observable<TrackStats> {
    return this.apiService.get<TrackStats>('/tracks/stats');
  }

  getCategoryStats(): Observable<Record<string, number>> {
    return this.apiService.get<Record<string, number>>('/tracks/stats/categories');
  }

  // ============ FILE MANAGEMENT ============

  uploadTrackImage(id: string, imageFile: File): Observable<Track> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.apiService.post<Track>(`/tracks/${id}/image`, formData);
  }

  // ============ UTILITIES ============

  getAudioStreamUrl(id: string): string {
    return `${this.apiUrl}/tracks/stream/${id}`;
  }

  refreshTracks(): Observable<PaginatedResponse<Track>> {
    return this.getAllTracks();
  }
}
