package com.talent_tandem.requestdto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SessionRequest {

    @NotNull(message = "Mentor ID is required")
    private Long mentorId;

    // Optional for group sessions
    private Long learnerId;
    
    // For group sessions - list of learner IDs
    private List<Long> learnerIds;
    
    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotBlank(message = "Agenda is required")
    @Size(max = 500, message = "Agenda must not exceed 500 characters")
    private String agenda;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Minimum duration is 15 minutes")
    @Max(value = 180, message = "Maximum duration is 180 minutes")
    private Integer durationMinutes;

    @Size(max = 1000, message = "Learning outcomes must not exceed 1000 characters")
    private String learningOutcomes;
    
    // Session type: ONE_TO_ONE, GROUP
    private String sessionType = "ONE_TO_ONE";
    
    // Maximum participants for group sessions
    private Integer maxParticipants;
}