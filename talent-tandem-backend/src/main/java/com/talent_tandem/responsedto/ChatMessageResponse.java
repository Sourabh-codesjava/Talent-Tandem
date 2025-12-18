package com.talent_tandem.responsedto;

import com.talent_tandem.model.MessageType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long messageId;
    private Long sessionId;
    private Long senderId;
    private String senderName;
    private String content;
    private MessageType type;
    private LocalDateTime sentAt;
}