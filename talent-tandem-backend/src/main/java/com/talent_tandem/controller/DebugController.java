package com.talent_tandem.controller;

import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import com.talent_tandem.repository.ISessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final ISessionRepository sessionRepository;

    @GetMapping("/session/{sessionId}/participants")
    public ResponseEntity<?> getSessionParticipants(@PathVariable Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Map<String, Object>> participants = session.getParticipants().stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("participantId", p.getParticipantId());
                    map.put("userId", p.getUser().getId());
                    map.put("username", p.getUser().getUsername());
                    map.put("firstName", p.getUser().getFirstName());
                    map.put("role", p.getRole().name());
                    map.put("status", p.getStatus().name());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("participants", participants);
        
        return ResponseEntity.ok(response);
    }
}
