import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AudioPlayerComponent } from './audio-player';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { TrackService } from '../../../core/services/track.service';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AudioPlayerComponent', () => {
  let component: AudioPlayerComponent;
  let fixture: ComponentFixture<AudioPlayerComponent>;

  beforeEach(async () => {
    const playerServiceMock = {
      currentTrack: signal(null),
      status: signal('stopped'),
      isLoading: signal(false),
      currentTime: signal(0),
      volume: signal(1),
      isMuted: signal(false),
      isShuffled: signal(false),
      isRepeating: signal(false),
      progress: signal(0),
      duration: signal(0),
      hasNext: signal(false),
      hasPrevious: signal(false),
      queue: signal([]),
      currentIndex: signal(-1),
      queueInfo: signal(''),
      getCurrentTimeFormatted: vi.fn(),
      getDurationFormatted: vi.fn(),
      getRemainingTimeFormatted: vi.fn(),
      restoreState: vi.fn(),
      saveState: vi.fn()
    };

    const trackServiceMock = {
      incrementPlays: vi.fn(),
      likeTrack: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AudioPlayerComponent],
      providers: [
        { provide: AudioPlayerService, useValue: playerServiceMock },
        { provide: TrackService, useValue: trackServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AudioPlayerComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // Avoid initial detectChanges if it causes issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
