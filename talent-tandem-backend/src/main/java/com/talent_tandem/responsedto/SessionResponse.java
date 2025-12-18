package com.talent_tandem.responsedto;
import com.talent_tandem.enums.SessionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SessionResponse {

    private Long sessionId;
    private Long mentorId;
    private String mentorName;
    private AvailabilityResponse mentorAvailability;
    private Long learnerId;
    private String learnerName;
    private Long skillId;
    private String skillName;
    private String agenda;
    private SessionStatus status;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String learningOutcomes;
    private LocalDateTime createdAt;
}