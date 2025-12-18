package com.talent_tandem.controller;
import com.talent_tandem.service.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final IUserService service;

    public UserController(IUserService service) {
        this.service = service;
    }

    @PutMapping(value = "/update", consumes = {"multipart/form-data"})
    public ResponseEntity<UserResponse> update(
            @Valid @ModelAttribute UserRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) {
        try {
            UserResponse response = service.update(request, profileImage);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ValidationException | UserAlreadyExistsException | FileUploadException e) {
            logger.error("Error updating user: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(service.add(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        return new ResponseEntity<>(service.getUser(request), HttpStatus.OK);
    }

    // UserController.java mein add karo
    @PostMapping("/update-profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @ModelAttribute ProfileUpdateRequest request,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            ProfileResponse response = service.updateProfile(request, profileImage);
            System.out.println("Profile updated successfully: " + response);
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException | FileUploadException e) {
            logger.error("Error updating profile: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ProfileResponse> getUserProfile(@PathVariable Long userId) {
        try {
            ProfileResponse response = service.getUserProfile(userId);
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException e) {
            logger.error("Error getting user profile: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(service.getAllUsers());
        } catch (Exception e) {
            logger.error("Error getting all users: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/top-mentors")
    public ResponseEntity<?> getTopMentors(@RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(service.getTopMentors(limit));
        } catch (Exception e) {
            logger.error("Error getting top mentors: {}", e.getMessage());
            throw e;
        }
    }

}

