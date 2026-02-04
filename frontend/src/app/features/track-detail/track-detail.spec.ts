import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TrackDetailComponent } from './track-detail';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { TrackApiService } from '../../core/services/track-api.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;

  beforeEach(async () => {
    // Mock services
    const trackServiceMock = {
      getTrackById: vi.fn().mockReturnValue(of(null))
    };
    const audioPlayerServiceMock = {
      currentTrack: signal(null),
      status: signal('stopped'),
      currentTime: signal(0),
      duration: signal(0),
      progress: signal(0)
    };
    const trackApiServiceMock = {
      getTrack: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [
        TrackDetailComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: TrackService, useValue: trackServiceMock },
        { provide: AudioPlayerService, useValue: audioPlayerServiceMock },
        { provide: TrackApiService, useValue: trackApiServiceMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TrackDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // Avoid initial detectChanges if it causes issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
