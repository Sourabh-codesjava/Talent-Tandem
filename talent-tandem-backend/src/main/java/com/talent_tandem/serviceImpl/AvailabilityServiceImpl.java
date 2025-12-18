package com.talent_tandem.serviceImpl;
import com.talent_tandem.dao.IAvailabilityDao;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.UserNotFoundException;
import com.talent_tandem.model.Availability;
import com.talent_tandem.model.User;
import com.talent_tandem.requestdto.AvailabilityRequest;
import com.talent_tandem.responsedto.AvailabilityResponse;
import com.talent_tandem.service.IAvailibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
class AvailabilityServiceImpl implements IAvailibilityService {

    private final IAvailabilityDao availabilityDao;
    private final IUserDao userDao;

    @Override
    public AvailabilityResponse saveAvailability(AvailabilityRequest request) {

        User user = userDao.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + request.getUserId()));

        Availability availability = availabilityDao.findByUserId(user.getId())
                .orElse(new Availability());

        availability.setUser(user);
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());

        Availability saved = availabilityDao.save(availability);

        AvailabilityResponse response = new AvailabilityResponse();
        response.setId(saved.getId());
        response.setUserId(user.getId());
        response.setUserName(user.getUsername());
        response.setDayOfWeek(saved.getDayOfWeek().name());
        response.setStartTime(saved.getStartTime());
        response.setEndTime(saved.getEndTime());

        return response;
    }

    @Override
    public AvailabilityResponse getAvailabilityByUser(Long userId) {

        Availability availability = availabilityDao.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found for userId: " + userId));

        AvailabilityResponse response = new AvailabilityResponse();
        response.setId(availability.getId());
        response.setUserId(availability.getUser().getId());
        response.setUserName(availability.getUser().getUsername());
        response.setDayOfWeek(availability.getDayOfWeek().name());
        response.setStartTime(availability.getStartTime());
        response.setEndTime(availability.getEndTime());

        return response;
    }
}
