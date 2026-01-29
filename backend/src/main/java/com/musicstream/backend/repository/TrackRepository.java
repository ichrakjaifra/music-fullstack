package com.musicstream.backend.repository;

import com.musicstream.backend.models.MusicCategory;
import com.musicstream.backend.models.Track;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackRepository extends JpaRepository<Track, String> {

    Page<Track> findByCategory(MusicCategory category, Pageable pageable);

    List<Track> findByArtistContainingIgnoreCase(String artist);

    List<Track> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT t FROM Track t WHERE " +
            "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Track> search(@Param("query") String query, Pageable pageable);

    List<Track> findTop10ByOrderByPlaysDesc();

    List<Track> findTop10ByOrderByLikesDesc();

    List<Track> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT t.category as category, COUNT(t) as count " +
            "FROM Track t GROUP BY t.category")
    List<Object[]> countByCategory();

    @Query("SELECT COALESCE(SUM(t.plays), 0) FROM Track t")
    Long getTotalPlays();

    @Query("SELECT COALESCE(SUM(t.likes), 0) FROM Track t")
    Long getTotalLikes();

    @Query("SELECT COALESCE(SUM(t.duration), 0) FROM Track t")
    Long getTotalDuration();
}