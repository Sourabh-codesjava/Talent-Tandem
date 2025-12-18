package com.talent_tandem.responsedto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopMentorResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String username;
    private String profilePhoto;
    private Long completedSessions;
    private Double averageRating;
}
