package com.talent_tandem.serviceImpl;
import com.talent_tandem.dao.ITagDao;
import com.talent_tandem.dao.ISkillDao;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.ValidationException;
import com.talent_tandem.model.Skill;
import com.talent_tandem.model.Tag;
import com.talent_tandem.requestdto.TagsRequest;
import com.talent_tandem.responsedto.TagsResponse;
import com.talent_tandem.service.ITagService;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class TagServiceImpl implements ITagService {

    private final ITagDao tagDao;
    private final ISkillDao skillDao;

    public TagServiceImpl(ITagDao tagDao, ISkillDao skillDao) {
        this.tagDao = tagDao;
        this.skillDao = skillDao;
    }

    @Override
    public TagsResponse addTag(TagsRequest request) {

        if (request.getSkillId() == null || request.getSkillId() <= 0)
            throw new ValidationException("Invalid skill ID");
        if (request.getName() == null || request.getName().trim().isEmpty())
            throw new ValidationException("Tag name cannot be empty");

        Skill skill = skillDao.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + request.getSkillId()));

        Tag tag = new Tag();
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setSkill(skill);

        Tag savedTag = tagDao.save(tag);

        TagsResponse response = new TagsResponse();
        response.setId(savedTag.getId());
        response.setName(savedTag.getName());
        response.setDescription(savedTag.getDescription());
        response.setSkillId(skill.getId());
        response.setSkillName(skill.getName());
        response.setCreatedAt(savedTag.getCreatedAt());
        response.setUpdatedAt(savedTag.getUpdatedAt());

        return response;
    }

    @Override
    public TagsResponse getTagById(Long id) {
        Tag tag = tagDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));

        TagsResponse response = new TagsResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        response.setDescription(tag.getDescription());
        response.setSkillId(tag.getSkill().getId());
        response.setSkillName(tag.getSkill().getName());
        response.setCreatedAt(tag.getCreatedAt());
        response.setUpdatedAt(tag.getUpdatedAt());

        return response;
    }

    @Override
    public List<TagsResponse> getTagsBySkill(Long skillId) {
        List<Tag> tags = tagDao.findBySkillId(skillId);
        List<TagsResponse> responses = new ArrayList<>();

        for (Tag tag : tags) {
            TagsResponse res = new TagsResponse();
            res.setId(tag.getId());
            res.setName(tag.getName());
            res.setDescription(tag.getDescription());
            res.setSkillId(tag.getSkill().getId());
            res.setSkillName(tag.getSkill().getName());
            res.setCreatedAt(tag.getCreatedAt());
            res.setUpdatedAt(tag.getUpdatedAt());
            responses.add(res);
        }
        return responses;
    }

    @Override
    public List<TagsResponse> getAllTags() {
        List<Tag> tags = tagDao.findAll();
        List<TagsResponse> responses = new ArrayList<>();

        for (Tag tag : tags) {
            TagsResponse res = new TagsResponse();
            res.setId(tag.getId());
            res.setName(tag.getName());
            res.setDescription(tag.getDescription());
            res.setSkillId(tag.getSkill().getId());
            res.setSkillName(tag.getSkill().getName());
            res.setCreatedAt(tag.getCreatedAt());
            res.setUpdatedAt(tag.getUpdatedAt());
            responses.add(res);
        }
        return responses;
    }

    @Override
    public List<String> getTagNamesBySkill(Long skillId) {

        if (skillId == null || skillId <= 0)
            throw new ValidationException("Invalid skill ID");

        List<Tag> tags = tagDao.findBySkillId(skillId);
        List<String> names = new ArrayList<>();
        for (Tag tag : tags) {
            names.add(tag.getName());
        }
        return names;
    }

    @Override
    public List<TagsResponse> addTagsBatch(List<TagsRequest> requestList) {

        List<Tag> tagEntities = new ArrayList<>();

        // Request → Entity
        for (TagsRequest request : requestList) {

            Skill skill = skillDao.findById(request.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Skill not found with ID " + request.getSkillId()));

            Tag tag = new Tag();
            tag.setName(request.getName());
            tag.setDescription(request.getDescription());
            tag.setSkill(skill);

            tagEntities.add(tag);
        }
        List<Tag> savedTags = tagDao.saveAll(tagEntities);
        List<TagsResponse> responses = new ArrayList<>();

        for (Tag tag : savedTags) {
            TagsResponse res = new TagsResponse();
            res.setId(tag.getId());
            res.setName(tag.getName());
            res.setDescription(tag.getDescription());
            res.setSkillId(tag.getSkill().getId());
            res.setSkillName(tag.getSkill().getName());
            res.setCreatedAt(tag.getCreatedAt());
            res.setUpdatedAt(tag.getUpdatedAt());
            responses.add(res);
        }

        return responses;
    }

}
