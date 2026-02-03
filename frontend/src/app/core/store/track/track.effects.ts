import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as TrackActions from './track.actions';
import { TrackApiService } from '../../services/track-api.service';

@Injectable()
export class TrackEffects {
  constructor(
    private actions$: Actions,
    private trackApiService: TrackApiService
  ) {}

  // Load Tracks Effect
  loadTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTracks),
      mergeMap(({ page = 0, size = 20 }) =>
        this.trackApiService.getAllTracks(page, size).pipe(
          map(response => TrackActions.loadTracksSuccess({
            tracks: response.content,
            total: response.totalElements,
            page: response.number
          })),
          catchError(error => of(TrackActions.loadTracksFailure({
            error: error.message || 'Erreur lors du chargement des pistes'
          })))
        )
      )
    )
  );

  // Search Tracks Effect
  searchTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.searchTracks),
      mergeMap(({ query, page = 0, size = 20 }) =>
        this.trackApiService.searchTracks(query, page, size).pipe(
          map(response => TrackActions.searchTracksSuccess({
            tracks: response.content,
            total: response.totalElements,
            page: response.number
          })),
          catchError(error => of(TrackActions.searchTracksFailure({
            error: error.message || 'Erreur lors de la recherche'
          })))
        )
      )
    )
  );

  // Load Track by ID Effect
  loadTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTrack),
      mergeMap(({ id }) =>
        this.trackApiService.getTrack(id).pipe(
          map(track => TrackActions.loadTrackSuccess({ track })),
          catchError(error => of(TrackActions.loadTrackFailure({
            error: error.message || 'Erreur lors du chargement de la piste'
          })))
        )
      )
    )
  );

  // Create Track Effect
  createTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.createTrack),
      mergeMap(({ trackData, audioFile, imageFile }) =>
        this.trackApiService.createTrack(trackData, audioFile, imageFile).pipe(
          map(track => TrackActions.createTrackSuccess({ track })),
          catchError(error => of(TrackActions.createTrackFailure({
            error: error.message || 'Erreur lors de la création de la piste'
          })))
        )
      )
    )
  );

  // Update Track Effect
  updateTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.updateTrack),
      mergeMap(({ id, trackData }) =>
        this.trackApiService.updateTrack(id, trackData).pipe(
          map(track => TrackActions.updateTrackSuccess({ track })),
          catchError(error => of(TrackActions.updateTrackFailure({
            error: error.message || 'Erreur lors de la mise à jour de la piste'
          })))
        )
      )
    )
  );

  // Delete Track Effect
  deleteTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.deleteTrack),
      mergeMap(({ id }) =>
        this.trackApiService.deleteTrack(id).pipe(
          map(() => TrackActions.deleteTrackSuccess({ id })),
          catchError(error => of(TrackActions.deleteTrackFailure({
            error: error.message || 'Erreur lors de la suppression de la piste'
          })))
        )
      )
    )
  );

  // Like Track Effect
  likeTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.likeTrack),
      mergeMap(({ id }) =>
        this.trackApiService.likeTrack(id).pipe(
          map(track => TrackActions.likeTrackSuccess({ track })),
          catchError(error => of(TrackActions.likeTrackFailure({
            error: error.message || 'Erreur lors du like'
          })))
        )
      )
    )
  );

  // Increment Plays Effect
  incrementPlays$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.incrementPlays),
      mergeMap(({ id }) =>
        this.trackApiService.incrementPlays(id).pipe(
          map(() => {
            // Pour l'effet de succès, on aurait besoin de recharger la piste
            // ou de mettre à jour localement. Pour l'instant, on fait un succès vide.
            return TrackActions.incrementPlaysSuccess({
              track: { id } as any // Ceci sera mis à jour par l'effet de rechargement
            });
          }),
          catchError(error => of(TrackActions.incrementPlaysFailure({
            error: error.message || 'Erreur lors de l\'incrémentation des lectures'
          })))
        )
      )
    )
  );

  // Load Stats Effect
  loadTrackStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTrackStats),
      mergeMap(() =>
        this.trackApiService.getStats().pipe(
          map(stats => TrackActions.loadTrackStatsSuccess({ stats })),
          catchError(error => of(TrackActions.loadTrackStatsFailure({
            error: error.message || 'Erreur lors du chargement des statistiques'
          })))
        )
      )
    )
  );

  // Load Category Stats Effect
  loadCategoryStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadCategoryStats),
      mergeMap(() =>
        this.trackApiService.getCategoryStats().pipe(
          map(categoryStats => TrackActions.loadCategoryStatsSuccess({ categoryStats })),
          catchError(error => of(TrackActions.loadCategoryStatsFailure({
            error: error.message || 'Erreur lors du chargement des statistiques par catégorie'
          })))
        )
      )
    )
  );

  // Filter by Category Effect
  filterTracksByCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.filterTracksByCategory),
      mergeMap(({ category, page = 0, size = 20 }) =>
        this.trackApiService.getTracksByCategory(category, page, size).pipe(
          map(tracks => TrackActions.filterTracksByCategorySuccess({
            tracks,
            total: tracks.length, // Note: L'API pourrait ne pas retourner le total
            page
          })),
          catchError(error => of(TrackActions.filterTracksByCategoryFailure({
            error: error.message || 'Erreur lors du filtrage par catégorie'
          })))
        )
      )
    )
  );

  // Load Most Played Effect
  loadMostPlayed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadMostPlayed),
      mergeMap(({ limit }) =>
        this.trackApiService.getMostPlayed(limit).pipe(
          map(tracks => TrackActions.loadMostPlayedSuccess({ tracks })),
          catchError(error => of(TrackActions.loadMostPlayedFailure({
            error: error.message || 'Erreur lors du chargement des pistes les plus écoutées'
          })))
        )
      )
    )
  );

  // Load Most Liked Effect
  loadMostLiked$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadMostLiked),
      mergeMap(({ limit }) =>
        this.trackApiService.getMostLiked(limit).pipe(
          map(tracks => TrackActions.loadMostLikedSuccess({ tracks })),
          catchError(error => of(TrackActions.loadMostLikedFailure({
            error: error.message || 'Erreur lors du chargement des pistes les plus aimées'
          })))
        )
      )
    )
  );

  // Load Recent Tracks Effect
  loadRecentTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadRecentTracks),
      mergeMap(({ limit }) =>
        this.trackApiService.getRecentTracks(limit).pipe(
          map(tracks => TrackActions.loadRecentTracksSuccess({ tracks })),
          catchError(error => of(TrackActions.loadRecentTracksFailure({
            error: error.message || 'Erreur lors du chargement des pistes récentes'
          })))
        )
      )
    )
  );
}
