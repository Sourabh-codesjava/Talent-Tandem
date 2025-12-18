package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillTagResponse {

    private String skillName;
    private List<String> subTags;
}
