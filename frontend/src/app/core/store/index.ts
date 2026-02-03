import { ActionReducerMap } from '@ngrx/store';
import { trackReducer, TrackState } from './track/track.reducer';

export interface AppState {
  track: TrackState;
}

export const reducers: ActionReducerMap<AppState> = {
  track: trackReducer
};

export * from './track/track.actions';
export * from './track/track.reducer';
export * from './track/track.selectors';
export * from './track/track.effects';
