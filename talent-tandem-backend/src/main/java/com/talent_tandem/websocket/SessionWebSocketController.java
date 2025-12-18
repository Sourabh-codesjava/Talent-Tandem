package com.talent_tandem.websocket;

import com.talent_tandem.service.ISessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SessionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ISessionService sessionService;

    @MessageMapping("/session.updateStatus")
    public void updateSessionStatus(@Payload SessionStatusDto statusDto) {
        // Update session and get the updated details
        var updatedSession = sessionService.updateSessionStatus(statusDto.getSessionId(), statusDto.getStatus());

        // Broadcast update to the session topic (for live updates if viewing the
        // session)
        messagingTemplate.convertAndSend(
                "/topic/session/" + statusDto.getSessionId() + "/status",
                statusDto);

        // Notify the learner about the status update (Accepted/Rejected)
        if (updatedSession.getLearnerId() != null) {
            String action = statusDto.getStatus().toString();
            String message = "Your session for " + updatedSession.getSkillName() + " has been " + action;
            statusDto.setMessage(message);

            messagingTemplate.convertAndSend(
                    "/queue/user/" + updatedSession.getLearnerId() + "/sessions",
                    statusDto);
        }
    }

    @MessageMapping("/chat/{sessionId}")
    public void sendChatMessage(
            @DestinationVariable Long sessionId,
            @Payload ChatMessageDto chatMessage) {
        chatMessage.setSessionId(sessionId);

        // ✅ Broadcast to BOTH mentor & learner in same session
        messagingTemplate.convertAndSend(
                "/topic/chat/" + sessionId,
                chatMessage);
    }

    @MessageMapping("/match.notify")
    public void notifyMatch(@Payload MatchNotificationDto matchDto) {
        messagingTemplate.convertAndSend(
                "/queue/user/" + matchDto.getLearnerId() + "/matches",
                matchDto);
    }

    @MessageMapping("/session.book")
    public void notifySessionBooked(@Payload SessionBookingDto bookingDto) {
        messagingTemplate.convertAndSend(
                "/queue/user/" + bookingDto.getMentorId() + "/sessions",
                bookingDto);
    }
}