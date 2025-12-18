package com.talent_tandem.serviceImpl;
import com.talent_tandem.dao.ISkillDao;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.ValidationException;
import com.talent_tandem.model.Skill;
import com.talent_tandem.model.Tag;
import com.talent_tandem.requestdto.SkillRequest;
import com.talent_tandem.responsedto.SkillResponse;
import com.talent_tandem.responsedto.SkillTagResponse;
import com.talent_tandem.responsedto.SkillWithTagsResponse;
import com.talent_tandem.service.ISkillService;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class SkillServiceImpl implements ISkillService {

    private final ISkillDao skillDao;

    public SkillServiceImpl(ISkillDao skillDao) {
        this.skillDao = skillDao;
    }

    @Override
    public SkillResponse addSkill(SkillRequest request) {

        if (request.getSkillName() == null || request.getSkillName().trim().isEmpty())
            throw new ValidationException("Skill name cannot be empty");

        Skill skill = new Skill();
        skill.setName(request.getSkillName());
        Skill savedSkill = skillDao.save(skill);
        SkillResponse response = new SkillResponse();
        response.setId(savedSkill.getId());
        response.setSkillName(savedSkill.getName());
        response.setCreatedAt(savedSkill.getCreatedAt());
        response.setUpdatedAt(savedSkill.getUpdatedAt());

        return response;
    }

    @Override
    public SkillResponse getSkillById(Long id) {

        if (id == null || id <= 0)
            throw new ValidationException("Invalid skill ID");

        Skill skill = skillDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));

        SkillResponse response = new SkillResponse();
        response.setId(skill.getId());
        response.setSkillName(skill.getName());
        response.setCreatedAt(skill.getCreatedAt());
        response.setUpdatedAt(skill.getUpdatedAt());

        return response;
    }

    @Override
    public List<SkillResponse> getAllSkills() {
        List<Skill> skills = skillDao.findAll();
        List<SkillResponse> responses = new ArrayList<>();

        for (Skill skill : skills) {
            SkillResponse res = new SkillResponse();
            res.setId(skill.getId());
            res.setSkillName(skill.getName());
            res.setCreatedAt(skill.getCreatedAt());
            res.setUpdatedAt(skill.getUpdatedAt());
            responses.add(res);
        }

        return responses;
    }

    @Override
    public List<String> getSkillNames() {
        return skillDao.getSkillNames();
    }

    @Override
    public List<SkillResponse> addSkillBatch(List<SkillRequest> requestList) {

        if (requestList == null || requestList.isEmpty())
            throw new ValidationException("Skill list cannot be empty");

        List<Skill> skillEntities = new ArrayList<>();

        for (SkillRequest request : requestList) {
            Skill skill = new Skill();
            skill.setName(request.getSkillName());
            skillEntities.add(skill);
        }
        List<Skill> savedSkills = skillDao.saveAll(skillEntities);
        List<SkillResponse> responses = new ArrayList<>();

        for (Skill savedSkill : savedSkills) {
            SkillResponse res = new SkillResponse();
            res.setId(savedSkill.getId());
            res.setSkillName(savedSkill.getName());
            res.setCreatedAt(savedSkill.getCreatedAt());
            res.setUpdatedAt(savedSkill.getUpdatedAt());
            responses.add(res);
        }

        return responses;
    }

    @Override
    public SkillWithTagsResponse getSkillWithTags(Long skillId) {

        Skill skill = skillDao.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));

        List<String> tagNames = skill.getTags()
                .stream()
                .map(Tag::getName)
                .toList();

        SkillWithTagsResponse response = new SkillWithTagsResponse();
        response.setId(skill.getId());
        response.setName(skill.getName());
        response.setTagNames(tagNames);
        return response;
    }

    @Override
    public SkillTagResponse getSkillWithSubTags(Long skillId) {

        Skill skill = skillDao.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));

        List<String> tagNames = skill.getTags()
                .stream()
                .map(Tag::getName)
                .toList();

        SkillTagResponse response = new SkillTagResponse();
        response.setSkillName(skill.getName());
        response.setSubTags(tagNames);
        return response;
    }



}
