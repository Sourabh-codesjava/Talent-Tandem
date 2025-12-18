package com.talent_tandem.service;
import com.talent_tandem.requestdto.AvailabilityRequest;
import com.talent_tandem.responsedto.AvailabilityResponse;

public interface IAvailibilityService {
    public  AvailabilityResponse saveAvailability(AvailabilityRequest request);
    public  AvailabilityResponse getAvailabilityByUser(Long userId);
}