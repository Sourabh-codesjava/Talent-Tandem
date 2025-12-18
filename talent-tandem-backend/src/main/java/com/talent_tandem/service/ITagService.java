package com.talent_tandem.service;
import com.talent_tandem.requestdto.TagsRequest;
import com.talent_tandem.responsedto.TagsResponse;
import java.util.List;

public interface ITagService {

    TagsResponse addTag(TagsRequest request);
    TagsResponse getTagById(Long id);
    List<TagsResponse> getTagsBySkill(Long skillId);
    List<TagsResponse> getAllTags();
    List<String> getTagNamesBySkill(Long skillId);
    List<TagsResponse> addTagsBatch(List<TagsRequest> requestList);
}