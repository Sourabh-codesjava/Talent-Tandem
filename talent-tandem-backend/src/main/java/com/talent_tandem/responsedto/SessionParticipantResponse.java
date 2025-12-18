package com.talent_tandem.responsedto;

import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.enums.ParticipantStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SessionParticipantResponse {

    private Long participantId;
    private Long sessionId;
    private Long userId;
    private String userName;
    private ParticipantRole role;
    private ParticipantStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
}