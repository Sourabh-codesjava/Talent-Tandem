package com.talent_tandem.serviceImpl;

import com.talent_tandem.enums.Role;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.exception.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import com.talent_tandem.service.*;
import com.talent_tandem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {

    private final IUserRepo userRepository;
    private final ISessionRepository sessionRepository;
    private final ISkillRepository skillRepository;
    private final IFeedbackRepository feedbackRepository;
    private final ISessionParticipantRepository participantRepository;
    private final ITagRepository tagRepository;
    private final ISkillService skillService;
    private final ITagService tagService;
    private final PasswordEncoder passwordEncoder;
    private final IUserLearnSkillRepository userLearnSkillRepository;
    private final IUserTeachSkillRepository userTeachSkillRepository;
    private final IAdminMatchingRulesRepository matchingRulesRepository;
    private final ISkillClusterRepository skillClusterRepository;
    private final IAdminAuditLogRepository auditLogRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse adminLogin(AdminLoginRequest request, String clientIp) {
        log.info("ADMIN_LOGIN_PROCESSING - Username: {}, IP: {}", request.getUsername(), clientIp);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        log.error("ADMIN_LOGIN_FAILED - Username: {}, IP: {}, Reason: Admin not found",
                                request.getUsername(), clientIp);
                        return new ResourceNotFoundException("Admin not found");
                    });

            if (user.getRole() != Role.ADMIN) {
                log.warn("ADMIN_LOGIN_FAILED - Username: {}, IP: {}, Reason: Non-admin user attempted admin login",
                        request.getUsername(), clientIp);
                throw new ValidationException("Access denied. Admin role required.");
            }

            if (Boolean.TRUE.equals(user.getIsSuspended())) {
                log.warn("ADMIN_LOGIN_FAILED - Username: {}, IP: {}, Reason: Admin account suspended",
                        request.getUsername(), clientIp);
                throw new ValidationException("Admin account is suspended");
            }

            String accessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getEmail(), user.getId(), user.getRole().name());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername(), user.getId());

            // Log admin login
            logAdminAction(user.getId(), user.getUsername(), "ADMIN_LOGIN", "AUTH", null,
                    "Admin logged in successfully from IP: " + clientIp, clientIp);

            log.info("ADMIN_LOGIN_SUCCESS - Username: {}, IP: {}", request.getUsername(), clientIp);

            return LoginResponse.builder()
                    .id(user.getId())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .status(true)
                    .message("Admin login successful")
                    .build();

        } catch (Exception e) {
            log.error("ADMIN_LOGIN_ERROR - Username: {}, IP: {}, Error: {}",
                    request.getUsername(), clientIp, e.getMessage());
            throw new ValidationException("Invalid admin credentials");
        }
    }

    @Override
    public AdminDashboardResponse getDashboardMetrics() {
        log.info("Fetching admin dashboard metrics");

        long totalUsers = userRepository.count();
        long totalLearners = userRepository.countByRole(Role.LEARNER);
        long totalTeachers = userRepository.countByRole(Role.MENTOR);
        long totalSessions = sessionRepository.count();
        long activeSessions = sessionRepository.countByStatus(SessionStatus.ACCEPTED);
        long completedSessions = sessionRepository.countByStatus(SessionStatus.COMPLETED);
        long totalSkills = skillRepository.count();
        long totalFeedbacks = feedbackRepository.count();

        Double avgRating = feedbackRepository.findAverageRating();
        if (avgRating == null) {
            avgRating = 0.0;
        }

        log.info("Dashboard metrics calculated - Users: {}, Sessions: {}, Skills: {}", totalUsers, totalSessions, totalSkills);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalLearners(totalLearners)
                .totalTeachers(totalTeachers)
                .totalSessions(totalSessions)
                .activeSessions(activeSessions)
                .completedSessions(completedSessions)
                .totalSkills(totalSkills)
                .averageSessionRating(avgRating)
                .totalFeedbacks(totalFeedbacks)
                .build();
    }

    @Override
    public List<UserActivityResponse> getUserActivities() {
        return userRepository.findAll().stream()
                .map(this::mapToUserActivity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionQualityResponse> getSessionQualityReports() {
        return sessionRepository.findAllWithFeedbacks().stream()
                .map(this::mapToSessionQuality)
                .collect(Collectors.toList());
    }

    @Override
    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(skill -> SkillResponse.builder()
                        .id(skill.getId())
                        .name(skill.getName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<SkillWithUsersResponse> getSkillsWithUserCount() {
        return skillRepository.findAll().stream()
                .map(skill -> {
                    Long teacherCount = userTeachSkillRepository.countBySkillId(skill.getId());
                    Long learnerCount = userLearnSkillRepository.countBySkillId(skill.getId());
                    return SkillWithUsersResponse.builder()
                            .skillId(skill.getId())
                            .skillName(skill.getName())
                            .teacherCount(teacherCount)
                            .learnerCount(learnerCount)
                            .totalUsers(teacherCount + learnerCount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SkillResponse updateSkill(Long skillId, String newName) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        skill.setName(newName);
        Skill updated = skillRepository.save(skill);
        return SkillResponse.builder()
                .id(updated.getId())
                .name(updated.getName())
                .build();
    }

    @Override
    @Transactional
    public void mergeSkills(Long sourceSkillId, Long targetSkillId) {
        Skill source = skillRepository.findById(sourceSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Source skill not found"));
        Skill target = skillRepository.findById(targetSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Target skill not found"));

        // Update all UserTeachSkill references
        List<UserTeachSkill> teachSkills = userTeachSkillRepository.findBySkillId(sourceSkillId);
        teachSkills.forEach(uts -> uts.setSkill(target));
        userTeachSkillRepository.saveAll(teachSkills);

        // Update all UserLearnSkill references
        List<UserLearnSkill> learnSkills = userLearnSkillRepository.findBySkillId(sourceSkillId);
        learnSkills.forEach(uls -> uls.setSkill(target));
        userLearnSkillRepository.saveAll(learnSkills);

        // Delete source skill
        skillRepository.delete(source);
    }

    @Override
    @Transactional
    public void deleteSkill(Long skillId) {
        skillRepository.deleteById(skillId);
    }

    @Override
    @Transactional
    public void flagSession(Long sessionId, String reason) {
        log.info("SESSION_FLAG_ATTEMPT - SessionID: {}, Reason: {}", sessionId, reason);

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("SESSION_FLAG_FAILED - SessionID: {}, Reason: Session not found", sessionId);
                    return new ResourceNotFoundException("Session not found");
                });

        // Log admin action
        logAdminAction(null, "system", "SESSION_FLAGGED", "SESSION", sessionId,
                "Session flagged for: " + reason, null);

        log.warn("SESSION_FLAG_SUCCESS - SessionID: {}, Reason: {}, Status: {}",
                sessionId, reason, session.getStatus());
    }

    @Override
    @Transactional
    public void cancelSession(Long sessionId, String reason) {
        log.info("SESSION_CANCEL_ATTEMPT - SessionID: {}, Reason: {}", sessionId, reason);

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("SESSION_CANCEL_FAILED - SessionID: {}, Reason: Session not found", sessionId);
                    return new ResourceNotFoundException("Session not found");
                });

        SessionStatus oldStatus = session.getStatus();
        session.setStatus(SessionStatus.CANCELLED);
        sessionRepository.save(session);

        // Log admin action
        logAdminAction(null, "system", "SESSION_CANCELLED", "SESSION", sessionId,
                "Session cancelled (was " + oldStatus + "): " + reason, null);

        log.info("SESSION_CANCEL_SUCCESS - SessionID: {}, OldStatus: {}", sessionId, oldStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionQualityResponse> getLowQualitySessions() {
        return sessionRepository.findAllWithFeedbacks().stream()
                .map(this::mapToSessionQuality)
                .filter(s -> s.getRating() != null && s.getRating() < 3.0)
                .collect(Collectors.toList());
    }

    @Override
    public SessionQualityResponse getSessionDetails(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        List<Feedback> feedbacks = feedbackRepository.findBySession_SessionId(sessionId);
        Double avgRating = feedbacks.stream()
                .mapToDouble(Feedback::getRating)
                .average()
                .orElse(0.0);

        String title = session.getSkill() != null ? session.getSkill().getName() : "N/A";

        return SessionQualityResponse.builder()
                .sessionId(session.getSessionId())
                .sessionTitle(title)
                .status(session.getStatus() != null ? session.getStatus().name() : "UNKNOWN")
                .rating(avgRating)
                .sessionDate(session.getCreatedAt() != null ?
                        session.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null)
                .needsIntervention(avgRating < 3.0)
                .build();
    }

    @Override
    @Transactional
    public void suspendUser(Long userId, String reason) {
        log.info("USER_SUSPENSION_ATTEMPT - UserID: {}, Reason: {}", userId, reason);

        if (userId == null) {
            log.error("USER_SUSPENSION_FAILED - Reason: User ID is null");
            throw new ValidationException("User ID cannot be null");
        }
        if (reason == null || reason.trim().isEmpty()) {
            log.error("USER_SUSPENSION_FAILED - UserID: {}, Reason: Suspension reason is empty", userId);
            throw new ValidationException("Suspension reason is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("USER_SUSPENSION_FAILED - UserID: {}, Reason: User not found", userId);
                    return new ResourceNotFoundException("User not found");
                });

        // Prevent suspending admins
        if (user.getRole() == Role.ADMIN) {
            log.warn("USER_SUSPENSION_FAILED - UserID: {}, Username: {}, Reason: Cannot suspend admin users",
                    userId, user.getUsername());
            throw new ValidationException("Cannot suspend admin users");
        }

        user.setIsSuspended(true);
        user.setSuspensionReason(reason.trim());
        userRepository.save(user);

        // Log admin action
        logAdminAction(null, "system", "USER_SUSPENDED", "USER", userId,
                "User suspended: " + reason.trim(), null);

        log.info("USER_SUSPENSION_SUCCESS - UserID: {}, Username: {}", userId, user.getUsername());
    }

    @Override
    @Transactional
    public void activateUser(Long userId) {
        log.info("USER_ACTIVATION_ATTEMPT - UserID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("USER_ACTIVATION_FAILED - UserID: {}, Reason: User not found", userId);
                    return new ResourceNotFoundException("User not found");
                });

        user.setIsSuspended(false);
        user.setSuspensionReason(null);
        userRepository.save(user);

        // Log admin action
        logAdminAction(null, "system", "USER_ACTIVATED", "USER", userId,
                "User account activated", null);

        log.info("USER_ACTIVATION_SUCCESS - UserID: {}, Username: {}", userId, user.getUsername());
    }

    @Override
    public UserActivityResponse getUserActivity(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserActivity(user);
    }

    @Override
    public List<UserActivityResponse> getSuspendedUsers() {
        return userRepository.findAll().stream()
                .filter(user -> Boolean.TRUE.equals(user.getIsSuspended()))
                .map(this::mapToUserActivity)
                .collect(Collectors.toList());
    }

    private UserActivityResponse mapToUserActivity(User user) {
        return UserActivityResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "LEARNER")
                .sessionsAsTeacher(0L)
                .sessionsAsLearner(0L)
                .averageRatingAsTeacher(0.0)
                .isActive(user.getIsEmailVerified() && !Boolean.TRUE.equals(user.getIsSuspended()))
                .lastActiveDate(user.getUpdatedAt() != null ?
                        user.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null)
                .build();
    }

    // Admin Management Methods
    @Override
    @Transactional
    public UserResponse createAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) ||
                userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Admin with this email or username already exists");
        }

        User admin = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .isEmailVerified(true)
                .roleSelected(true)
                .build();

        User savedAdmin = userRepository.save(admin);
        return mapToUserResponse(savedAdmin);
    }

    @Override
    @Transactional
    public void removeAdmin(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new ValidationException("User is not an admin");
        }

        // Change role to LEARNER instead of deleting
        admin.setRole(Role.LEARNER);
        userRepository.save(admin);
    }

    @Override
    public List<UserResponse> getAllAdmins() {
        return userRepository.findByRole(Role.ADMIN).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    // Enhanced Skill Management
    @Override
    @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        return skillService.addSkill(request);
    }

    @Override
    @Transactional
    public Map<String, Object> createSkillCluster(String clusterName, List<Long> skillIds) {
        log.info("Creating skill cluster: {} with {} skills", clusterName, skillIds.size());

        if (skillClusterRepository.existsByClusterName(clusterName)) {
            throw new ValidationException("Skill cluster with this name already exists");
        }

        List<Skill> skills = skillRepository.findAllById(skillIds);
        if (skills.size() != skillIds.size()) {
            throw new ResourceNotFoundException("Some skills not found");
        }

        SkillCluster cluster = SkillCluster.builder()
                .clusterName(clusterName)
                .skills(skills)
                .build();

        SkillCluster savedCluster = skillClusterRepository.save(cluster);

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedCluster.getId());
        response.put("name", savedCluster.getClusterName());
        response.put("skillIds", skillIds);
        response.put("skills", skills.stream().map(Skill::getName).collect(Collectors.toList()));
        response.put("createdAt", savedCluster.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));

        log.info("Skill cluster created successfully with ID: {}", savedCluster.getId());
        return response;
    }

    @Override
    public List<Map<String, Object>> getSkillClusters() {
        log.info("Fetching all skill clusters");

        return skillClusterRepository.findAllWithSkills().stream()
                .map(cluster -> {
                    Map<String, Object> clusterMap = new HashMap<>();
                    clusterMap.put("id", cluster.getId());
                    clusterMap.put("name", cluster.getClusterName());
                    clusterMap.put("description", cluster.getDescription());
                    clusterMap.put("skillIds", cluster.getSkills().stream().map(Skill::getId).collect(Collectors.toList()));
                    clusterMap.put("skills", cluster.getSkills().stream().map(Skill::getName).collect(Collectors.toList()));
                    clusterMap.put("createdAt", cluster.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
                    return clusterMap;
                })
                .collect(Collectors.toList());
    }

    // Tag Management
    @Override
    @Transactional
    public TagsResponse createTag(TagsRequest request) {
        return tagService.addTag(request);
    }

    @Override
    @Transactional
    public TagsResponse updateTag(Long tagId, TagsRequest request) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

        tag.setName(request.getName());
        if (request.getSkillId() != null) {
            Skill skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
            tag.setSkill(skill);
        }

        Tag updatedTag = tagRepository.save(tag);
        TagsResponse response = new TagsResponse();
        response.setId(updatedTag.getId());
        response.setName(updatedTag.getName());
        response.setSkillId(updatedTag.getSkill() != null ? updatedTag.getSkill().getId() : null);
        return response;
    }

    @Override
    @Transactional
    public void deleteTag(Long tagId) {
        if (!tagRepository.existsById(tagId)) {
            throw new ResourceNotFoundException("Tag not found");
        }
        tagRepository.deleteById(tagId);
    }

    @Override
    public List<TagsResponse> getAllTags() {
        return tagService.getAllTags();
    }

    // Enhanced User Management
    @Override
    public List<UserActivityResponse> getAllUsersWithRoles() {
        return userRepository.findAll().stream()
                .map(this::mapToEnhancedUserActivity)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserActivityResponse> getUsersByRole(String role) {
        try {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(roleEnum).stream()
                    .map(this::mapToEnhancedUserActivity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.error("Invalid role provided: {}", role);
            throw new ValidationException("Invalid role: " + role);
        }
    }

    @Override
    public List<UserActivityResponse> getActiveUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getIsEmailVerified() && !Boolean.TRUE.equals(user.getIsSuspended()))
                .map(this::mapToEnhancedUserActivity)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserActivityResponse> getInactiveUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !user.getIsEmailVerified() || Boolean.TRUE.equals(user.getIsSuspended()))
                .map(this::mapToEnhancedUserActivity)
                .collect(Collectors.toList());
    }

    // AI Matching Rules
    @Override
    @Transactional
    public Map<String, Object> updateAIMatchingRules(Map<String, Object> rules) {
        log.info("Updating AI matching rules");

        AdminMatchingRules matchingRules = matchingRulesRepository.findLatestRules()
                .orElse(AdminMatchingRules.builder().build());

        try {
            if (rules.containsKey("skillMatchThreshold")) {
                matchingRules.setSkillMatchThreshold(Double.valueOf(rules.get("skillMatchThreshold").toString()));
            }
            if (rules.containsKey("availabilityMatchWeight")) {
                matchingRules.setAvailabilityMatchWeight(Double.valueOf(rules.get("availabilityMatchWeight").toString()));
            }
            if (rules.containsKey("ratingWeight")) {
                matchingRules.setRatingWeight(Double.valueOf(rules.get("ratingWeight").toString()));
            }
            if (rules.containsKey("experienceWeight")) {
                matchingRules.setExperienceWeight(Double.valueOf(rules.get("experienceWeight").toString()));
            }
            if (rules.containsKey("maxMatchingDistance")) {
                matchingRules.setMaxMatchingDistance(Integer.valueOf(rules.get("maxMatchingDistance").toString()));
            }
            if (rules.containsKey("enableLocationMatching")) {
                matchingRules.setEnableLocationMatching(Boolean.valueOf(rules.get("enableLocationMatching").toString()));
            }
            if (rules.containsKey("customRules")) {
                matchingRules.setCustomRules(rules.get("customRules").toString());
            }
        } catch (NumberFormatException e) {
            log.error("Invalid number format in matching rules: {}", e.getMessage());
            throw new ValidationException("Invalid number format in matching rules");
        }

        AdminMatchingRules savedRules = matchingRulesRepository.save(matchingRules);

        Map<String, Object> response = new HashMap<>();
        response.put("skillMatchThreshold", savedRules.getSkillMatchThreshold());
        response.put("availabilityMatchWeight", savedRules.getAvailabilityMatchWeight());
        response.put("ratingWeight", savedRules.getRatingWeight());
        response.put("experienceWeight", savedRules.getExperienceWeight());
        response.put("maxMatchingDistance", savedRules.getMaxMatchingDistance());
        response.put("enableLocationMatching", savedRules.getEnableLocationMatching());
        response.put("customRules", savedRules.getCustomRules());
        response.put("lastUpdated", savedRules.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME));

        log.info("AI matching rules updated successfully");
        return response;
    }

    @Override
    public Map<String, Object> getAIMatchingRules() {
        log.info("Fetching AI matching rules");

        AdminMatchingRules rules = matchingRulesRepository.findLatestRules()
                .orElse(AdminMatchingRules.builder()
                        .skillMatchThreshold(0.7)
                        .availabilityMatchWeight(0.3)
                        .ratingWeight(0.4)
                        .experienceWeight(0.3)
                        .maxMatchingDistance(50)
                        .enableLocationMatching(true)
                        .build());

        Map<String, Object> response = new HashMap<>();
        response.put("skillMatchThreshold", rules.getSkillMatchThreshold());
        response.put("availabilityMatchWeight", rules.getAvailabilityMatchWeight());
        response.put("ratingWeight", rules.getRatingWeight());
        response.put("experienceWeight", rules.getExperienceWeight());
        response.put("maxMatchingDistance", rules.getMaxMatchingDistance());
        response.put("enableLocationMatching", rules.getEnableLocationMatching());
        response.put("customRules", rules.getCustomRules());
        response.put("lastUpdated", rules.getUpdatedAt() != null ?
                rules.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);

        return response;
    }

    // Helper Methods
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .username(user.getUsername())
                .profilePhoto(user.getProfilePhoto())
                .build();
    }

    private UserActivityResponse mapToEnhancedUserActivity(User user) {
        // Get session counts
        Long teacherSessions = participantRepository.countByUserIdAndRole(user.getId(), com.talent_tandem.enums.ParticipantRole.MENTOR);
        Long learnerSessions = participantRepository.countByUserIdAndRole(user.getId(), com.talent_tandem.enums.ParticipantRole.LEARNER);

        // Get average rating as teacher
        Double avgRating = feedbackRepository.findByToUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .mapToDouble(Feedback::getRating)
                .average()
                .orElse(0.0);

        return UserActivityResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "LEARNER")
                .sessionsAsTeacher(teacherSessions)
                .sessionsAsLearner(learnerSessions)
                .averageRatingAsTeacher(avgRating)
                .isActive(user.getIsEmailVerified() && !Boolean.TRUE.equals(user.getIsSuspended()))
                .lastActiveDate(user.getUpdatedAt() != null ?
                        user.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null)
                .build();
    }

    private SessionQualityResponse mapToSessionQuality(Session session) {
        if (session == null) {
            return null;
        }
        
        List<Feedback> feedbacks = session.getFeedbacks() != null ? session.getFeedbacks() : Collections.emptyList();
        Double avgRating = feedbacks.stream()
                .filter(f -> f != null && f.getRating() != null)
                .mapToDouble(Feedback::getRating)
                .average()
                .orElse(0.0);

        String title = session.getSkill() != null ? session.getSkill().getName() : "N/A";

        return SessionQualityResponse.builder()
                .sessionId(session.getSessionId())
                .sessionTitle(title)
                .status(session.getStatus() != null ? session.getStatus().name() : "UNKNOWN")
                .rating(avgRating)
                .sessionDate(session.getCreatedAt() != null ?
                        session.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null)
                .needsIntervention(avgRating < 3.0)
                .build();
    }

    // Helper method for audit logging
    private void logAdminAction(Long adminId, String adminUsername, String action, String targetType, Long targetId, String details, String ipAddress) {
        try {
            AdminAuditLog auditLog = AdminAuditLog.builder()
                    .adminId(adminId)
                    .adminUsername(adminUsername)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created for admin action: {} by {}", action, adminUsername);
        } catch (Exception e) {
            log.error("Failed to create audit log for action: {} by {}, error: {}", action, adminUsername, e.getMessage());
        }
    }
}