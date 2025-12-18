package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsResponseDTO {
    private Long learningTotalMinutes;
    private Long teachingTotalMinutes;
    private Long sessionsAttended;
    private Long sessionsConducted;
}
