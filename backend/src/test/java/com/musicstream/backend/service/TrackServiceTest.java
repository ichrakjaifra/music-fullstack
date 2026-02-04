package com.musicstream.backend.service;

import com.musicstream.backend.dto.CreateTrackRequest;
import com.musicstream.backend.dto.TrackDTO;
import com.musicstream.backend.mapper.TrackMapper;
import com.musicstream.backend.models.MusicCategory;
import com.musicstream.backend.models.Track;
import com.musicstream.backend.repository.TrackRepository;
import com.musicstream.backend.service.impl.TrackServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackServiceTest {

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private TrackMapper trackMapper;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private TrackServiceImpl trackService;

    private Track track;
    private TrackDTO trackDTO;

    @BeforeEach
    void setUp() {
        track = Track.builder()
                .id("1")
                .title("Test Track")
                .artist("Test Artist")
                .category(MusicCategory.POP)
                .build();

        trackDTO = TrackDTO.builder()
                .id("1")
                .title("Test Track")
                .artist("Test Artist")
                .category(MusicCategory.POP)
                .build();
    }

    @Test
    void getTrack_WhenIdExists_ShouldReturnTrack() {
        // Arrange
        when(trackRepository.findById("1")).thenReturn(Optional.of(track));
        when(trackMapper.toDTO(track)).thenReturn(trackDTO);

        // Act
        TrackDTO result = trackService.getTrack("1");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Track");
        verify(trackRepository).findById("1");
    }

    @Test
    void getTrack_WhenIdDoesNotExist_ShouldThrowException() {
        // Arrange
        when(trackRepository.findById("99")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> trackService.getTrack("99"))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Track not found");
    }

    @Test
    void createTrack_WithValidData_ShouldReturnCreatedTrack() {
        // Arrange
        CreateTrackRequest request = CreateTrackRequest.builder()
                .title("New Track")
                .artist("New Artist")
                .category(MusicCategory.POP)
                .build();

        MockMultipartFile audioFile = new MockMultipartFile(
                "audioFile", "test.mp3", "audio/mpeg", "test audio content".getBytes());

        when(fileStorageService.saveAudioFile(audioFile)).thenReturn("audio/url");
        when(trackRepository.save(any(Track.class))).thenReturn(track);
        when(trackMapper.toDTO(any(Track.class))).thenReturn(trackDTO);

        // Act
        TrackDTO result = trackService.createTrack(request, audioFile, null);

        // Assert
        assertThat(result).isNotNull();
        verify(fileStorageService).saveAudioFile(audioFile);
        verify(trackRepository).save(any(Track.class));
    }

    @Test
    void deleteTrack_WhenIdExists_ShouldCallDelete() {
        // Arrange
        when(trackRepository.findById("1")).thenReturn(Optional.of(track));

        // Act
        trackService.deleteTrack("1");

        // Assert
        verify(trackRepository).delete(track);
        verify(fileStorageService).deleteFile(track.getFileUrl());
    }
}
