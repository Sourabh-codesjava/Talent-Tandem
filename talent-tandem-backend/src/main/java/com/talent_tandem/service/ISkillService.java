package com.talent_tandem.service;
import com.talent_tandem.requestdto.SkillRequest;
import com.talent_tandem.responsedto.SkillResponse;
import com.talent_tandem.responsedto.SkillTagResponse;
import com.talent_tandem.responsedto.SkillWithTagsResponse;

import java.util.List;

public interface ISkillService {

    public SkillResponse addSkill(SkillRequest request);
    public SkillResponse getSkillById(Long id);
    public List<SkillResponse> getAllSkills();
    public List<String> getSkillNames();
    public List<SkillResponse> addSkillBatch(List<SkillRequest> requestList);
    public SkillWithTagsResponse getSkillWithTags(Long id);
    SkillTagResponse getSkillWithSubTags(Long skillId);

}