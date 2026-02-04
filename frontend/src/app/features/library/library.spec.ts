import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryComponent } from './library';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { RouterTestingModule } from '@angular/router/testing';
import * as TrackSelectors from '../../core/store/track/track.selectors';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;
  let store: MockStore;
  let playerServiceSpy: any;

  const initialState = {
    track: {
      tracks: [],
      filteredTracks: [],
      loading: false,
      error: null,
      categories: [],
      stats: null,
      currentPage: 0,
      totalPages: 0,
      totalElements: 0
    }
  };

  beforeEach(async () => {
    playerServiceSpy = {
      currentTrack: signal(null),
      status: signal('stopped'),
      play: vi.fn(),
      pause: vi.fn(),
      setQueue: vi.fn(),
      addToQueue: vi.fn(),
      stop: vi.fn(),
      restoreState: vi.fn(),
      saveState: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        LibraryComponent,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: AudioPlayerService, useValue: playerServiceSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;

    // Mock selectors
    store.overrideSelector(TrackSelectors.selectFilteredTracks, []);
    store.overrideSelector(TrackSelectors.selectTrackLoading, false);
    store.overrideSelector(TrackSelectors.selectTrackError, null);
    store.overrideSelector(TrackSelectors.selectCategories, []);
    store.overrideSelector(TrackSelectors.selectTrackStats, null);
    store.overrideSelector(TrackSelectors.selectCategoryStats, {});
    store.overrideSelector(TrackSelectors.selectCurrentPage, 0);
    store.overrideSelector(TrackSelectors.selectTotalPages, 0);
    store.overrideSelector(TrackSelectors.selectTotalElements, 0);
    store.overrideSelector(TrackSelectors.selectSearchQuery, '');
    store.overrideSelector(TrackSelectors.selectSelectedCategory, 'all');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
