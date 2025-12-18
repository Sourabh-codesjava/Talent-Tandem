package com.talent_tandem.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum SessionStatus {
    REQUESTED,
    ACCEPTED,
    LIVE,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    @JsonCreator
    public static SessionStatus fromString(String value) {
        try {
            return SessionStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid session status: " + value + ". Valid values are: REQUESTED, ACCEPTED, LIVE, IN_PROGRESS, COMPLETED, CANCELLED");
        }
    }
}