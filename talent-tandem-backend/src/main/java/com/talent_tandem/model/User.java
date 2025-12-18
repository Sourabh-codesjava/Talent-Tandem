package com.talent_tandem.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.talent_tandem.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(unique = true, length = 100, nullable = false)
    private String email;

    @Column(unique = true, length = 100)
    private String username;

    @JsonIgnore
    @Column(length = 255)
    private String password;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @Column(name = "has_mentor_profile")
    private Boolean hasMentorProfile = false;

    @Column(name = "has_learner_profile")
    private Boolean hasLearnerProfile = false;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;
    
    @Column(name = "is_suspended")
    private Boolean isSuspended = false;

    @Column(name = "email_otp")
    private String emailOtp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    private LocalDateTime createdAt;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @Column(name = "role_selected")
    private Boolean roleSelected = false;
    
    @Column(name = "suspension_reason")
    private String suspensionReason;
    
    @Column(name = "is_temporary")
    private Boolean isTemporary = false;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


}
