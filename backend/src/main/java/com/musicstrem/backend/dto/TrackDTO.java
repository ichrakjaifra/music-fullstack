package com.musicstrem.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.musicstrem.backend.models.MusicCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackDTO {
    private String id;
    private String title;
    private String artist;
    private String description;
    private Integer duration;
    private MusicCategory category;
    private String fileUrl;
    private Long fileSize;
    private String fileType;
    private String coverImage;
    private String coverColor;
    private Integer plays;
    private Integer likes;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CreateTrackRequest {
    private String title;
    private String artist;
    private String description;
    private MusicCategory category;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class UpdateTrackRequest {
    private String title;
    private String artist;
    private String description;
    private MusicCategory category;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class TrackStatsDTO {
    private Long totalTracks;
    private Long totalDuration;
    private Long totalPlays;
    private Long totalLikes;
}
