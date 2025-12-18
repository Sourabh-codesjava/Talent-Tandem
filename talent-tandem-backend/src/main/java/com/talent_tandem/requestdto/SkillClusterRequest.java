package com.talent_tandem.requestdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillClusterRequest {
    
    @NotBlank(message = "Cluster name is required")
    private String clusterName;
    
    @NotEmpty(message = "At least one skill ID is required")
    private List<Long> skillIds;
    
    private String description;
}