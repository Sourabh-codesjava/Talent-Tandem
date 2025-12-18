package com.talent_tandem.repository;

import com.talent_tandem.model.PreChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IPreChatRepository extends JpaRepository<PreChatMessage, Long> {
    List<PreChatMessage> findBySessionIdOrderBySentAtAsc(Long sessionId);
}
