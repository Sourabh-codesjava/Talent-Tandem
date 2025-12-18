package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long totalLearners;
    private Long totalTeachers;
    private Long totalSessions;
    private Long activeSessions;
    private Long completedSessions;
    private Long totalSkills;
    private Double averageSessionRating;
    private Long totalFeedbacks;
}