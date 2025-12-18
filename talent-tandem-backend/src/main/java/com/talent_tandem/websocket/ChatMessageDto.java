package com.talent_tandem.websocket;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageDto {
    private Long sessionId;
    private Long senderId;
    private String senderName;
    private String message;
    private LocalDateTime timestamp;
}
