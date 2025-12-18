package com.talent_tandem.daoImpl;

import com.talent_tandem.dao.ISessionParticipantDao;
import com.talent_tandem.dao.ISessionDao;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.enums.ParticipantStatus;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import com.talent_tandem.model.User;
import com.talent_tandem.repository.ISessionParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SessionParticipantDaoImpl implements ISessionParticipantDao {

    private final ISessionParticipantRepository participantRepository;
    private final ISessionDao sessionDao;
    private final IUserDao userDao;

    @Override
    public SessionParticipant save(SessionParticipant participant) {
        return participantRepository.save(participant);
    }

    @Override
    public List<SessionParticipant> saveAll(List<SessionParticipant> participants) {
        return participantRepository.saveAll(participants);
    }

    @Override
    public List<SessionParticipant> findBySessionId(Long sessionId) {
        return participantRepository.findBySessionSessionId(sessionId);
    }

    @Override
    public List<SessionParticipant> findByUserId(Long userId) {
        return participantRepository.findByUserIdOrderByJoinedAtDesc(userId);
    }

    @Override
    public Optional<SessionParticipant> findById(Long participantId) {
        return participantRepository.findById(participantId);
    }

    @Override
    public void deleteById(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    @Override
    public void deleteBySessionIdAndUserId(Long sessionId, Long userId) {
        participantRepository.deleteBySessionSessionIdAndUserId(sessionId, userId);
    }

    @Override
    public SessionParticipant addParticipant(Long sessionId, Long userId, ParticipantRole role) {
        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        User user = userDao.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SessionParticipant participant = SessionParticipant.builder()
                .session(session)
                .user(user)
                .role(role)
                .status(ParticipantStatus.JOINED)
                .build();

        return participantRepository.save(participant);
    }
}