package com.talent_tandem.responsedto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePhoto;
    private Boolean hasMentorProfile;
    private Boolean hasLearnerProfile;



    private Integer age;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
