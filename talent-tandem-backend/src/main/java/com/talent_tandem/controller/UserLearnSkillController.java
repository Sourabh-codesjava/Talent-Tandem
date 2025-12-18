package com.talent_tandem.controller;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.service.IUserLearnSkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/learn-skill")
public class UserLearnSkillController {

    private final IUserLearnSkillService service;
    public UserLearnSkillController(IUserLearnSkillService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public ResponseEntity<UserLearnSkillResponse> addLearnSkill(
            @RequestBody UserLearnSkillRequest request) {

        return new ResponseEntity<>(
                service.createLearnSkill(request),
                HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserLearnSkillResponse>> getLearnSkillsByUser(
            @PathVariable Long userId) {

        return new ResponseEntity<>(
                service.getLearnSkillsByUserId(userId),
                HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearnSkill(@PathVariable Long id) {
        service.deleteLearnSkill(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
