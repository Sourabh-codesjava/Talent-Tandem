package com.talent_tandem.exception;

public class InvalidSessionStatusException extends RuntimeException {
    public InvalidSessionStatusException(String message) {
        super(message);
    }
}