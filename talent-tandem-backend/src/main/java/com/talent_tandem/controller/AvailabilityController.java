package com.talent_tandem.controller;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.service.IAvailibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final IAvailibilityService availabilityService;

    @PostMapping("/add")
    public ResponseEntity<AvailabilityResponse> addAvailability(
            @RequestBody AvailabilityRequest request) {

        return ResponseEntity.ok(availabilityService.saveAvailability(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<AvailabilityResponse> getAvailabilityByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(availabilityService.getAvailabilityByUser(userId));
    }
}
