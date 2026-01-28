package com.musicstrem.backend.service.impl;

import com.musicstrem.backend.dto.*;
import com.musicstrem.backend.mapper.TrackMapper;
import com.musicstrem.backend.models.Track;
import com.musicstrem.backend.repository.TrackRepository;
import com.musicstrem.backend.service.FileStorageService;
import com.musicstrem.backend.service.TrackService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackServiceImpl implements TrackService {

    private final TrackRepository trackRepository;
    private final TrackMapper trackMapper;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public TrackDTO createTrack(CreateTrackRequest request, MultipartFile audioFile, MultipartFile imageFile) {
        // Validate audio file
        validateAudioFile(audioFile);

        // Save audio file
        String audioUrl = fileStorageService.saveAudioFile(audioFile);

        // Save image file if provided
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            validateImageFile(imageFile);
            imageUrl = fileStorageService.saveImageFile(imageFile);
        }

        // Calculate audio duration (simplified - in real app use audio metadata)
        int duration = calculateDuration(audioFile);

        // Generate cover color
        String coverColor = generateRandomColor();

        // Create track entity
        Track track = Track.builder()
                .title(request.getTitle())
                .artist(request.getArtist())
                .description(request.getDescription())
                .category(request.getCategory())
                .fileUrl(audioUrl)
                .fileSize(audioFile.getSize())
                .fileType(audioFile.getContentType())
                .coverImage(imageUrl)
                .coverColor(coverColor)
                .duration(duration)
                .plays(0)
                .likes(0)
                .build();

        Track savedTrack = trackRepository.save(track);
        return trackMapper.toDTO(savedTrack);
    }

    @Override
    public TrackDTO getTrack(String id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));
        return trackMapper.toDTO(track);
    }

    @Override
    public Page<TrackDTO> getAllTracks(Pageable pageable) {
        return trackRepository.findAll(pageable)
                .map(trackMapper::toDTO);
    }

    @Override
    @Transactional
    public TrackDTO updateTrack(String id, UpdateTrackRequest request) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));

        track.setTitle(request.getTitle());
        track.setArtist(request.getArtist());
        track.setDescription(request.getDescription());
        track.setCategory(request.getCategory());

        Track updatedTrack = trackRepository.save(track);
        return trackMapper.toDTO(updatedTrack);
    }

    @Override
    @Transactional
    public void deleteTrack(String id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));

        // Delete associated files
        fileStorageService.deleteFile(track.getFileUrl());
        if (track.getCoverImage() != null) {
            fileStorageService.deleteFile(track.getCoverImage());
        }

        trackRepository.delete(track);
    }

    @Override
    @Transactional
    public void incrementPlays(String id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));
        track.setPlays(track.getPlays() + 1);
        trackRepository.save(track);
    }

    @Override
    @Transactional
    public TrackDTO likeTrack(String id) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));
        track.setLikes(track.getLikes() + 1);
        Track updatedTrack = trackRepository.save(track);
        return trackMapper.toDTO(updatedTrack);
    }

    @Override
    public Page<TrackDTO> searchTracks(String query, Pageable pageable) {
        return trackRepository.search(query, pageable)
                .map(trackMapper::toDTO);
    }

    @Override
    public List<TrackDTO> getTracksByCategory(String category, Pageable pageable) {
        return trackRepository.findByCategory(
                        com.musicstrem.backend.models.MusicCategory.valueOf(category.toUpperCase()),
                        pageable
                ).stream()
                .map(trackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrackDTO> getMostPlayed(int limit) {
        return trackRepository.findTop10ByOrderByPlaysDesc().stream()
                .limit(limit)
                .map(trackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrackDTO> getMostLiked(int limit) {
        return trackRepository.findTop10ByOrderByLikesDesc().stream()
                .limit(limit)
                .map(trackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrackDTO> getRecentTracks(int limit) {
        return trackRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .limit(limit)
                .map(trackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TrackStatsDTO getStats() {
        long totalTracks = trackRepository.count();
        long totalDuration = trackRepository.getTotalDuration();
        long totalPlays = trackRepository.getTotalPlays();
        long totalLikes = trackRepository.getTotalLikes();

        return TrackStatsDTO.builder()
                .totalTracks(totalTracks)
                .totalDuration(totalDuration)
                .totalPlays(totalPlays)
                .totalLikes(totalLikes)
                .build();
    }

    @Override
    public Map<String, Long> getCategoryStats() {
        return trackRepository.countByCategory().stream()
                .collect(Collectors.toMap(
                        obj -> ((com.musicstrem.backend.models.MusicCategory) obj[0]).name(),
                        obj -> (Long) obj[1]
                ));
    }

    @Override
    @Transactional
    public TrackDTO uploadTrackImage(String id, MultipartFile imageFile) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));

        validateImageFile(imageFile);

        // Delete old image if exists
        if (track.getCoverImage() != null) {
            fileStorageService.deleteFile(track.getCoverImage());
        }

        // Save new image
        String imageUrl = fileStorageService.saveImageFile(imageFile);
        track.setCoverImage(imageUrl);

        Track updatedTrack = trackRepository.save(track);
        return trackMapper.toDTO(updatedTrack);
    }

    private void validateAudioFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required");
        }

        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException("Audio file size must be less than 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("audio/")) {
            throw new IllegalArgumentException("File must be an audio file");
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        if (file.getSize() > 2 * 1024 * 1024) { // 2MB
            throw new IllegalArgumentException("Image file size must be less than 2MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image file");
        }
    }

    private int calculateDuration(MultipartFile audioFile) {
        // In a real application, you would use a library like JAudioTagger
        // or Tika to extract audio metadata
        // For now, return a default value
        return 180; // 3 minutes default
    }

    private String generateRandomColor() {
        String[] colors = {
                "#E50914", "#B81D24", "#FF4D4D", "#FF6B6B", "#FF5252",
                "#121212", "#1E1E1E", "#2D2D2D", "#3A3A3A", "#4A4A4A"
        };
        return colors[(int) (Math.random() * colors.length)];
    }

    @Override
    public byte[] getAudioFile(String fileUrl) {
        return fileStorageService.getFile(fileUrl);
    }
}