package com.talent_tandem.requestdto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIRulesUpdateRequest {
    
    private Double skillMatchThreshold;
    private Double availabilityMatchWeight;
    private Double ratingWeight;
    private Double experienceWeight;
    private Integer maxMatchingDistance;
    private Boolean enableLocationMatching;
    private Map<String, Object> customRules;
}