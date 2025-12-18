package com.talent_tandem.websocket;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MatchNotificationDto {
    @NotNull(message = "Learner ID is required")
    private Long learnerId;
    
    @NotNull(message = "Mentor ID is required")
    private Long mentorId;
    
    @NotBlank(message = "Mentor name is required")
    @Size(max = 100, message = "Mentor name must not exceed 100 characters")
    private String mentorName;
    
    @NotBlank(message = "Skill name is required")
    @Size(max = 100, message = "Skill name must not exceed 100 characters")
    private String skillName;
    
    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;
}