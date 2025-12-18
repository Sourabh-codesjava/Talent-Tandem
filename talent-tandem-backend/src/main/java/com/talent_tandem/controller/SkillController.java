package com.talent_tandem.controller;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.exception.*;
import com.talent_tandem.service.IAIService;
import com.talent_tandem.service.ISkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/skill")
public class SkillController {

    private static final Logger logger = LoggerFactory.getLogger(SkillController.class);
    
    private final ISkillService skillService;
    private final IAIService aiService;

    public SkillController(ISkillService skillService, IAIService aiService) {
        this.skillService = skillService;
        this.aiService = aiService;
    }

    @PostMapping("/add-batch")
    public ResponseEntity<List<SkillResponse>> addSkillBatch(
            @RequestBody List<SkillRequest> requestList) {
        try {
            List<SkillResponse> responseList = skillService.addSkillBatch(requestList);
            return new ResponseEntity<>(responseList, HttpStatus.CREATED);
        } catch (ValidationException | DuplicateResourceException e) {
            logger.error("Error adding skill batch: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/add")
    public ResponseEntity<SkillResponse> addSkill(@RequestBody SkillRequest request) {
        try {
            SkillResponse response = skillService.addSkill(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (ValidationException | DuplicateResourceException e) {
            logger.error("Error adding skill: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/normalize")
    public ResponseEntity<List<String>> normalizeSkills(@RequestBody List<String> rawSkills) {
        if (rawSkills == null || rawSkills.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            List<String> normalizedSkills = aiService.normalizeSkills(rawSkills);
            return ResponseEntity.ok(normalizedSkills);
        } catch (Exception e) {
            logger.error("Failed to normalize skills: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/all")
    public ResponseEntity<List<SkillResponse>> getAllSkills() {
        return new ResponseEntity<>(skillService.getAllSkills(), HttpStatus.OK);
    }

    @GetMapping("/getSkills")
    public ResponseEntity<List<String>> getSkillNames() {
        return new ResponseEntity<>(skillService.getSkillNames(), HttpStatus.OK);
    }


    @GetMapping("/{id}")
    public ResponseEntity<SkillResponse> getSkillById(@PathVariable Long id) {
        try {
            SkillResponse response = skillService.getSkillById(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (SkillNotFoundException e) {
            logger.error("Error getting skill by id: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/{id}/with-tags")
    public ResponseEntity<SkillWithTagsResponse> getSkillWithTags(@PathVariable Long id) {
        return ResponseEntity.ok(skillService.getSkillWithTags(id));
    }

    @GetMapping("/{id}/names")
    public ResponseEntity<SkillTagResponse> getSkillWithSubTags(@PathVariable Long id) {
        return ResponseEntity.ok(skillService.getSkillWithSubTags(id));
    }

}
