package com.talent_tandem.service;

import com.talent_tandem.requestdto.MatchRequest;
import com.talent_tandem.requestdto.UserTeachSkillRequest;
import com.talent_tandem.responsedto.UserTeachSkillResponse;
import com.talent_tandem.responsedto.MentorMatchResponse;

import java.util.List;

public interface IUserTeachSkillService {

    UserTeachSkillResponse addTeachSkill(UserTeachSkillRequest request);
    List<UserTeachSkillResponse> addBulkTeachSkills(List<UserTeachSkillRequest> requests);
    List<UserTeachSkillResponse> getTeachSkillsByUser(Long userId);
    List<MentorMatchResponse> findMatches(MatchRequest request);
    List<UserTeachSkillResponse> getFilteredMentors(Long skillId, String mode, String level);
    void deleteTeachSkill(Long id);
}