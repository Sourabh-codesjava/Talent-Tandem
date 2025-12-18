package com.talent_tandem.daoImpl;
import com.talent_tandem.dao.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AvailabilityDaoImpl implements IAvailabilityDao {

    private final IAvailabilityRepository availabilityRepository;

    @Override
    public Optional<Availability> findByUserId(Long userId) {
        return availabilityRepository.findByUserId(userId);
    }

    @Override
    public Availability save(Availability availability) {
        return availabilityRepository.save(availability);
    }
}
