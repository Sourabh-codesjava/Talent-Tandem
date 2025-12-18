package com.talent_tandem.daoImpl;

import com.talent_tandem.dao.IFeedbackDao;
import com.talent_tandem.model.Feedback;
import com.talent_tandem.repository.IFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FeedbackDaoImpl implements IFeedbackDao {

    private final IFeedbackRepository repository;

    @Override
    public Feedback save(Feedback feedback) {
        return repository.save(feedback);
    }

    @Override
    public Optional<Feedback> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Feedback> findBySessionId(Long sessionId) {
        return repository.findBySessionSessionId(sessionId);
    }

    @Override
    public List<Feedback> findByToUserId(Long toUserId) {
        return repository.findByToUserIdOrderByCreatedAtDesc(toUserId);
    }

    @Override
    public List<Feedback> findByFromUserId(Long fromUserId) {
        return repository.findByFromUserIdOrderByCreatedAtDesc(fromUserId);
    }

    @Override
    public Optional<Feedback> findBySessionIdAndFromUserId(Long sessionId, Long fromUserId) {
        return repository.findBySessionSessionIdAndFromUserId(sessionId, fromUserId);
    }
}
