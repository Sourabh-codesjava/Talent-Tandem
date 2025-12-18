package com.talent_tandem.controller;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.service.ITagService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tag")
public class TagController {

    private final ITagService tagService;

    public TagController(ITagService tagService) {
        this.tagService = tagService;
    }

    @PostMapping("/add")
    public ResponseEntity<TagsResponse> addTag(@RequestBody TagsRequest request) {
        return new ResponseEntity<>(tagService.addTag(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagsResponse> getTagById(@PathVariable Long id) {
        return new ResponseEntity<>(tagService.getTagById(id), HttpStatus.OK);
    }

    @GetMapping("/by-skill/{skillId}")
    public ResponseEntity<List<TagsResponse>> getTagsBySkill(@PathVariable Long skillId) {
        return new ResponseEntity<>(tagService.getTagsBySkill(skillId), HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TagsResponse>> getAllTags() {
        return new ResponseEntity<>(tagService.getAllTags(), HttpStatus.OK);
    }

    @GetMapping("/names-by-skill/{skillId}")
    public ResponseEntity<List<String>> getTagNamesBySkill(@PathVariable Long skillId) {
        return new ResponseEntity<>(tagService.getTagNamesBySkill(skillId), HttpStatus.OK);
    }

    @PostMapping("/add-batch")
    public ResponseEntity<List<TagsResponse>> addTagsBatch(
            @RequestBody List<TagsRequest> requestList) {

        List<TagsResponse> response = tagService.addTagsBatch(requestList);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

}
