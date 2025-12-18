package com.talent_tandem.dao;
import com.talent_tandem.model.*;
import java.util.Optional;

public interface IAvailabilityDao {

    Optional<Availability> findByUserId(Long userId);

    Availability save(Availability availability);
}
