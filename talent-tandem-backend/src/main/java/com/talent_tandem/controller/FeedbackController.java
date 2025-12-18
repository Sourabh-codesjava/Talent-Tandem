package com.talent_tandem.controller;

import com.talent_tandem.requestdto.FeedbackRequest;
import com.talent_tandem.responsedto.ApiResponse;
import com.talent_tandem.responsedto.FeedbackResponse;
import com.talent_tandem.responsedto.MentorRatingResponse;
import com.talent_tandem.service.IFeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Slf4j
public class FeedbackController {

    private final IFeedbackService feedbackService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        log.info("Received feedback submission request for session: {}", request.getSessionId());
        FeedbackResponse response = feedbackService.submitFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable Long id) {
        FeedbackResponse response = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksBySession(@PathVariable Long sessionId) {
        List<FeedbackResponse> responses = feedbackService.getFeedbacksBySession(sessionId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/received/{userId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksReceivedByUser(@PathVariable Long userId) {
        List<FeedbackResponse> responses = feedbackService.getFeedbacksReceivedByUser(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/given/{userId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksGivenByUser(@PathVariable Long userId) {
        List<FeedbackResponse> responses = feedbackService.getFeedbacksGivenByUser(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/mentors/{mentorId}/rating")
    public ResponseEntity<MentorRatingResponse> getMentorRating(@PathVariable Long mentorId) {
        MentorRatingResponse response = feedbackService.getMentorRating(mentorId);
        return ResponseEntity.ok(response);
    }
}
