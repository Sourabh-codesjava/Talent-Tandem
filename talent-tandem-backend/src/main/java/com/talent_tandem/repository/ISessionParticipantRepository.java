package com.talent_tandem.repository;

import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.model.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ISessionParticipantRepository extends JpaRepository<SessionParticipant, Long> {
    
    List<SessionParticipant> findBySessionSessionId(Long sessionId);
    List<SessionParticipant> findByUserIdOrderByJoinedAtDesc(Long userId);
    void deleteBySessionSessionIdAndUserId(Long sessionId, Long userId);
    Long countByUserIdAndRole(Long userId, ParticipantRole role);
}