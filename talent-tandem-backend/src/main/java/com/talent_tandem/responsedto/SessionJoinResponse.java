package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionJoinResponse {
    private Long sessionId;
    private Integer learnerCoins;
    private Integer mentorCoins;
    private Boolean forceBecomeTeacher;
    private String message;
}
