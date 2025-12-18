package com.talent_tandem.serviceImpl;

import com.talent_tandem.dao.ISessionDao;
import com.talent_tandem.dao.ISessionParticipantDao;
import com.talent_tandem.enums.ParticipantRole;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import com.talent_tandem.requestdto.AddParticipantRequest;
import com.talent_tandem.responsedto.SessionParticipantResponse;
import com.talent_tandem.responsedto.SessionWithParticipantsResponse;
import com.talent_tandem.service.ISessionParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionParticipantServiceImpl implements ISessionParticipantService {

    private final ISessionParticipantDao participantDao;
    private final ISessionDao sessionDao;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<SessionParticipantResponse> addParticipants(AddParticipantRequest request) {
        
        Session session = sessionDao.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<SessionParticipant> participants = request.getUserIds().stream()
                .map(userId -> participantDao.addParticipant(request.getSessionId(), userId, ParticipantRole.LEARNER))
                .collect(Collectors.toList());

        participants.forEach(participant -> {
            messagingTemplate.convertAndSend(
                "/queue/user/" + participant.getUser().getId() + "/sessions",
                "You have been added to session: " + session.getAgenda()
            );
        });
        return participants.stream()
                .map(this::buildParticipantResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SessionWithParticipantsResponse getSessionWithParticipants(Long sessionId) {
        
        Session session = sessionDao.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<SessionParticipant> participants = participantDao.findBySessionId(sessionId);

        SessionParticipant mentor = participants.stream()
                .filter(p -> p.getRole() == ParticipantRole.MENTOR)
                .findFirst().orElse(null);
        
        return SessionWithParticipantsResponse.builder()
                .sessionId(session.getSessionId())
                .mentorId(mentor != null ? mentor.getUser().getId() : null)
                .mentorName(mentor != null ? mentor.getUser().getUsername() : null)
                .agenda(session.getAgenda())
                .status(session.getStatus())
                .scheduledTime(session.getScheduledTime())
                .durationMinutes(session.getDurationMinutes())
                .learningOutcomes(session.getLearningOutcomes())
                .createdAt(session.getCreatedAt())
                .participants(participants.stream()
                        .map(this::buildParticipantResponse)
                        .collect(Collectors.toList()))
                .totalParticipants(participants.size())
                .build();
    }

    @Override
    public void removeParticipant(Long participantId) {
        
        SessionParticipant participant = participantDao.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        // Send WebSocket notification
        messagingTemplate.convertAndSend(
            "/queue/user/" + participant.getUser().getId() + "/sessions",
            "You have been removed from session"
        );

        participantDao.deleteById(participantId);
    }

    @Override
    public List<SessionParticipantResponse> getUserParticipations(Long userId) {
        return participantDao.findByUserId(userId)
                .stream()
                .map(this::buildParticipantResponse)
                .collect(Collectors.toList());
    }

    private SessionParticipantResponse buildParticipantResponse(SessionParticipant participant) {
        return SessionParticipantResponse.builder()
                .participantId(participant.getParticipantId())
                .sessionId(participant.getSession().getSessionId())
                .userId(participant.getUser().getId())
                .userName(participant.getUser().getUsername())
                .role(participant.getRole())
                .status(participant.getStatus())
                .joinedAt(participant.getJoinedAt())
                .leftAt(participant.getLeftAt())
                .build();
    }
}