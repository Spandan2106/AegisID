package com.AegisID.backend.asset.repsitory;

import com.AegisID.backend.asset.entity.DigitalAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DigitalAssetRepository
        extends JpaRepository<DigitalAsset, Long> {

    Optional<DigitalAsset> findByAssetId(String assetId);

    List<DigitalAsset> findByOwnerId(Long ownerId);

    boolean existsByAssetId(String assetId);
}