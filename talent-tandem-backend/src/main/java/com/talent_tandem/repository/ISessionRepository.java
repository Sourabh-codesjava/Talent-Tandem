package com.talent_tandem.repository;

import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface ISessionRepository extends JpaRepository<Session, Long> {
    
    @Query("SELECT DISTINCT s FROM Session s JOIN s.participants p WHERE p.user.id = :userId")
    List<Session> findByUserId(@Param("userId") Long userId);

    @Query("SELECT s.status, COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :mentorId AND p.role = 'MENTOR' GROUP BY s.status")
    List<Object[]> getSessionStatusCountByMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT sk.name, COUNT(s) FROM Session s JOIN s.participants p JOIN s.skill sk WHERE p.user.id = :mentorId AND p.role = 'MENTOR' GROUP BY sk.name ORDER BY COUNT(s) DESC")
    List<Object[]> getSkillDistributionByMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT s.durationMinutes, COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :mentorId AND p.role = 'MENTOR' GROUP BY s.durationMinutes ORDER BY s.durationMinutes")
    List<Object[]> getDurationAnalysisByMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT s FROM Session s JOIN s.participants p WHERE p.user.id = :mentorId AND p.role = 'MENTOR' ORDER BY s.scheduledTime DESC")
    List<Session> getRecentSessionsByMentor(@Param("mentorId") Long mentorId, Pageable pageable);

    @Query("SELECT COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :mentorId AND p.role = 'MENTOR' AND s.status = 'REQUESTED'")
    Long countPendingRequestsByMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :mentorId AND p.role = 'MENTOR' AND s.status = 'COMPLETED'")
    Long countCompletedSessionsByMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM Session s JOIN s.participants p WHERE p.user.id = :mentorId AND p.role = 'MENTOR' AND s.status = 'COMPLETED'")
    Long getTotalMinutesTaughtByMentor(@Param("mentorId") Long mentorId);

    @Query("SELECT sk.name, COUNT(s), COALESCE(SUM(s.durationMinutes), 0) FROM Session s JOIN s.participants p JOIN s.skill sk WHERE p.user.id = :learnerId AND p.role = 'LEARNER' AND s.status = 'COMPLETED' GROUP BY sk.name ORDER BY COUNT(s) DESC")
    List<Object[]> getSkillProgressByLearner(@Param("learnerId") Long learnerId);

    @Query("SELECT s.status, COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :learnerId AND p.role = 'LEARNER' GROUP BY s.status")
    List<Object[]> getSessionStatusCountByLearner(@Param("learnerId") Long learnerId);

    @Query("SELECT COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :learnerId AND p.role = 'LEARNER' AND (s.status = 'ACCEPTED' OR s.status = 'REQUESTED')")
    Long countUpcomingSessionsByLearner(@Param("learnerId") Long learnerId);

    @Query("SELECT COUNT(s) FROM Session s JOIN s.participants p WHERE p.user.id = :learnerId AND p.role = 'LEARNER' AND s.status = 'COMPLETED'")
    Long countCompletedSessionsByLearner(@Param("learnerId") Long learnerId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM Session s JOIN s.participants p WHERE p.user.id = :learnerId AND p.role = 'LEARNER' AND s.status = 'COMPLETED'")
    Long getTotalMinutesLearnedByLearner(@Param("learnerId") Long learnerId);

    @Query("SELECT DISTINCT s FROM Session s LEFT JOIN FETCH s.feedbacks")
    List<Session> findAllWithFeedbacks();

    long countByStatus(SessionStatus status);
}