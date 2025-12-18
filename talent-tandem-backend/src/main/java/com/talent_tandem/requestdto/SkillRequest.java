package com.talent_tandem.requestdto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SkillRequest {
     @NotBlank(message = "Skill name is required")
     @Size(min = 2, max = 100, message = "Skill name must be between 2 and 100 characters")
     private String skillName;
}
