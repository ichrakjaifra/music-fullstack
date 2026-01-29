package com.musicstream.backend.service;


import com.musicstream.backend.dto.CreateTrackRequest;
import com.musicstream.backend.dto.TrackDTO;
import com.musicstream.backend.dto.TrackStatsDTO;
import com.musicstream.backend.dto.UpdateTrackRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface TrackService {

    TrackDTO createTrack(CreateTrackRequest request, MultipartFile audioFile, MultipartFile imageFile);

    TrackDTO getTrack(String id);

    Page<TrackDTO> getAllTracks(Pageable pageable);

    TrackDTO updateTrack(String id, UpdateTrackRequest request);

    void deleteTrack(String id);

    void incrementPlays(String id);

    TrackDTO likeTrack(String id);

    Page<TrackDTO> searchTracks(String query, Pageable pageable);

    List<TrackDTO> getTracksByCategory(String category, Pageable pageable);

    List<TrackDTO> getMostPlayed(int limit);

    List<TrackDTO> getMostLiked(int limit);

    List<TrackDTO> getRecentTracks(int limit);

    TrackStatsDTO getStats();

    Map<String, Long> getCategoryStats();

    TrackDTO uploadTrackImage(String id, MultipartFile imageFile);

    byte[] getAudioFile(String fileUrl);

}
