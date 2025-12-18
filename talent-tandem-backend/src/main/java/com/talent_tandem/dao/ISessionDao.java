package com.talent_tandem.dao;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import java.util.List;
import java.util.Optional;

public interface ISessionDao {
    
    Session save(Session session);
    Optional<Session> findById(Long sessionId);
    List<Session> findByUserId(Long userId);
    List<Session> findAll();
    Session updateStatus(Long sessionId, SessionStatus status);
    SessionParticipant saveParticipant(SessionParticipant participant);
    Optional<Session> findByIdWithParticipants(Long sessionId);
    List<Object[]> getSessionStatusCountByMentor(Long mentorId);
    List<Object[]> getSkillDistributionByMentor(Long mentorId);
    List<Object[]> getDurationAnalysisByMentor(Long mentorId);
    List<Session> getRecentSessionsByMentor(Long mentorId, int limit);
    Long countPendingRequestsByMentor(Long mentorId);
    Long countCompletedSessionsByMentor(Long mentorId);
    Long getTotalMinutesTaughtByMentor(Long mentorId);
    Long countUpcomingSessionsByLearner(Long learnerId);
    Long countCompletedSessionsByLearner(Long learnerId);
    Long getTotalMinutesLearnedByLearner(Long learnerId);
    List<Object[]> getSkillProgressByLearner(Long learnerId);
    List<Object[]> getSessionStatusCountByLearner(Long learnerId);
}