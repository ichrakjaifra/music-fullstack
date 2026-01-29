package com.musicstream.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "playlist_tracks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PlaylistTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(name = "position")
    private Integer position;
}
