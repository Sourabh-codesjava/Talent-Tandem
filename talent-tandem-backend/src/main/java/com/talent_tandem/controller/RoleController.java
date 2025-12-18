package com.talent_tandem.controller;

import com.talent_tandem.requestdto.RoleSelectionRequest;
import com.talent_tandem.responsedto.RoleSelectionResponse;
import com.talent_tandem.service.IRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/role")
@RequiredArgsConstructor
public class RoleController {

    private final IRoleService roleService;

    @PostMapping("/select")
    public ResponseEntity<RoleSelectionResponse> selectRole(@Valid @RequestBody RoleSelectionRequest request) {
        RoleSelectionResponse response = roleService.selectRole(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/become-mentor/{userId}")
    public ResponseEntity<RoleSelectionResponse> becomeMentor(@PathVariable Long userId) {
        RoleSelectionResponse response = roleService.becomeMentor(userId);
        return ResponseEntity.ok(response);
    }
}
