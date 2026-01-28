package com.musicstrem.backend.controller;

import com.musicstrem.backend.dto.*;
import com.musicstrem.backend.service.TrackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
@Tag(name = "Tracks", description = "Track management endpoints")
@CrossOrigin(origins = "http://localhost:4200")
public class TrackController {

    private final TrackService trackService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new track")
    public ResponseEntity<TrackDTO> createTrack(
            @RequestPart("data") @Valid CreateTrackRequest request,
            @RequestPart("audioFile") MultipartFile audioFile,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        TrackDTO track = trackService.createTrack(request, audioFile, imageFile);
        return ResponseEntity.ok(track);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get track by ID")
    public ResponseEntity<TrackDTO> getTrack(@PathVariable String id) {
        return ResponseEntity.ok(trackService.getTrack(id));
    }

    @GetMapping
    @Operation(summary = "Get all tracks with pagination")
    public ResponseEntity<Page<TrackDTO>> getAllTracks(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trackService.getAllTracks(pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update track")
    public ResponseEntity<TrackDTO> updateTrack(
            @PathVariable String id,
            @RequestBody @Valid UpdateTrackRequest request) {
        return ResponseEntity.ok(trackService.updateTrack(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete track")
    public ResponseEntity<Void> deleteTrack(@PathVariable String id) {
        trackService.deleteTrack(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/play")
    @Operation(summary = "Increment play count")
    public ResponseEntity<Void> incrementPlays(@PathVariable String id) {
        trackService.incrementPlays(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like a track")
    public ResponseEntity<TrackDTO> likeTrack(@PathVariable String id) {
        return ResponseEntity.ok(trackService.likeTrack(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search tracks")
    public ResponseEntity<Page<TrackDTO>> searchTracks(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trackService.searchTracks(q, pageable));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get tracks by category")
    public ResponseEntity<List<TrackDTO>> getTracksByCategory(
            @PathVariable String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trackService.getTracksByCategory(category, pageable));
    }

    @GetMapping("/most-played")
    @Operation(summary = "Get most played tracks")
    public ResponseEntity<List<TrackDTO>> getMostPlayed(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trackService.getMostPlayed(limit));
    }

    @GetMapping("/most-liked")
    @Operation(summary = "Get most liked tracks")
    public ResponseEntity<List<TrackDTO>> getMostLiked(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trackService.getMostLiked(limit));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent tracks")
    public ResponseEntity<List<TrackDTO>> getRecentTracks(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(trackService.getRecentTracks(limit));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get track statistics")
    public ResponseEntity<TrackStatsDTO> getStats() {
        return ResponseEntity.ok(trackService.getStats());
    }

    @GetMapping("/stats/categories")
    @Operation(summary = "Get category statistics")
    public ResponseEntity<Map<String, Long>> getCategoryStats() {
        return ResponseEntity.ok(trackService.getCategoryStats());
    }

    @PostMapping("/{id}/image")
    @Operation(summary = "Upload track image")
    public ResponseEntity<TrackDTO> uploadImage(
            @PathVariable String id,
            @RequestPart("image") MultipartFile imageFile) {
        return ResponseEntity.ok(trackService.uploadTrackImage(id, imageFile));
    }

    @GetMapping("/stream/{id}")
    @Operation(summary = "Stream audio file")
    public ResponseEntity<Resource> streamAudio(@PathVariable String id) {
        TrackDTO track = trackService.getTrack(id);
        byte[] audioData = trackService.getAudioFile(track.getFileUrl());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(track.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + track.getTitle() + "\"")
                .body(new ByteArrayResource(audioData));
    }
}
