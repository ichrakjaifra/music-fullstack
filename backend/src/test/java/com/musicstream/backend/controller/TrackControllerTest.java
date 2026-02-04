package com.musicstream.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicstream.backend.dto.TrackDTO;
import com.musicstream.backend.models.MusicCategory;
import com.musicstream.backend.service.TrackService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TrackController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for controller tests
class TrackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrackService trackService;

    @Autowired
    private ObjectMapper objectMapper;

    private TrackDTO trackDTO;

    @BeforeEach
    void setUp() {
        trackDTO = TrackDTO.builder()
                .id("1")
                .title("Test Track")
                .artist("Test Artist")
                .category(MusicCategory.POP)
                .build();
    }

    @Test
    @WithMockUser
    void getTrack_ShouldReturnTrack() throws Exception {
        // Arrange
        when(trackService.getTrack("1")).thenReturn(trackDTO);

        // Act & Assert
        mockMvc.perform(get("/api/tracks/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.title").value("Test Track"));
    }
}
