import { TrackState } from './track/track.reducer';

export interface AppState {
  track: TrackState;
}

export const selectTrackState = (state: AppState) => state.track;
