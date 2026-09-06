package com.AegisID.backend.asset.service;

import com.AegisID.backend.asset.entity.DigitalAsset;
import com.AegisID.backend.asset.repsitory.DigitalAssetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;

@Service
public class DigitalAssetService {

    private final DigitalAssetRepository assetRepository;

    @Value("${aegisid.storage.asset-directory:./assets}")
    private String assetDirectory;


    public DigitalAssetService(DigitalAssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }


    @Transactional
    public DigitalAsset createAsset(
            String assetName,
            String assetType,
            String description,
            Long ownerId,
            MultipartFile file
    ) throws IOException {

        // ----------------------------------------
        // 1. Validate input
        // ----------------------------------------

        if (assetName == null || assetName.isBlank()) {
            throw new IllegalArgumentException("Asset name is required");
        }

        if (assetType == null || assetType.isBlank()) {
            throw new IllegalArgumentException("Asset type is required");
        }

        if (ownerId == null) {
            throw new IllegalArgumentException("Owner ID is required");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Asset file is required");
        }


        // ----------------------------------------
        // 2. Generate unique Asset ID
        // ----------------------------------------

        String assetId = generateAssetId();


        // ----------------------------------------
        // 3. Get safe original filename
        // ----------------------------------------

        String originalFileName =
                sanitizeFileName(file.getOriginalFilename());


        // ----------------------------------------
        // 4. Get file extension
        // ----------------------------------------

        String fileFormat =
                getFileExtension(originalFileName);


        // ----------------------------------------
        // 5. Create storage root
        // ----------------------------------------

        Path rootPath = Paths
                .get(assetDirectory)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(rootPath);


        // ----------------------------------------
        // 6. Create unique asset directory
        // ----------------------------------------

        Path assetFolder = rootPath
                .resolve(assetId)
                .normalize();


        if (!assetFolder.startsWith(rootPath)) {
            throw new SecurityException("Invalid asset directory");
        }


        Files.createDirectories(assetFolder);


        // ----------------------------------------
        // 7. Generate unique stored filename
        // ----------------------------------------

        String storedFileName = assetId;

        if (!fileFormat.isEmpty()) {
            storedFileName += "." + fileFormat;
        }


        // ----------------------------------------
        // 8. Create final file path
        // ----------------------------------------

        Path targetFile = assetFolder
                .resolve(storedFileName)
                .normalize();


        if (!targetFile.startsWith(assetFolder)) {
            throw new SecurityException("Invalid file path");
        }


        // ----------------------------------------
        // 9. Save actual uploaded file
        // ----------------------------------------

        try {

            try (InputStream inputStream = file.getInputStream()) {

                Files.copy(
                        inputStream,
                        targetFile,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }


            // ----------------------------------------
            // 10. Calculate SHA-256
            // ----------------------------------------

            String assetHash =
                    calculateSha256(targetFile);


            // ----------------------------------------
            // 11. Prepare database entity
            // ----------------------------------------

            DigitalAsset asset = new DigitalAsset();

            asset.setAssetId(assetId);
            asset.setAssetName(assetName);
            asset.setAssetType(assetType);
            asset.setDescription(description);
            asset.setOwnerId(ownerId);

            asset.setAssetHash(assetHash);

            asset.setOriginalFileName(originalFileName);
            asset.setStoredFileName(storedFileName);

            asset.setFileFormat(
                    fileFormat.isEmpty()
                            ? null
                            : fileFormat.toUpperCase()
            );

            asset.setContentType(file.getContentType());
            asset.setFileSize(file.getSize());


            // ----------------------------------------
            // 12. Save relative storage paths
            // ----------------------------------------

            String relativeFolder =
                    "assets/" + assetId + "/";

            String relativePath =
                    relativeFolder + storedFileName;


            asset.setStorageFolder(relativeFolder);
            asset.setStoragePath(relativePath);


            // ----------------------------------------
            // 13. Correct DB status
            // ----------------------------------------

            asset.setStatus("ACTIVE");


            // ----------------------------------------
            // 14. Save metadata to MySQL
            // ----------------------------------------

            return assetRepository.save(asset);

        } catch (Exception e) {

            // ----------------------------------------
            // 15. Cleanup file if DB save fails
            // ----------------------------------------

            try {

                if (Files.exists(assetFolder)) {

                    Files.walk(assetFolder)
                            .sorted((a, b) ->
                                    b.compareTo(a))
                            .forEach(path -> {

                                try {
                                    Files.deleteIfExists(path);
                                } catch (IOException ignored) {
                                }

                            });
                }

            } catch (IOException ignored) {
            }


            throw e;
        }
    }


    // ----------------------------------------
    // Get all assets
    // ----------------------------------------

    public List<DigitalAsset> getAllAssets() {

        return assetRepository.findAll();
    }


    // ----------------------------------------
    // Get asset by Asset ID
    // ----------------------------------------

    public DigitalAsset getByAssetId(String assetId) {

        return assetRepository
                .findByAssetId(assetId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Asset not found: " + assetId
                        )
                );
    }


    // ----------------------------------------
    // Get assets by owner
    // ----------------------------------------

    public List<DigitalAsset> getByOwnerId(Long ownerId) {

        return assetRepository.findByOwnerId(ownerId);
    }


    // ----------------------------------------
    // Get physical file
    // ----------------------------------------

    public Path getAssetFile(String assetId) {

        DigitalAsset asset =
                getByAssetId(assetId);


        Path rootPath = Paths
                .get(assetDirectory)
                .toAbsolutePath()
                .normalize();


        Path assetFolder = rootPath
                .resolve(asset.getAssetId())
                .normalize();


        Path filePath = assetFolder
                .resolve(asset.getStoredFileName())
                .normalize();


        if (!filePath.startsWith(assetFolder)) {
            throw new SecurityException(
                    "Invalid asset path"
            );
        }


        if (!Files.exists(filePath)
                || !Files.isRegularFile(filePath)) {

            throw new RuntimeException(
                    "Stored asset file not found"
            );
        }


        return filePath;
    }


    // ----------------------------------------
    // Verify file integrity
    // ----------------------------------------

    public boolean verifyAsset(String assetId) {

        DigitalAsset asset =
                getByAssetId(assetId);


        Path filePath =
                getAssetFile(assetId);


        try {

            String currentHash =
                    calculateSha256(filePath);


            return currentHash.equalsIgnoreCase(
                    asset.getAssetHash()
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to verify asset",
                    e
            );
        }
    }


    // ----------------------------------------
    // Generate Asset ID
    // ----------------------------------------

    private String generateAssetId() {

        String assetId;

        do {

            String randomPart =
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 8)
                            .toUpperCase();


            assetId = "AST-" + randomPart;

        } while (
                assetRepository.existsByAssetId(assetId)
        );


        return assetId;
    }


    // ----------------------------------------
    // Sanitize filename
    // ----------------------------------------

    private String sanitizeFileName(String fileName) {

        if (fileName == null || fileName.isBlank()) {

            return "uploaded-file";
        }


        return Paths
                .get(fileName)
                .getFileName()
                .toString();
    }


    // ----------------------------------------
    // Get extension
    // ----------------------------------------

    private String getFileExtension(String fileName) {

        int index =
                fileName.lastIndexOf('.');


        if (index <= 0
                || index == fileName.length() - 1) {

            return "";
        }


        return fileName
                .substring(index + 1)
                .toLowerCase();
    }


    // ----------------------------------------
    // Calculate SHA-256
    // ----------------------------------------

    private String calculateSha256(Path file)
            throws IOException {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );


            try (InputStream inputStream =
                         Files.newInputStream(file)) {

                byte[] buffer =
                        new byte[8192];

                int bytesRead;


                while (
                        (bytesRead =
                                inputStream.read(buffer))
                                != -1
                ) {

                    digest.update(
                            buffer,
                            0,
                            bytesRead
                    );
                }
            }


            byte[] hash =
                    digest.digest();


            StringBuilder result =
                    new StringBuilder();


            for (byte b : hash) {

                result.append(
                        String.format(
                                "%02x",
                                b
                        )
                );
            }


            return result.toString();

        } catch (NoSuchAlgorithmException e) {

            throw new RuntimeException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }
}