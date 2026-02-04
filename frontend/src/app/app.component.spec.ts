import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AudioPlayerService } from './core/services/audio-player.service';
import { TrackService } from './core/services/track.service';
import { TrackApiService } from './core/services/track-api.service';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let playerServiceMock: any;
  let trackServiceMock: any;
  let trackApiServiceMock: any;

  beforeEach(async () => {
    playerServiceMock = {
      currentTrack: signal(null),
      status: signal('stopped'),
      restoreState: vi.fn(),
      saveState: vi.fn()
    };

    trackServiceMock = {
      isLoading: of(false)
    };

    trackApiServiceMock = {
      calculateStorageUsage: vi.fn(),
      refreshTracks: vi.fn(),
      getStorageStats: vi.fn().mockReturnValue(of({ usagePercentage: 0 }))
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AudioPlayerService, useValue: playerServiceMock },
        { provide: TrackService, useValue: trackServiceMock },
        { provide: TrackApiService, useValue: trackApiServiceMock },
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
