package com.talent_tandem.requestdto;
import com.talent_tandem.enums.Day;
import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchRequest {

    @NotNull(message = "Skill ID is required")
    private Long skillId;
    
    @NotNull(message = "Preferred mode is required")
    private PreferedMode preferredMode;
    
    @NotNull(message = "Priority level is required")
    private Level priorityLevel;
    
    @NotNull(message = "Day of week is required")
    private Day dayOfWeek;
    
    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Start time must be in HH:MM format")
    private String startTime;
    
    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "End time must be in HH:MM format")
    private String endTime;
    
    @Size(max = 255, message = "Profile image URL must not exceed 255 characters")
    private String profileImage;
}
