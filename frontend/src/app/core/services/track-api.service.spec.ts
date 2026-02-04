import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrackApiService } from './track-api.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { MusicCategory } from '../models/track.model';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('TrackApiService', () => {
    let service: TrackApiService;
    let apiServiceMock: any;

    beforeEach(() => {
        apiServiceMock = {
            get: vi.fn(),
            getPaginated: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            uploadFile: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                TrackApiService,
                { provide: ApiService, useValue: apiServiceMock }
            ]
        });

        service = TestBed.inject(TrackApiService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call apiService.getPaginated when getAllTracks is called', () => {
        const mockResponse = { content: [], totalElements: 0, number: 0 } as any;
        apiServiceMock.getPaginated.mockReturnValue(of(mockResponse));

        service.getAllTracks(0, 20).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });

        expect(apiServiceMock.getPaginated).toHaveBeenCalledWith('/api/tracks', 0, 20);
    });

    it('should call apiService.get when getTrack is called', () => {
        const mockTrack = { id: '1', title: 'Test' } as any;
        apiServiceMock.get.mockReturnValue(of(mockTrack));

        service.getTrack('1').subscribe(res => {
            expect(res).toEqual(mockTrack);
        });

        expect(apiServiceMock.get).toHaveBeenCalledWith('/api/tracks/1');
    });

    it('should call apiService.uploadFile when createTrack is called', () => {
        const trackData = { title: 'New', artist: 'Artist', category: MusicCategory.POP };
        const audioFile = new File([''], 'audio.mp3', { type: 'audio/mpeg' });

        apiServiceMock.uploadFile.mockReturnValue(of({}));

        service.createTrack(trackData, audioFile).subscribe();

        expect(apiServiceMock.uploadFile).toHaveBeenCalled();
    });
});
