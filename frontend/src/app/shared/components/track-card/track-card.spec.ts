import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackCardComponent } from './track-card';
import { RouterTestingModule } from '@angular/router/testing';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { TrackService } from '../../../core/services/track.service';
import { MusicCategory } from '../../../core/models/track.model';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('TrackCardComponent', () => {
  let component: TrackCardComponent;
  let fixture: ComponentFixture<TrackCardComponent>;

  beforeEach(async () => {
    const playerServiceMock = {
      currentTrack: signal(null)
    };

    const trackServiceMock = {
      likeTrack: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TrackCardComponent, RouterTestingModule],
      providers: [
        { provide: AudioPlayerService, useValue: playerServiceMock },
        { provide: TrackService, useValue: trackServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackCardComponent);
    component = fixture.componentInstance;
    component.track = {
      id: '1',
      title: 'Test',
      artist: 'Artist',
      category: MusicCategory.POP,
      fileUrl: '',
      fileSize: 0,
      fileType: '',
      duration: 0,
      coverColor: '',
      plays: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
