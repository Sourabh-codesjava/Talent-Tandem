package com.talent_tandem.requestdto;

import com.talent_tandem.enums.Day;
import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLearnSkillRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Priority level is required")
    private Level priorityLevel;

    @NotNull(message = "Preferred mode is required")
    private PreferedMode preferredMode;

    @NotNull(message = "Day is required")
    private Day dayOfWeek;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;
}
