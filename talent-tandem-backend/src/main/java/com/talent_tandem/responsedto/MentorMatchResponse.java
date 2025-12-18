package com.talent_tandem.responsedto;
import com.talent_tandem.enums.Level;
import com.talent_tandem.enums.PreferedMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorMatchResponse {

    private Long mentorId;
    private String mentorName;
    private String city;
    private String profileImage;
    private Long skillId;
    private Level proficiencyLevel;
    private Integer confidenceScore;
    private PreferedMode preferredMode;
    private String matchExplanation;

}
