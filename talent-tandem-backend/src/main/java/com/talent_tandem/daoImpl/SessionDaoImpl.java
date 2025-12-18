package com.talent_tandem.daoImpl;
import com.talent_tandem.dao.ISessionDao;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import com.talent_tandem.repository.ISessionRepository;
import com.talent_tandem.repository.ISessionParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SessionDaoImpl implements ISessionDao {

    private final ISessionRepository sessionRepository;
    private final ISessionParticipantRepository sessionParticipantRepository;

    @Override
    public Session save(Session session) {

        return sessionRepository.save(session);
    }

    @Override
    public Optional<Session> findById(Long sessionId) {
        return sessionRepository.findById(sessionId);
    }

    @Override
    public List<Session> findByUserId(Long userId) {
        return sessionRepository.findByUserId(userId);
    }

    @Override
    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    @Override
    public Session updateStatus(Long sessionId, SessionStatus status) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.setStatus(status);
            return sessionRepository.save(session);
        }
        throw new RuntimeException("Session not found with id: " + sessionId);
    }

    @Override
    public SessionParticipant saveParticipant(SessionParticipant participant) {
        return sessionParticipantRepository.save(participant);
    }

    @Override
    public Optional<Session> findByIdWithParticipants(Long sessionId) {
        return Optional.empty();
    }

    @Override
    public List<Object[]> getSessionStatusCountByMentor(Long mentorId) {
        return sessionRepository.getSessionStatusCountByMentor(mentorId);
    }

    @Override
    public List<Object[]> getSkillDistributionByMentor(Long mentorId) {
        return sessionRepository.getSkillDistributionByMentor(mentorId);
    }

    @Override
    public List<Object[]> getDurationAnalysisByMentor(Long mentorId) {
        return sessionRepository.getDurationAnalysisByMentor(mentorId);
    }

    @Override
    public List<Session> getRecentSessionsByMentor(Long mentorId, int limit) {
        return sessionRepository.getRecentSessionsByMentor(mentorId, PageRequest.of(0, limit));
    }

    @Override
    public Long countPendingRequestsByMentor(Long mentorId) {
        return sessionRepository.countPendingRequestsByMentor(mentorId);
    }

    @Override
    public Long countCompletedSessionsByMentor(Long mentorId) {
        return sessionRepository.countCompletedSessionsByMentor(mentorId);
    }

    @Override
    public Long getTotalMinutesTaughtByMentor(Long mentorId) {
        return sessionRepository.getTotalMinutesTaughtByMentor(mentorId);
    }

    @Override
    public Long countUpcomingSessionsByLearner(Long learnerId) {
        return sessionRepository.countUpcomingSessionsByLearner(learnerId);
    }

    @Override
    public Long countCompletedSessionsByLearner(Long learnerId) {
        return sessionRepository.countCompletedSessionsByLearner(learnerId);
    }

    @Override
    public Long getTotalMinutesLearnedByLearner(Long learnerId) {
        return sessionRepository.getTotalMinutesLearnedByLearner(learnerId);
    }

    @Override
    public List<Object[]> getSkillProgressByLearner(Long learnerId) {
        return sessionRepository.getSkillProgressByLearner(learnerId);
    }

    @Override
    public List<Object[]> getSessionStatusCountByLearner(Long learnerId) {
        return sessionRepository.getSessionStatusCountByLearner(learnerId);
    }
}