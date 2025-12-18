package com.talent_tandem.service;

import com.talent_tandem.requestdto.FeedbackRequest;
import com.talent_tandem.responsedto.FeedbackResponse;
import com.talent_tandem.responsedto.MentorRatingResponse;
import java.util.List;

public interface IFeedbackService {
    
    FeedbackResponse submitFeedback(FeedbackRequest request);
    FeedbackResponse getFeedbackById(Long id);
    List<FeedbackResponse> getFeedbacksBySession(Long sessionId);
    List<FeedbackResponse> getFeedbacksReceivedByUser(Long userId);
    List<FeedbackResponse> getFeedbacksGivenByUser(Long userId);
    MentorRatingResponse getMentorRating(Long mentorId);
}
