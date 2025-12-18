package com.talent_tandem.service;

import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import java.util.List;
import java.util.Map;

public interface IAdminService {

    // Authentication
    LoginResponse adminLogin(AdminLoginRequest request, String clientIp);

    // Dashboard & Monitoring
    AdminDashboardResponse getDashboardMetrics();
    List<UserActivityResponse> getUserActivities();
    List<SessionQualityResponse> getSessionQualityReports();

    // Admin Management
    UserResponse createAdmin(RegisterRequest request);
    void removeAdmin(Long adminId);
    List<UserResponse> getAllAdmins();

    // Skill Management
    List<SkillResponse> getAllSkills();
    List<SkillWithUsersResponse> getSkillsWithUserCount();
    SkillResponse createSkill(SkillRequest request);
    SkillResponse updateSkill(Long skillId, String newName);
    void mergeSkills(Long sourceSkillId, Long targetSkillId);
    void deleteSkill(Long skillId);
    Map<String, Object> createSkillCluster(String clusterName, List<Long> skillIds);
    List<Map<String, Object>> getSkillClusters();

    // Tag Management
    TagsResponse createTag(TagsRequest request);
    TagsResponse updateTag(Long tagId, TagsRequest request);
    void deleteTag(Long tagId);
    List<TagsResponse> getAllTags();

    // Session Intervention
    void flagSession(Long sessionId, String reason);
    void cancelSession(Long sessionId, String reason);
    List<SessionQualityResponse> getLowQualitySessions();
    SessionQualityResponse getSessionDetails(Long sessionId);

    // User Management
    void suspendUser(Long userId, String reason);
    void activateUser(Long userId);
    UserActivityResponse getUserActivity(Long userId);
    List<UserActivityResponse> getSuspendedUsers();
    List<UserActivityResponse> getAllUsersWithRoles();
    List<UserActivityResponse> getUsersByRole(String role);
    List<UserActivityResponse> getActiveUsers();
    List<UserActivityResponse> getInactiveUsers();

    // AI Mapping Rules
    Map<String, Object> updateAIMatchingRules(Map<String, Object> rules);
    Map<String, Object> getAIMatchingRules();
}