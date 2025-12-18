package com.talent_tandem.requestdto;

import com.talent_tandem.enums.Day;
import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserTeachSkillRequest {

    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Proficiency level is required")
    private Level proficiencyLevel;
    
    @NotNull(message = "Preferred mode is required")
    private PreferedMode preferredMode;

    @NotNull(message = "Confidence score is required")
    @Min(value = 1, message = "Confidence score must be at least 1")
    @Max(value = 10, message = "Confidence score must not exceed 10")
    private Integer confidenceScore;

    @NotNull(message = "Day of week is required")
    private Day dayOfWeek;
    
    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Start time must be in HH:MM format")
    private String startTime;
    
    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "End time must be in HH:MM format")
    private String endTime;
}
