package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreChatResponse {
    private Long id;
    private Long sessionId;
    private Long senderId;
    private Long receiverId;
    private String senderName;
    private String senderRole;
    private String message;
    private LocalDateTime sentAt;
}
