package com.talent_tandem.requestdto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class AddParticipantRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "User IDs are required")
    private List<Long> userIds;
}