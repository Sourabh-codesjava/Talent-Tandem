package com.talent_tandem.websocket;
import com.talent_tandem.enums.SessionStatus;
import lombok.Data;

@Data
public class SessionStatusDto {
    private Long sessionId;
    private SessionStatus status;
    private String message;
}