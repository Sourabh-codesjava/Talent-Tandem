package com.talent_tandem.responsedto;
import lombok.Data;
import java.util.List;

@Data
public class SkillWithTagsResponse {
    private Long id;
    private String name;
    private List<String> tagNames;
}
