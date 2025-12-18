package com.talent_tandem.controller;

import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.service.IAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final IAdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        log.info("ADMIN_DASHBOARD_REQUEST - Fetching dashboard metrics");
        try {
            AdminDashboardResponse response = adminService.getDashboardMetrics();
            log.info("ADMIN_DASHBOARD_SUCCESS - Metrics retrieved: Users={}, Sessions={}, Skills={}",
                    response.getTotalUsers(), response.getTotalSessions(), response.getTotalSkills());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("ADMIN_DASHBOARD_ERROR - Failed to retrieve metrics: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/users/activities")
    public ResponseEntity<List<UserActivityResponse>> getUserActivities() {
        return ResponseEntity.ok(adminService.getUserActivities());
    }

    @GetMapping("/users/{userId}/activity")
    public ResponseEntity<UserActivityResponse> getUserActivity(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserActivity(userId));
    }

    @GetMapping("/users/suspended")
    public ResponseEntity<List<UserActivityResponse>> getSuspendedUsers() {
        return ResponseEntity.ok(adminService.getSuspendedUsers());
    }

    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<Map<String, String>> suspendUser(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        log.info("ADMIN_USER_SUSPEND_REQUEST - UserID: {}, Reason: {}", userId, request.get("reason"));
        try {
            adminService.suspendUser(userId, request.get("reason"));
            log.info("ADMIN_USER_SUSPEND_SUCCESS - UserID: {}", userId);
            return ResponseEntity.ok(Map.of("message", "User suspended successfully"));
        } catch (Exception e) {
            log.error("ADMIN_USER_SUSPEND_ERROR - UserID: {}, Error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @PostMapping("/users/{userId}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable Long userId) {
        log.info("ADMIN_USER_ACTIVATE_REQUEST - UserID: {}", userId);
        try {
            adminService.activateUser(userId);
            log.info("ADMIN_USER_ACTIVATE_SUCCESS - UserID: {}", userId);
            return ResponseEntity.ok(Map.of("message", "User activated successfully"));
        } catch (Exception e) {
            log.error("ADMIN_USER_ACTIVATE_ERROR - UserID: {}, Error: {}", userId, e.getMessage());
            throw e;
        }
    }

    @GetMapping("/sessions/quality")
    public ResponseEntity<List<SessionQualityResponse>> getSessionQuality() {
        return ResponseEntity.ok(adminService.getSessionQualityReports());
    }

    @GetMapping("/sessions/low-quality")
    public ResponseEntity<List<SessionQualityResponse>> getLowQualitySessions() {
        return ResponseEntity.ok(adminService.getLowQualitySessions());
    }

    @GetMapping("/sessions/{sessionId}/details")
    public ResponseEntity<SessionQualityResponse> getSessionDetails(@PathVariable Long sessionId) {
        return ResponseEntity.ok(adminService.getSessionDetails(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/flag")
    public ResponseEntity<Map<String, String>> flagSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> request) {
        log.info("ADMIN_SESSION_FLAG_REQUEST - SessionID: {}, Reason: {}", sessionId, request.get("reason"));
        try {
            adminService.flagSession(sessionId, request.get("reason"));
            log.info("ADMIN_SESSION_FLAG_SUCCESS - SessionID: {}", sessionId);
            return ResponseEntity.ok(Map.of("message", "Session flagged successfully"));
        } catch (Exception e) {
            log.error("ADMIN_SESSION_FLAG_ERROR - SessionID: {}, Error: {}", sessionId, e.getMessage());
            throw e;
        }
    }

    @PostMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<Map<String, String>> cancelSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> request) {
        log.info("ADMIN_SESSION_CANCEL_REQUEST - SessionID: {}, Reason: {}", sessionId, request.get("reason"));
        try {
            adminService.cancelSession(sessionId, request.get("reason"));
            log.info("ADMIN_SESSION_CANCEL_SUCCESS - SessionID: {}", sessionId);
            return ResponseEntity.ok(Map.of("message", "Session cancelled successfully"));
        } catch (Exception e) {
            log.error("ADMIN_SESSION_CANCEL_ERROR - SessionID: {}, Error: {}", sessionId, e.getMessage());
            throw e;
        }
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillResponse>> getAllSkills() {
        return ResponseEntity.ok(adminService.getAllSkills());
    }

    @GetMapping("/skills/with-users")
    public ResponseEntity<List<SkillWithUsersResponse>> getSkillsWithUsers() {
        return ResponseEntity.ok(adminService.getSkillsWithUserCount());
    }

    @PutMapping("/skills/{skillId}")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable Long skillId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(adminService.updateSkill(skillId, request.get("name")));
    }

    @PostMapping("/skills/merge")
    public ResponseEntity<Map<String, String>> mergeSkills(
            @RequestBody Map<String, Long> request) {
        adminService.mergeSkills(request.get("sourceSkillId"), request.get("targetSkillId"));
        return ResponseEntity.ok(Map.of("message", "Skills merged successfully"));
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<Map<String, String>> deleteSkill(@PathVariable Long skillId) {
        adminService.deleteSkill(skillId);
        return ResponseEntity.ok(Map.of("message", "Skill deleted successfully"));
    }

    @PostMapping("/skills")
    public ResponseEntity<SkillResponse> createSkill(@RequestBody SkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createSkill(request));
    }

    @PostMapping("/skills/clusters")
    public ResponseEntity<Map<String, Object>> createSkillCluster(@RequestBody SkillClusterRequest request) {
        Map<String, Object> cluster = adminService.createSkillCluster(request.getClusterName(), request.getSkillIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(cluster);
    }

    @GetMapping("/skills/clusters")
    public ResponseEntity<List<Map<String, Object>>> getSkillClusters() {
        return ResponseEntity.ok(adminService.getSkillClusters());
    }

    // Admin Management
    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createAdmin(request));
    }

    @DeleteMapping("/admins/{adminId}")
    public ResponseEntity<Map<String, String>> removeAdmin(@PathVariable Long adminId) {
        adminService.removeAdmin(adminId);
        return ResponseEntity.ok(Map.of("message", "Admin removed successfully"));
    }

    @GetMapping("/admins")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    // Tag Management
    @PostMapping("/tags")
    public ResponseEntity<TagsResponse> createTag(@RequestBody TagsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createTag(request));
    }

    @PutMapping("/tags/{tagId}")
    public ResponseEntity<TagsResponse> updateTag(@PathVariable Long tagId, @RequestBody TagsRequest request) {
        return ResponseEntity.ok(adminService.updateTag(tagId, request));
    }

    @DeleteMapping("/tags/{tagId}")
    public ResponseEntity<Map<String, String>> deleteTag(@PathVariable Long tagId) {
        adminService.deleteTag(tagId);
        return ResponseEntity.ok(Map.of("message", "Tag deleted successfully"));
    }

    @GetMapping("/tags")
    public ResponseEntity<List<TagsResponse>> getAllTags() {
        return ResponseEntity.ok(adminService.getAllTags());
    }

    // Enhanced User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserActivityResponse>> getAllUsersWithRoles() {
        return ResponseEntity.ok(adminService.getAllUsersWithRoles());
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserActivityResponse>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    @GetMapping("/users/active")
    public ResponseEntity<List<UserActivityResponse>> getActiveUsers() {
        return ResponseEntity.ok(adminService.getActiveUsers());
    }

    @GetMapping("/users/inactive")
    public ResponseEntity<List<UserActivityResponse>> getInactiveUsers() {
        return ResponseEntity.ok(adminService.getInactiveUsers());
    }

    // AI Matching Rules
    @PutMapping("/ai-rules")
    public ResponseEntity<Map<String, Object>> updateAIMatchingRules(@RequestBody AIRulesUpdateRequest request) {
        Map<String, Object> rules = Map.of(
                "skillMatchThreshold", request.getSkillMatchThreshold(),
                "availabilityMatchWeight", request.getAvailabilityMatchWeight(),
                "ratingWeight", request.getRatingWeight(),
                "experienceWeight", request.getExperienceWeight(),
                "maxMatchingDistance", request.getMaxMatchingDistance(),
                "enableLocationMatching", request.getEnableLocationMatching(),
                "customRules", request.getCustomRules()
        );
        return ResponseEntity.ok(adminService.updateAIMatchingRules(rules));
    }

    @GetMapping("/ai-rules")
    public ResponseEntity<Map<String, Object>> getAIMatchingRules() {
        return ResponseEntity.ok(adminService.getAIMatchingRules());
    }
}