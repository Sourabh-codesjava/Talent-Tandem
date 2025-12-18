package com.talent_tandem.responsedto;

import com.talent_tandem.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSelectionResponse {
    private Long userId;
    private Role role;
    private Boolean hasMentorProfile;
    private Boolean hasLearnerProfile;
    private Integer initialCoins;
    private String message;
}
