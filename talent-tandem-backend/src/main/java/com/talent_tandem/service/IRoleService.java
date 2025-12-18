package com.talent_tandem.service;

import com.talent_tandem.requestdto.RoleSelectionRequest;
import com.talent_tandem.responsedto.RoleSelectionResponse;

public interface IRoleService {
    RoleSelectionResponse selectRole(RoleSelectionRequest request);
    RoleSelectionResponse becomeMentor(Long userId);
}
