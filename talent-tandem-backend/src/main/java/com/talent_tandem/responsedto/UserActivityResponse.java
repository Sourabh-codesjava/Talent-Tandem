package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserActivityResponse {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Long sessionsAsTeacher;
    private Long sessionsAsLearner;
    private Double averageRatingAsTeacher;
    private Boolean isActive;
    private String lastActiveDate;
}
