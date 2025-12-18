package com.talent_tandem.exception;

public class SessionNotFoundException extends RuntimeException {
    public SessionNotFoundException(String message) {
        super(message);
    }
    
    public SessionNotFoundException(Long sessionId) {
        super("Session not found with ID: " + sessionId);
    }
}