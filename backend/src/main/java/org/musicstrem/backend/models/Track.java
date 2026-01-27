package org.musicstrem.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tracks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer duration; // en secondes

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MusicCategory category;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "cover_color")
    private String coverColor;

    @Column(nullable = false)
    private Integer plays = 0;

    @Column(nullable = false)
    private Integer likes = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "track", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlaylistTrack> playlistTracks = new ArrayList<>();
}

enum MusicCategory {
    POP, ROCK, RAP, JAZZ, CLASSICAL, ELECTRONIC,
    HIPHOP, RNB, COUNTRY, REGGAE, METAL, BLUES, FOLK
}
