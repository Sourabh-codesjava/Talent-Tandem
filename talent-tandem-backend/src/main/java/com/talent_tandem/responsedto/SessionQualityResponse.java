package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionQualityResponse {
    private Long sessionId;
    private String sessionTitle;
    private String mentorName;
    private String learnerName;
    private String status;
    private Double rating;
    private String feedback;
    private String sessionDate;
    private Boolean needsIntervention;
}
