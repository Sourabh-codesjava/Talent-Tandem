package com.talent_tandem.responsedto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillResponse {

      private Long id;
      private String name;
      private String skillName;
      private LocalDateTime createdAt;
      private LocalDateTime updatedAt;
}
