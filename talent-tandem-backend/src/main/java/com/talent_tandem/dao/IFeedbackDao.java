package com.talent_tandem.dao;

import com.talent_tandem.model.Feedback;
import java.util.List;
import java.util.Optional;

public interface IFeedbackDao {
    
    Feedback save(Feedback feedback);
    Optional<Feedback> findById(Long id);
    List<Feedback> findBySessionId(Long sessionId);
    List<Feedback> findByToUserId(Long toUserId);
    List<Feedback> findByFromUserId(Long fromUserId);
    Optional<Feedback> findBySessionIdAndFromUserId(Long sessionId, Long fromUserId);
}
