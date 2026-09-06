package com.AegisID.backend.asset.controller;

import com.AegisID.backend.asset.entity.DigitalAsset;
import com.AegisID.backend.asset.service.DigitalAssetService;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class DigitalAssetController {

    private final DigitalAssetService assetService;


    public DigitalAssetController(
            DigitalAssetService assetService
    ) {
        this.assetService = assetService;
    }


    // ========================================
    // CREATE / UPLOAD ASSET
    // ========================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<DigitalAsset> createAsset(

            @RequestParam String assetName,

            @RequestParam String assetType,

            @RequestParam(required = false)
            String description,

            @RequestParam Long ownerId,

            @RequestParam("file")
            MultipartFile file

    ) throws Exception {


        DigitalAsset asset =
                assetService.createAsset(
                        assetName,
                        assetType,
                        description,
                        ownerId,
                        file
                );


        return ResponseEntity
                .status(201)
                .body(asset);
    }


    // ========================================
    // GET ALL ASSETS
    // ========================================

    @GetMapping
    public ResponseEntity<List<DigitalAsset>>
    getAllAssets() {

        return ResponseEntity.ok(
                assetService.getAllAssets()
        );
    }


    // ========================================
    // GET ASSET BY ASSET ID
    // ========================================

    @GetMapping("/asset-id/{assetId}")
    public ResponseEntity<DigitalAsset>
    getAssetById(
            @PathVariable String assetId
    ) {

        return ResponseEntity.ok(
                assetService.getByAssetId(assetId)
        );
    }


    // ========================================
    // GET ASSETS BY OWNER
    // ========================================

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<DigitalAsset>>
    getAssetsByOwner(
            @PathVariable Long ownerId
    ) {

        return ResponseEntity.ok(
                assetService.getByOwnerId(ownerId)
        );
    }


    // ========================================
    // VIEW / DOWNLOAD ACTUAL FILE
    // ========================================

    @GetMapping("/asset-id/{assetId}/file")
    public ResponseEntity<Resource>
    getAssetFile(
            @PathVariable String assetId
    ) throws Exception {


        Path path =
                assetService.getAssetFile(assetId);


        Resource resource =
                new FileSystemResource(path);


        String contentType =
                Files.probeContentType(path);


        if (contentType == null) {

            contentType =
                    MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }


        return ResponseEntity.ok()

                .contentType(
                        MediaType.parseMediaType(
                                contentType
                        )
                )

                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" +
                                path.getFileName() +
                                "\""
                )

                .body(resource);
    }


    // ========================================
    // VERIFY FILE
    // ========================================

    @GetMapping("/asset-id/{assetId}/verify")
    public ResponseEntity<Map<String, Object>>
    verifyAsset(
            @PathVariable String assetId
    ) {


        DigitalAsset asset =
                assetService.getByAssetId(assetId);


        boolean verified =
                assetService.verifyAsset(assetId);


        return ResponseEntity.ok(
                Map.of(
                        "assetId",
                        asset.getAssetId(),

                        "verified",
                        verified,

                        "status",
                        verified
                                ? "INTEGRITY_VERIFIED"
                                : "INTEGRITY_FAILED",

                        "storedHash",
                        asset.getAssetHash()
                )
        );
    }
}