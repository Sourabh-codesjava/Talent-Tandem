package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearnerDashboardStatsResponse {
    private Integer learningSkillsCount;
    private Integer upcomingSessionsCount;
    private Integer completedSessionsCount;
    private Double hoursLearned;
    private List<SkillProgress> skillProgressList;
    private List<SessionStatusCount> sessionStatusCounts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillProgress {
        private String skill;
        private Integer sessions;
        private Double hours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionStatusCount {
        private String status;
        private Long count;
    }
}
