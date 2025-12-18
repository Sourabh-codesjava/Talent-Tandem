package com.talent_tandem.controller;
import com.talent_tandem.requestdto.AddParticipantRequest;
import com.talent_tandem.responsedto.SessionParticipantResponse;
import com.talent_tandem.responsedto.SessionWithParticipantsResponse;
import com.talent_tandem.service.ISessionParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/session-participants")
@RequiredArgsConstructor
public class SessionParticipantController {

    private final ISessionParticipantService participantService;

    @PostMapping("/add")
    public ResponseEntity<List<SessionParticipantResponse>> addParticipants(
            @Valid @RequestBody AddParticipantRequest request) {
        List<SessionParticipantResponse> participants = participantService.addParticipants(request);
        return new ResponseEntity<>(participants, HttpStatus.CREATED);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SessionWithParticipantsResponse> getSessionWithParticipants(
            @PathVariable Long sessionId) {
        SessionWithParticipantsResponse response = participantService.getSessionWithParticipants(sessionId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{participantId}")
    public ResponseEntity<String> removeParticipant(@PathVariable Long participantId) {
        participantService.removeParticipant(participantId);
        return ResponseEntity.ok("Participant removed successfully");
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SessionParticipantResponse>> getUserParticipations(
            @PathVariable Long userId) {
        List<SessionParticipantResponse> participations = participantService.getUserParticipations(userId);
        return ResponseEntity.ok(participations);
    }
}