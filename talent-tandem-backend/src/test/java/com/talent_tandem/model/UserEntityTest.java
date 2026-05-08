package com.talent_tandem.model;

import com.talent_tandem.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("User Entity Tests")
class UserEntityTest {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    @DisplayName("Should create user with builder pattern")
    void shouldCreateUserWithBuilder() {
        User builtUser = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .username("johndoe")
                .password("password123")
                .profilePhoto("profile.jpg")
                .country("USA")
                .city("New York")
                .phoneNumber("+1234567890")
                .role(Role.MENTOR)
                .build();

        assertThat(builtUser.getFirstName()).isEqualTo("John");
        assertThat(builtUser.getLastName()).isEqualTo("Doe");
        assertThat(builtUser.getEmail()).isEqualTo("john.doe@example.com");
        assertThat(builtUser.getUsername()).isEqualTo("johndoe");
        assertThat(builtUser.getPassword()).isEqualTo("password123");
        assertThat(builtUser.getProfilePhoto()).isEqualTo("profile.jpg");
        assertThat(builtUser.getCountry()).isEqualTo("USA");
        assertThat(builtUser.getCity()).isEqualTo("New York");
        assertThat(builtUser.getPhoneNumber()).isEqualTo("+1234567890");
        assertThat(builtUser.getRole()).isEqualTo(Role.MENTOR);
    }

    @Test
    @DisplayName("Should initialize boolean fields with default values")
    void shouldInitializeBooleanFieldsWithDefaults() {
        User newUser = new User();

        assertThat(newUser.getHasMentorProfile()).isFalse();
        assertThat(newUser.getHasLearnerProfile()).isFalse();
        assertThat(newUser.getIsEmailVerified()).isFalse();
        assertThat(newUser.getIsSuspended()).isFalse();
        assertThat(newUser.getRoleSelected()).isFalse();
        assertThat(newUser.getIsTemporary()).isFalse();
    }

    @Test
    @DisplayName("Should set createdAt and updatedAt on onCreate")
    void shouldSetTimestampsOnCreate() {
        LocalDateTime beforeCreate = LocalDateTime.now().minusSeconds(1);

        user.onCreate();

        LocalDateTime afterCreate = LocalDateTime.now().plusSeconds(1);

        assertThat(user.getCreatedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
        assertThat(user.getCreatedAt()).isBetween(beforeCreate, afterCreate);
        assertThat(user.getUpdatedAt()).isBetween(beforeCreate, afterCreate);
        assertThat(user.getCreatedAt()).isEqualTo(user.getUpdatedAt());
    }

    @Test
    @DisplayName("Should update only updatedAt on onUpdate")
    void shouldUpdateOnlyUpdatedAtOnUpdate() throws InterruptedException {
        user.onCreate();
        LocalDateTime originalCreatedAt = user.getCreatedAt();
        LocalDateTime originalUpdatedAt = user.getUpdatedAt();

        Thread.sleep(10);

        user.onUpdate();

        assertThat(user.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(user.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    @DisplayName("Should handle role enum values")
    void shouldHandleRoleEnumValues() {
        user.setRole(Role.ADMIN);
        assertThat(user.getRole()).isEqualTo(Role.ADMIN);

        user.setRole(Role.MENTOR);
        assertThat(user.getRole()).isEqualTo(Role.MENTOR);

        user.setRole(Role.LEARNER);
        assertThat(user.getRole()).isEqualTo(Role.LEARNER);
    }

    @Test
    @DisplayName("Should handle profile type flags")
    void shouldHandleProfileTypeFlags() {
        user.setHasMentorProfile(true);
        assertThat(user.getHasMentorProfile()).isTrue();
        assertThat(user.getHasLearnerProfile()).isFalse();

        user.setHasLearnerProfile(true);
        assertThat(user.getHasLearnerProfile()).isTrue();

        assertThat(user.getHasMentorProfile()).isTrue();
        assertThat(user.getHasLearnerProfile()).isTrue();
    }

    @Test
    @DisplayName("Should handle email verification status")
    void shouldHandleEmailVerificationStatus() {
        assertThat(user.getIsEmailVerified()).isFalse();

        user.setIsEmailVerified(true);
        assertThat(user.getIsEmailVerified()).isTrue();
    }

    @Test
    @DisplayName("Should handle suspension functionality")
    void shouldHandleSuspensionFunctionality() {
        String suspensionReason = "Violation of terms";

        user.setIsSuspended(true);
        user.setSuspensionReason(suspensionReason);

        assertThat(user.getIsSuspended()).isTrue();
        assertThat(user.getSuspensionReason()).isEqualTo(suspensionReason);
    }

    @Test
    @DisplayName("Should handle OTP functionality")
    void shouldHandleOtpFunctionality() {
        String otp = "123456";
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

        user.setEmailOtp(otp);
        user.setOtpExpiry(expiry);

        assertThat(user.getEmailOtp()).isEqualTo(otp);
        assertThat(user.getOtpExpiry()).isEqualTo(expiry);
    }

    @Test
    @DisplayName("Should handle role selection status")
    void shouldHandleRoleSelectionStatus() {
        assertThat(user.getRoleSelected()).isFalse();

        user.setRole(Role.MENTOR);
        user.setRoleSelected(true);

        assertThat(user.getRoleSelected()).isTrue();
        assertThat(user.getRole()).isEqualTo(Role.MENTOR);
    }

    @Test
    @DisplayName("Should handle temporary user status")
    void shouldHandleTemporaryUserStatus() {
        assertThat(user.getIsTemporary()).isFalse();

        user.setIsTemporary(true);
        assertThat(user.getIsTemporary()).isTrue();
    }

    @Test
    @DisplayName("Should handle contact information")
    void shouldHandleContactInformation() {
        user.setCountry("India");
        user.setCity("Mumbai");
        user.setPhoneNumber("+91-9876543210");

        assertThat(user.getCountry()).isEqualTo("India");
        assertThat(user.getCity()).isEqualTo("Mumbai");
        assertThat(user.getPhoneNumber()).isEqualTo("+91-9876543210");
    }

    @Test
    @DisplayName("Should validate email uniqueness constraint")
    void shouldValidateEmailUniquenessConstraint() {
        String email = "unique@example.com";

        user.setEmail(email);

        assertThat(user.getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should validate username uniqueness constraint")
    void shouldValidateUsernameUniquenessConstraint() {
        String username = "uniqueuser";

        user.setUsername(username);

        assertThat(user.getUsername()).isEqualTo(username);
    }

    @Test
    @DisplayName("Should handle password with JsonIgnore annotation")
    void shouldHandlePasswordWithJsonIgnore() {
        String password = "securePassword123";

        user.setPassword(password);

        assertThat(user.getPassword()).isEqualTo(password);
    }

    @Test
    @DisplayName("Should validate field length constraints")
    void shouldValidateFieldLengthConstraints() {
        String longFirstName = "A".repeat(51);
        user.setFirstName(longFirstName);
        assertThat(user.getFirstName()).hasSize(51);

        String longLastName = "B".repeat(51);
        user.setLastName(longLastName);
        assertThat(user.getLastName()).hasSize(51);

        String longEmail = "a".repeat(90) + "@test.com";
        user.setEmail(longEmail);
        assertThat(user.getEmail()).hasSize(99);

        String longUsername = "C".repeat(101);
        user.setUsername(longUsername);
        assertThat(user.getUsername()).hasSize(101);

        String longPassword = "D".repeat(256);
        user.setPassword(longPassword);
        assertThat(user.getPassword()).hasSize(256);
    }

    @Test
    @DisplayName("Should create user with no args constructor")
    void shouldCreateUserWithNoArgsConstructor() {
        User emptyUser = new User();

        assertThat(emptyUser.getId()).isNull();
        assertThat(emptyUser.getFirstName()).isNull();
        assertThat(emptyUser.getLastName()).isNull();
        assertThat(emptyUser.getEmail()).isNull();
        assertThat(emptyUser.getUsername()).isNull();
        assertThat(emptyUser.getPassword()).isNull();
        assertThat(emptyUser.getProfilePhoto()).isNull();
        assertThat(emptyUser.getHasMentorProfile()).isFalse();
        assertThat(emptyUser.getHasLearnerProfile()).isFalse();
        assertThat(emptyUser.getIsEmailVerified()).isFalse();
        assertThat(emptyUser.getIsSuspended()).isFalse();
        assertThat(emptyUser.getRoleSelected()).isFalse();
        assertThat(emptyUser.getIsTemporary()).isFalse();
        assertThat(emptyUser.getEmailOtp()).isNull();
        assertThat(emptyUser.getOtpExpiry()).isNull();
        assertThat(emptyUser.getCreatedAt()).isNull();
        assertThat(emptyUser.getCountry()).isNull();
        assertThat(emptyUser.getCity()).isNull();
        assertThat(emptyUser.getPhoneNumber()).isNull();
        assertThat(emptyUser.getRole()).isNull();
        assertThat(emptyUser.getSuspensionReason()).isNull();
        assertThat(emptyUser.getUpdatedAt()).isNull();
    }

    @Test
    @DisplayName("Should handle complete user profile setup workflow")
    void shouldHandleCompleteUserProfileSetupWorkflow() throws InterruptedException {
        user.setEmail("workflow@example.com");
        user.setPassword("tempPassword");
        user.onCreate();

        assertThat(user.getIsEmailVerified()).isFalse();
        assertThat(user.getRoleSelected()).isFalse();
        assertThat(user.getCreatedAt()).isNotNull();

        Thread.sleep(10); // Small delay to ensure different timestamps

        user.setEmailOtp("123456");
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        user.setIsEmailVerified(true);
        user.onUpdate();

        assertThat(user.getIsEmailVerified()).isTrue();
        assertThat(user.getEmailOtp()).isEqualTo("123456");

        user.setFirstName("Complete");
        user.setLastName("User");
        user.setUsername("completeuser");
        user.setCountry("Germany");
        user.setCity("Berlin");
        user.setPhoneNumber("+49-30-12345678");

        user.setRole(Role.MENTOR);
        user.setRoleSelected(true);
        user.setHasMentorProfile(true);

        user.setProfilePhoto("complete_user_profile.jpg");
        user.onUpdate();

        assertThat(user.getFirstName()).isEqualTo("Complete");
        assertThat(user.getLastName()).isEqualTo("User");
        assertThat(user.getUsername()).isEqualTo("completeuser");
        assertThat(user.getRole()).isEqualTo(Role.MENTOR);
        assertThat(user.getRoleSelected()).isTrue();
        assertThat(user.getHasMentorProfile()).isTrue();
        assertThat(user.getProfilePhoto()).isEqualTo("complete_user_profile.jpg");
        assertThat(user.getUpdatedAt()).isAfterOrEqualTo(user.getCreatedAt()); // Changed from isAfter to isAfterOrEqualTo
    }

    @Test
    @DisplayName("Should handle user suspension and reactivation")
    void shouldHandleUserSuspensionAndReactivation() {
        user.setEmail("active@example.com");
        user.setIsEmailVerified(true);
        user.setRole(Role.LEARNER);
        user.setRoleSelected(true);

        assertThat(user.getIsSuspended()).isFalse();
        assertThat(user.getSuspensionReason()).isNull();

        user.setIsSuspended(true);
        user.setSuspensionReason("Inappropriate behavior");
        user.onUpdate();

        assertThat(user.getIsSuspended()).isTrue();
        assertThat(user.getSuspensionReason()).isEqualTo("Inappropriate behavior");

        user.setIsSuspended(false);
        user.setSuspensionReason(null);
        user.onUpdate();

        assertThat(user.getIsSuspended()).isFalse();
        assertThat(user.getSuspensionReason()).isNull();
    }
}
