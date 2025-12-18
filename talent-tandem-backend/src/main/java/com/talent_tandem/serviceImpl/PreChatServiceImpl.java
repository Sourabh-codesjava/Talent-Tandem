package com.talent_tandem.serviceImpl;

import com.talent_tandem.enums.SessionStatus;
import com.talent_tandem.exception.UnauthorizedAccessException;
import com.talent_tandem.model.PreChatMessage;
import com.talent_tandem.model.Session;
import com.talent_tandem.model.SessionParticipant;
import com.talent_tandem.repository.IPreChatRepository;
import com.talent_tandem.repository.ISessionRepository;
import com.talent_tandem.requestdto.PreChatRequest;
import com.talent_tandem.responsedto.PreChatResponse;
import com.talent_tandem.service.IPreChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PreChatServiceImpl implements IPreChatService {

    private final IPreChatRepository preChatRepository;
    private final ISessionRepository sessionRepository;

    @Override
    @Transactional
    public PreChatResponse sendMessage(PreChatRequest request, Long senderId) {
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.ACCEPTED) {
            throw new UnauthorizedAccessException("Pre-chat is only allowed for ACCEPTED sessions. Current status: " + session.getStatus());
        }

        boolean isParticipant = session.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(senderId));

        if (!isParticipant) {
            throw new UnauthorizedAccessException("You are not a participant of this session");
        }

        PreChatMessage message = PreChatMessage.builder()
                .sessionId(request.getSessionId())
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .message(request.getMessage())
                .build();

        PreChatMessage saved = preChatRepository.save(message);

        // Determine sender role and name from session participants
        String senderName = "Unknown";
        String senderRole = "UNKNOWN";
        
        for (SessionParticipant participant : session.getParticipants()) {
            if (participant.getUser().getId().equals(senderId)) {
                senderName = participant.getUser().getFirstName() != null && !participant.getUser().getFirstName().isEmpty() ? 
                    participant.getUser().getFirstName() : participant.getUser().getUsername();
                senderRole = participant.getRole().name(); // LEARNER or MENTOR
                break;
            }
        }

        return PreChatResponse.builder()
                .id(saved.getId())
                .sessionId(saved.getSessionId())
                .senderId(saved.getSenderId())
                .receiverId(saved.getReceiverId())
                .senderName(senderName)
                .senderRole(senderRole)
                .message(saved.getMessage())
                .sentAt(saved.getSentAt())
                .build();
    }

    @Override
    public List<PreChatResponse> getMessages(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != SessionStatus.ACCEPTED) {
            throw new UnauthorizedAccessException("Pre-chat is only allowed for ACCEPTED sessions. Current status: " + session.getStatus());
        }

        boolean isParticipant = session.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));

        if (!isParticipant) {
            throw new UnauthorizedAccessException("You are not a participant of this session");
        }

        return preChatRepository.findBySessionIdOrderBySentAtAsc(sessionId).stream()
                .map(msg -> {
                    // Determine sender role and name from session participants
                    String senderName = "Unknown";
                    String senderRole = "UNKNOWN";
                    
                    for (SessionParticipant participant : session.getParticipants()) {
                        if (participant.getUser().getId().equals(msg.getSenderId())) {
                            senderName = participant.getUser().getFirstName() != null && !participant.getUser().getFirstName().isEmpty() ? 
                                participant.getUser().getFirstName() : participant.getUser().getUsername();
                            senderRole = participant.getRole().name(); // LEARNER or MENTOR
                            break;
                        }
                    }
                    
                    return PreChatResponse.builder()
                            .id(msg.getId())
                            .sessionId(msg.getSessionId())
                            .senderId(msg.getSenderId())
                            .receiverId(msg.getReceiverId())
                            .senderName(senderName)
                            .senderRole(senderRole)
                            .message(msg.getMessage())
                            .sentAt(msg.getSentAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
