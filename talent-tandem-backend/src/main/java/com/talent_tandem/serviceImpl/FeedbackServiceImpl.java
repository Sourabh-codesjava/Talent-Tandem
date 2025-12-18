package com.talent_tandem.serviceImpl;

import com.talent_tandem.dao.IFeedbackDao;
import com.talent_tandem.dao.ISessionDao;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.exception.DuplicateResourceException;
import com.talent_tandem.exception.InvalidSessionStatusException;
import com.talent_tandem.exception.ResourceNotFoundException;
import com.talent_tandem.exception.ValidationException;
import com.talent_tandem.model.Feedback;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.User;
import com.talent_tandem.requestdto.FeedbackRequest;
import com.talent_tandem.responsedto.FeedbackResponse;
import com.talent_tandem.responsedto.MentorRatingResponse;
import com.talent_tandem.service.IFeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements IFeedbackService {

    private final IFeedbackDao feedbackDao;
    private final ISessionDao sessionDao;
    private final IUserDao userDao;

    @Override
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        log.info("Submitting feedback for session: {} from user: {} to user: {}", 
                request.getSessionId(), request.getFromUserId(), request.getToUserId());
        
        validateFeedbackRequest(request);

        if (feedbackDao.findBySessionIdAndFromUserId(request.getSessionId(), request.getFromUserId()).isPresent()) {
            log.warn("Duplicate feedback attempt for session: {} by user: {}", 
                    request.getSessionId(), request.getFromUserId());
            throw new DuplicateResourceException("Feedback already submitted for this session");
        }

        Session session = sessionDao.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + request.getSessionId()));

        if (session.getStatus() != SessionStatus.COMPLETED) {
            log.warn("Attempt to submit feedback for non-completed session: {} with status: {}", 
                    session.getSessionId(), session.getStatus());
            throw new InvalidSessionStatusException("Feedback can only be submitted for completed sessions");
        }

        User fromUser = userDao.findById(request.getFromUserId())
                .orElseThrow(() -> new ResourceNotFoundException("From user not found with id: " + request.getFromUserId()));

        User toUser = userDao.findById(request.getToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("To user not found with id: " + request.getToUserId()));

        Feedback feedback = Feedback.builder()
                .session(session)
                .rating(request.getRating())
                .difficultyLevel(request.getDifficultyLevel())
                .clarityScore(request.getClarityScore())
                .valueScore(request.getValueScore())
                .comments(request.getComments())
                .fromUser(fromUser)
                .toUser(toUser)
                .build();

        Feedback saved = feedbackDao.save(feedback);
        log.info("Feedback submitted successfully with id: {} for session: {}", saved.getId(), session.getSessionId());
        return buildResponse(saved);
    }

    @Override
    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
        return buildResponse(feedback);
    }

    @Override
    public List<FeedbackResponse> getFeedbacksBySession(Long sessionId) {
        return feedbackDao.findBySessionId(sessionId)
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFeedbacksReceivedByUser(Long userId) {
        return feedbackDao.findByToUserId(userId)
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFeedbacksGivenByUser(Long userId) {
        return feedbackDao.findByFromUserId(userId)
                .stream()
                .map(this::buildResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MentorRatingResponse getMentorRating(Long mentorId) {
        log.info("Calculating rating for mentor: {}", mentorId);
        
        List<Feedback> feedbacks = feedbackDao.findByToUserId(mentorId);
        
        if (feedbacks.isEmpty()) {
            log.info("No feedbacks found for mentor: {}", mentorId);
            return MentorRatingResponse.builder()
                    .averageRating(0.0)
                    .totalReviews(0L)
                    .clarityAverage(0.0)
                    .valueAverage(0.0)
                    .build();
        }
        
        double avgRating = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
        
        double avgClarity = feedbacks.stream()
                .mapToInt(Feedback::getClarityScore)
                .average()
                .orElse(0.0);
        
        double avgValue = feedbacks.stream()
                .mapToInt(Feedback::getValueScore)
                .average()
                .orElse(0.0);
        
        MentorRatingResponse response = MentorRatingResponse.builder()
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews((long) feedbacks.size())
                .clarityAverage(Math.round(avgClarity * 10.0) / 10.0)
                .valueAverage(Math.round(avgValue * 10.0) / 10.0)
                .build();
        
        log.info("Rating calculated for mentor: {} - Average: {}, Total: {}", 
                mentorId, response.getAverageRating(), response.getTotalReviews());
        
        return response;
    }

    private FeedbackResponse buildResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .sessionId(feedback.getSession().getSessionId())
                .rating(feedback.getRating())
                .difficultyLevel(feedback.getDifficultyLevel())
                .clarityScore(feedback.getClarityScore())
                .valueScore(feedback.getValueScore())
                .comments(feedback.getComments())
                .fromUserId(feedback.getFromUser().getId())
                .fromUserName(feedback.getFromUser().getUsername())
                .toUserId(feedback.getToUser().getId())
                .toUserName(feedback.getToUser().getUsername())
                .createdAt(feedback.getCreatedAt() != null ? feedback.getCreatedAt().toString() : null)
                .build();
    }

    private void validateFeedbackRequest(FeedbackRequest request) {
        if (request == null) {
            throw new ValidationException("Request cannot be null");
        }
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }
        if (request.getDifficultyLevel() < 1 || request.getDifficultyLevel() > 5) {
            throw new ValidationException("Difficulty level must be between 1 and 5");
        }
        if (request.getClarityScore() < 1 || request.getClarityScore() > 5) {
            throw new ValidationException("Clarity score must be between 1 and 5");
        }
        if (request.getValueScore() < 1 || request.getValueScore() > 5) {
            throw new ValidationException("Value score must be between 1 and 5");
        }
    }
}
