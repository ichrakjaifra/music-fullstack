package com.musicstrem.backend.dto;

import com.musicstrem.backend.models.MusicCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTrackRequest {
    private String title;
    private String artist;
    private String description;
    private MusicCategory category;
}