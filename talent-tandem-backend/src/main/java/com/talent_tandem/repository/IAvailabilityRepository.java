package com.talent_tandem.repository;
import com.talent_tandem.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IAvailabilityRepository extends JpaRepository<Availability,Long> {
    Optional<Availability> findByUserId(Long userId);
}
