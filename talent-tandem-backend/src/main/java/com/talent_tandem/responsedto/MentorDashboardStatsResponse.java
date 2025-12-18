package com.talent_tandem.responsedto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorDashboardStatsResponse {
    private Integer teachingSkillsCount;
    private Integer pendingRequestsCount;
    private Integer sessionsTaughtCount;
    private Integer hoursTaught;
    private List<SessionStatusCount> sessionStatusData;
    private List<SkillDistribution> skillsDistribution;
    private List<DurationAnalysis> durationAnalysis;
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionStatusCount {
        private String status;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDistribution {
        private String name;
        private Long value;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DurationAnalysis {
        private String duration;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String skillName;
        private String learnerName;
        private Integer durationMinutes;
        private String status;
    }
}
