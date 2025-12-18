package com.talent_tandem.dao;

import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.model.SessionParticipant;
import java.util.List;
import java.util.Optional;

public interface ISessionParticipantDao {
    
    SessionParticipant save(SessionParticipant participant);
    List<SessionParticipant> saveAll(List<SessionParticipant> participants);
    List<SessionParticipant> findBySessionId(Long sessionId);
    List<SessionParticipant> findByUserId(Long userId);
    Optional<SessionParticipant> findById(Long participantId);
    void deleteById(Long participantId);
    void deleteBySessionIdAndUserId(Long sessionId, Long userId);
    SessionParticipant addParticipant(Long sessionId, Long userId, ParticipantRole role);
}