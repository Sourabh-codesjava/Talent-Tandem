package com.talent_tandem.service;

import com.talent_tandem.requestdto.UserLearnSkillRequest;
import com.talent_tandem.responsedto.UserLearnSkillResponse;

import java.util.List;

public interface IUserLearnSkillService {

    UserLearnSkillResponse createLearnSkill(UserLearnSkillRequest request);

    UserLearnSkillResponse getLearnSkill(Long id);

    List<UserLearnSkillResponse> getLearnSkillsByUserId(Long userId);

    void deleteLearnSkill(Long id);
}