package com.talent_tandem.repository;

import com.talent_tandem.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IFeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findBySessionSessionId(Long sessionId);
    List<Feedback> findBySession_SessionId(Long sessionId);
    List<Feedback> findByToUserIdOrderByCreatedAtDesc(Long toUserId);
    List<Feedback> findByFromUserIdOrderByCreatedAtDesc(Long fromUserId);
    Optional<Feedback> findBySessionSessionIdAndFromUserId(Long sessionId, Long fromUserId);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double findAverageRating();

}
