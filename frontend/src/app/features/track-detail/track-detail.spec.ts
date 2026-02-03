import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TrackDetailComponent } from './track-detail';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { TrackApiService } from '../../core/services/track-api.service';
import { of } from 'rxjs';

describe('TrackDetailComponent', () => {
  let component: TrackDetailComponent;
  let fixture: ComponentFixture<TrackDetailComponent>;

  beforeEach(async () => {
    // Mock services
    const trackServiceMock = {
      getTrackById: () => of(null)
    };
    const audioPlayerServiceMock = {
      currentTrack: () => null,
      status: () => 'stopped',
      currentTime: () => 0,
      duration: () => 0,
      progress: () => 0
    };
    const trackApiServiceMock = {
      getTrack: () => of(null)
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
