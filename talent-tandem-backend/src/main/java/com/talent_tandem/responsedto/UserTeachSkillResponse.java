package com.talent_tandem.responsedto;

import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserTeachSkillResponse {

    private Long teachId;
    private Long userId;
    private String userName;

    private Long skillId;
    private String skillName;

    private Level proficiencyLevel;
    private PreferedMode preferredMode;

    private Integer confidenceScore;

    // Availability
    private String dayOfWeek;
    private String startTime;
    private String endTime;

    private String createdAt;
}
