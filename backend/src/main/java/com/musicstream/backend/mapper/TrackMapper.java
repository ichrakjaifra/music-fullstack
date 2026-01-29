package com.musicstream.backend.mapper;

import com.musicstream.backend.dto.TrackDTO;
import com.musicstream.backend.models.Track;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TrackMapper {

    TrackDTO toDTO(Track track);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "plays", constant = "0")
    @Mapping(target = "likes", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "playlistTracks", ignore = true)
    Track toEntity(TrackDTO trackDTO);
}
