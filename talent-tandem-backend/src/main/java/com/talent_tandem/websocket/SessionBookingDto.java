package com.talent_tandem.websocket;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SessionBookingDto {
    private Long sessionId;
    private Long mentorId;
    private Long learnerId;
    private String learnerName;
    private String mentorName;
    private String skillName;
    private LocalDateTime scheduledTime;
    private String message;
    private String notificationType; // REQUEST, ACCEPTED, DECLINED, STARTED
    private Boolean actionable; // Indicates if notification has action buttons
    private String agenda; // Session agenda for request notifications
    private Integer durationMinutes; // Session duration
    private String action; // OPEN_FEEDBACK_FORM for feedback notifications
}