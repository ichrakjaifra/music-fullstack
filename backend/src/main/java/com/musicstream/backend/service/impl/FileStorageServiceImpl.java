package com.musicstream.backend.service.impl;

import com.musicstream.backend.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;


@Service
@Slf4j
class FileStorageServiceImpl implements FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("audio"));
            Files.createDirectories(rootLocation.resolve("images"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String saveAudioFile(MultipartFile file) {
        return saveFile(file, "audio");
    }

    @Override
    public String saveImageFile(MultipartFile file) {
        return saveFile(file, "images");
    }

    private String saveFile(MultipartFile file, String subdirectory) {
        try {
            String filename = UUID.randomUUID().toString() +
                    getFileExtension(file.getOriginalFilename());
            Path destination = rootLocation.resolve(subdirectory).resolve(filename);

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + subdirectory + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            String filename = fileUrl.replace("/uploads/", "");
            Path filePath = rootLocation.resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
        }
    }

    @Override
    public byte[] getFile(String fileUrl) {
        try {
            String filename = fileUrl.replace("/uploads/", "");
            Path filePath = rootLocation.resolve(filename);
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastIndex = filename.lastIndexOf('.');
        return lastIndex > 0 ? filename.substring(lastIndex) : "";
    }
}