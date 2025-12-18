package com.talent_tandem.requestdto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FeedbackRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private Integer rating;

    @NotNull(message = "Difficulty level is required")
    @Min(value = 1, message = "Difficulty level must be at least 1")
    @Max(value = 5, message = "Difficulty level must not exceed 5")
    private Integer difficultyLevel;

    @NotNull(message = "Clarity score is required")
    @Min(value = 1, message = "Clarity score must be at least 1")
    @Max(value = 5, message = "Clarity score must not exceed 5")
    private Integer clarityScore;

    @NotNull(message = "Value score is required")
    @Min(value = 1, message = "Value score must be at least 1")
    @Max(value = 5, message = "Value score must not exceed 5")
    private Integer valueScore;

    private String comments;

    @NotNull(message = "From user ID is required")
    private Long fromUserId;

    @NotNull(message = "To user ID is required")
    private Long toUserId;
}
