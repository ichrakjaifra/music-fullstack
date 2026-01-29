package com.musicstream.backend.dto;

import com.musicstream.backend.models.MusicCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrackRequest {
    private String title;
    private String artist;
    private String description;
    private MusicCategory category;
}