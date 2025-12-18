package com.talent_tandem.responsedto;
import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserLearnSkillResponse {

    private Long id;
    private Long userId;
    private Long skillId;
    private String skillName;
    private Level priorityLevel;
    private PreferedMode preferredMode;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String createdAt;
}
