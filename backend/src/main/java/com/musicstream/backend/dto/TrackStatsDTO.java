package com.musicstream.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackStatsDTO {
    private Long totalTracks;
    private Long totalDuration;
    private Long totalPlays;
    private Long totalLikes;
}