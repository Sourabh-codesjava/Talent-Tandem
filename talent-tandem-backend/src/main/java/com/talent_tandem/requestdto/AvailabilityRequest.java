package com.talent_tandem.requestdto;

import com.talent_tandem.enums.Day;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AvailabilityRequest {

    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Day of week is required")
    private Day dayOfWeek;
    
    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Start time must be in HH:MM format")
    private String startTime;
    
    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "End time must be in HH:MM format")
    private String endTime;
}
