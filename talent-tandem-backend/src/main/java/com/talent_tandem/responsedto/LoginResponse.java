package com.talent_tandem.responsedto;

import com.fasterxml.jackson.core.JsonToken;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePhoto;
    private String message;
    private Boolean status;
    private String accessToken;
    private String refreshToken;
    private Boolean hasMentorProfile;
    private Boolean hasLearnerProfile;
    private String role;

}
