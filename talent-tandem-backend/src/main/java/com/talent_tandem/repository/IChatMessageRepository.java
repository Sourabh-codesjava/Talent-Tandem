package com.talent_tandem.repository;
import com.talent_tandem.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findBySessionSessionIdOrderBySentAtAsc(Long sessionId);
}