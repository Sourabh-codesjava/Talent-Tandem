package com.talent_tandem.responsedto;

import com.talent_tandem.enums.SessionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SessionWithParticipantsResponse {

    private Long sessionId;
    private Long mentorId;
    private String mentorName;
    private String agenda;
    private SessionStatus status;
    private LocalDateTime scheduledTime;
    private Integer durationMinutes;
    private String learningOutcomes;
    private LocalDateTime createdAt;
    private List<SessionParticipantResponse> participants;
    private Integer totalParticipants;
}