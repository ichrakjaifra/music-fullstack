package com.musicstrem.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String saveAudioFile(MultipartFile file);
    String saveImageFile(MultipartFile file);
    void deleteFile(String fileUrl);
    byte[] getFile(String fileUrl);
}

