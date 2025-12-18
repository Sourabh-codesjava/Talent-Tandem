package com.talent_tandem.responsedto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String country;
    private String city;
    private String phoneNumber;
    private String profilePhoto;
    private String email;
    private String username;
    private String role;
}
