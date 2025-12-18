package com.talent_tandem.requestdto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TagsRequest {

    @NotBlank(message = "Tag name is required")
    @Size(min = 2, max = 50, message = "Tag name must be between 2 and 50 characters")
    private String name;
    
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
    
    @NotNull(message = "Skill ID is required")
    private Long skillId;
}
