package com.talent_tandem.controller;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.service.IUserTeachSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/teach-skill")
@RequiredArgsConstructor
public class UserTeachSkillController {

    private final IUserTeachSkillService service;

    @PostMapping("/add")
    public ResponseEntity<UserTeachSkillResponse> addTeachSkill(
            @RequestBody UserTeachSkillRequest request) {

        System.out.println("Teach Skill Request => " + request);

        UserTeachSkillResponse response = service.addTeachSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/add-bulk")
    public ResponseEntity<List<UserTeachSkillResponse>> addBulkTeachSkills(
            @RequestBody List<UserTeachSkillRequest> requests) {

        List<UserTeachSkillResponse> responses = service.addBulkTeachSkills(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserTeachSkillResponse>> getTeachSkillsByUser(
            @PathVariable Long userId) {

        List<UserTeachSkillResponse> responses = service.getTeachSkillsByUser(userId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/find")
    public ResponseEntity<List<MentorMatchResponse>> findMatches(
            @RequestBody MatchRequest request) {

        List<MentorMatchResponse> responses = service.findMatches(request);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<UserTeachSkillResponse>> getFilteredMentors(
            @RequestParam Long skillId,
            @RequestParam String mode,
            @RequestParam String level) {

        List<UserTeachSkillResponse> mentors = service.getFilteredMentors(skillId, mode, level);
        return ResponseEntity.ok(mentors);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeachSkill(@PathVariable Long id) {
        service.deleteTeachSkill(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
