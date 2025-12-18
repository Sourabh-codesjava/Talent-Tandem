package com.talent_tandem.responsedto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TagsResponse {

    private Long id;
    private String name;
    private String description;
    private Long skillId;
    private String skillName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
