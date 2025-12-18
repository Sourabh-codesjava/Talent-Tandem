package com.talent_tandem.service;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.requestdto.SessionRequest;
import com.talent_tandem.responsedto.LearnerDashboardStatsResponse;
import com.talent_tandem.responsedto.MentorDashboardStatsResponse;
import com.talent_tandem.responsedto.SessionCompleteResponse;
import com.talent_tandem.responsedto.SessionJoinResponse;
import com.talent_tandem.responsedto.SessionResponse;
import com.talent_tandem.responsedto.SessionStartResponse;
import java.util.List;

public interface ISessionService {
    
    SessionResponse createSession(SessionRequest request);
    SessionResponse updateSessionStatus(Long sessionId, SessionStatus status);
    List<SessionResponse> getSessionsByUser(Long userId);
    SessionResponse getSessionById(Long sessionId);
    void sendMatchNotification(com.talent_tandem.websocket.MatchNotificationDto matchDto);
    SessionJoinResponse joinSession(Long sessionId, Long learnerId);
    SessionStartResponse startSession(Long sessionId, Long mentorId);
    SessionCompleteResponse completeSession(Long sessionId, Long mentorId);
    SessionResponse cancelSessionByMentor(Long sessionId, Long mentorId);
    SessionResponse cancelSessionByLearner(Long sessionId, Long learnerId);
    MentorDashboardStatsResponse getMentorDashboardStats(Long mentorId);
    LearnerDashboardStatsResponse getLearnerDashboardStats(Long learnerId);
    List<SessionResponse> getAllSessions();
}