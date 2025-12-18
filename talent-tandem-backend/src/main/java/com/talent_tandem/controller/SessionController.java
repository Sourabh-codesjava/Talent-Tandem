package com.talent_tandem.controller;
import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.requestdto.SessionRequest;
import com.talent_tandem.responsedto.LearnerDashboardStatsResponse;
import com.talent_tandem.responsedto.MentorDashboardStatsResponse;
import com.talent_tandem.responsedto.SessionCompleteResponse;
import com.talent_tandem.responsedto.SessionJoinResponse;
import com.talent_tandem.responsedto.SessionResponse;
import com.talent_tandem.responsedto.SessionStartResponse;
import com.talent_tandem.security.JwtUtil;
import com.talent_tandem.service.ISessionService;
import com.talent_tandem.websocket.MatchNotificationDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final ISessionService sessionService;
    private final JwtUtil jwtUtil;

    @PostMapping("/book")
    public ResponseEntity<SessionResponse> bookSession(@Valid @RequestBody SessionRequest request) {
        SessionResponse session = sessionService.createSession(request);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PutMapping("/{sessionId}/status")
    public ResponseEntity<SessionResponse> updateStatus(
            @PathVariable Long sessionId, 
            @RequestParam SessionStatus status) {
        SessionResponse session = sessionService.updateSessionStatus(sessionId, status);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SessionResponse>> getUserSessions(@PathVariable Long userId) {
        return ResponseEntity.ok(sessionService.getSessionsByUser(userId));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionById(sessionId));
    }

    @PostMapping("/notify-match")
    public ResponseEntity<String> notifyMatch(@RequestBody MatchNotificationDto matchDto) {
        sessionService.sendMatchNotification(matchDto);
        return ResponseEntity.ok("Match notification sent");
    }

    @PostMapping("/join/{sessionId}")
    public ResponseEntity<SessionJoinResponse> joinSession(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long learnerId = jwtUtil.extractUserId(token);
        
        SessionJoinResponse response = sessionService.joinSession(sessionId, learnerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/start/{sessionId}")
    public ResponseEntity<SessionStartResponse> startSession(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long mentorId = jwtUtil.extractUserId(token);
        
        return ResponseEntity.ok(sessionService.startSession(sessionId, mentorId));
    }

    @PostMapping("/complete/{sessionId}")
    public ResponseEntity<SessionCompleteResponse> completeSession(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long mentorId = jwtUtil.extractUserId(token);
        
        return ResponseEntity.ok(sessionService.completeSession(sessionId, mentorId));
    }

    @GetMapping("/mentor/{mentorId}/dashboard-stats")
    public ResponseEntity<MentorDashboardStatsResponse> getMentorDashboardStats(@PathVariable Long mentorId) {
        return ResponseEntity.ok(sessionService.getMentorDashboardStats(mentorId));
    }

    @GetMapping("/learner/{learnerId}/dashboard-stats")
    public ResponseEntity<LearnerDashboardStatsResponse> getLearnerDashboardStats(@PathVariable Long learnerId) {
        return ResponseEntity.ok(sessionService.getLearnerDashboardStats(learnerId));
    }

    @PostMapping("/cancel-by-mentor/{sessionId}")
    public ResponseEntity<SessionResponse> cancelByMentor(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long mentorId = jwtUtil.extractUserId(token);
        
        SessionResponse response = sessionService.cancelSessionByMentor(sessionId, mentorId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel-by-learner/{sessionId}")
    public ResponseEntity<SessionResponse> cancelByLearner(
            @PathVariable Long sessionId,
            @RequestHeader("Authorization") String authHeader) {
        
        String token = authHeader.substring(7);
        Long learnerId = jwtUtil.extractUserId(token);
        
        SessionResponse response = sessionService.cancelSessionByLearner(sessionId, learnerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SessionResponse>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }
}