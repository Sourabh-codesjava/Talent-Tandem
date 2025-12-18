package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillWithUsersResponse {
    private Long skillId;
    private String skillName;
    private Long teacherCount;
    private Long learnerCount;
    private Long totalUsers;
}
