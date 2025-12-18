package com.talent_tandem.serviceImpl;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.talent_tandem.dao.IUserDao;
import com.talent_tandem.exception.InvalidCredentialsException;
import com.talent_tandem.exception.UserAlreadyExistsException;
import com.talent_tandem.exception.UserNotFoundException;
import com.talent_tandem.exception.ValidationException;
import com.talent_tandem.exception.FileUploadException;
import com.talent_tandem.model.User;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.LoginResponse;
import com.talent_tandem.responsedto.ProfileResponse;
import com.talent_tandem.responsedto.TopMentorResponse;
import com.talent_tandem.responsedto.UserResponse;
import com.talent_tandem.service.IEmailService;
import com.talent_tandem.service.IUserService;
import com.talent_tandem.repository.ISessionRepository;
import com.talent_tandem.repository.IFeedbackRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/jpg", "image/png",
            "image/webp");

    private final IUserDao dao;
    private final Cloudinary cloudinary;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final ISessionRepository sessionRepository;
    private final IFeedbackRepository feedbackRepository;

    @Override
    public UserResponse update(UserRequest request, MultipartFile profileImage) {

        if (request.getUsername() == null || request.getUsername().trim().isEmpty())
            throw new ValidationException("Username cannot be empty");
        if (request.getEmail() == null || request.getEmail().trim().isEmpty())
            throw new ValidationException("Email cannot be empty");
        if (request.getPassword() == null || request.getPassword().length() < 6)
            throw new ValidationException("Password must be at least 6 characters");

        if (dao.findByUsername(request.getUsername()) != null)
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());

        if (dao.findByEmail(request.getEmail()) != null)
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());

        String imageUrl = uploadProfileImage(profileImage);

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .profilePhoto(imageUrl)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        dao.createUser(user);

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePhoto(user.getProfilePhoto())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private String uploadProfileImage(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            if (file.getSize() > 5 * 1024 * 1024)
                throw new ValidationException("File size cannot exceed 5MB");

            String contentType = file.getContentType();

            if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase(Locale.ROOT)))
                throw new ValidationException("Only JPG, JPEG, PNG, and WEBP formats are allowed");

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.emptyMap());

            return uploadResult.get("secure_url").toString();

        } catch (ValidationException e) {
            throw e;
        } catch (IOException e) {
            logger.error("Image upload failed due to IO error: {}", e.getMessage(), e);
            throw new FileUploadException("Image upload failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during image upload: {}", e.getMessage(), e);
            throw new FileUploadException("Image upload failed: " + e.getMessage());
        }
    }

    @Override
    public UserResponse add(RegisterRequest request) {
        // Keep for backward compatibility - redirect to new flow
        throw new ValidationException("Please use the new 3-step signup process");
    }
    
    @Override
    public boolean initiateSignup(String email) {
        if (email == null || email.trim().isEmpty())
            throw new ValidationException("Email cannot be empty");
            
        // Check if user already exists (non-temporary)
        User existingUser = dao.findByEmail(email);
        if (existingUser != null && !existingUser.getIsTemporary()) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        try {
            String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
            LocalDateTime otpExpiry = LocalDateTime.now().plusMinutes(10);
            
            if (existingUser != null && existingUser.getIsTemporary()) {
                // Update existing temporary user
                existingUser.setEmailOtp(otp);
                existingUser.setOtpExpiry(otpExpiry);
                dao.updateUser(existingUser);
            } else {
                // Create new temporary user
                User tempUser = User.builder()
                        .email(email)
                        .emailOtp(otp)
                        .otpExpiry(otpExpiry)
                        .isTemporary(true)
                        .isEmailVerified(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                dao.createUser(tempUser);
            }
            
            emailService.sendOtpEmail(email, otp);
            logger.info("OTP sent for signup initiation: {}", email);
            return true;
        } catch (Exception e) {
            logger.error("Failed to initiate signup for: {}", email, e);
            return false;
        }
    }
    
    @Override
    public boolean completeSignup(CompleteSignupRequest request) {
        User tempUser = dao.findByEmail(request.getEmail());
        if (tempUser == null || !tempUser.getIsTemporary() || !tempUser.getIsEmailVerified()) {
            return false;
        }
        
        // Check username availability
        if (dao.findByUsername(request.getUsername()) != null) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        // Complete the user registration
        tempUser.setUsername(request.getUsername());
        tempUser.setPassword(passwordEncoder.encode(request.getPassword()));
        tempUser.setIsTemporary(false);
        // Role will be set when user creates learner/mentor profile
        tempUser.setUpdatedAt(LocalDateTime.now());
        
        dao.updateUser(tempUser);
        logger.info("Signup completed for: {}", request.getEmail());
        return true;
    }

    public UserResponse getUser(LoginRequest request) {
        User user = dao.findByUsername(request.getUsername());
        if (user == null) {
            throw new UserNotFoundException("User not found: " + request.getUsername());
        }

        if (!user.getPassword().equals(request.getPassword())) {
            throw new InvalidCredentialsException("Incorrect password");
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePhoto(user.getProfilePhoto())
                .hasMentorProfile(user.getHasMentorProfile())
                .hasLearnerProfile(user.getHasLearnerProfile())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    public boolean verifyEmailWithOtp(String email, String otp) {
        logger.info("OTP verification requested for: {}", email);
        
        User user = dao.findByEmail(email);
        if (user == null) {
            logger.warn("No user found for email: {}", email);
            return false;
        }
        
        logger.info("User found - ID: {}, isTemporary: {}, isEmailVerified: {}", 
            user.getId(), user.getIsTemporary(), user.getIsEmailVerified());
        logger.info("Stored OTP: '{}', Received OTP: '{}'", user.getEmailOtp(), otp);
        logger.info("OTP Expiry: {}, Current Time: {}", user.getOtpExpiry(), LocalDateTime.now());
        
        if (user.getIsEmailVerified() && !user.getIsTemporary()) {
            logger.warn("User already verified: {}", email);
            return false;
        }
        
        if (user.getEmailOtp() == null) {
            logger.error("No OTP stored for user: {}", email);
            return false;
        }
        
        if (!user.getEmailOtp().equals(otp)) {
            logger.error("OTP mismatch for user: {} - Expected: '{}', Got: '{}'", 
                email, user.getEmailOtp(), otp);
            return false;
        }
        
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            logger.error("OTP expired for user: {}", email);
            return false;
        }
        
        user.setIsEmailVerified(true);
        user.setEmailOtp(null);
        user.setOtpExpiry(null);
        dao.updateUser(user);
        
        if (!user.getIsTemporary() && user.getUsername() != null) {
            emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        }
        
        logger.info("User verified: {}", email);
        return true;
    }

    @Override
    public boolean resendOtp(String email) {
        logger.info("Resend OTP requested for: {}", email);
        
        User user = dao.findByEmail(email);
        if (user == null || (user.getIsEmailVerified() && !user.getIsTemporary())) {
            logger.warn("User not found or already verified: {}", email);
            return false;
        }
        
        String newOtp = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        LocalDateTime newExpiry = LocalDateTime.now().plusMinutes(10);
        
        user.setEmailOtp(newOtp);
        user.setOtpExpiry(newExpiry);
        dao.updateUser(user);
        
        emailService.sendOtpEmail(user.getEmail(), newOtp);
        logger.info("Resent OTP for user: {}", email);
        return true;
    }

    @Override
    public ProfileResponse updateProfile(ProfileUpdateRequest request, MultipartFile profileImage) {
        User user = dao.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + request.getUserId()));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCountry(request.getCountry());
        user.setCity(request.getCity());
        user.setPhoneNumber(request.getPhoneNumber());

        if (profileImage != null && !profileImage.isEmpty()) {
            String imageUrl = uploadProfileImage(profileImage);
            user.setProfilePhoto(imageUrl);
        }

        User updatedUser = dao.save(user);
        return buildProfileResponse(updatedUser);
    }

    @Override
    public ProfileResponse getUserProfile(Long userId) {
        User user = dao.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return buildProfileResponse(user);
    }

    private ProfileResponse buildProfileResponse(User user) {
        return ProfileResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .country(user.getCountry())
                .city(user.getCity())
                .phoneNumber(user.getPhoneNumber())
                .profilePhoto(user.getProfilePhoto())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }

    @Override
    public LoginResponse authenticateUser(String username) {
        User user = dao.findByUsername(username);
        if (user == null) {
            throw new UserNotFoundException("User not found: " + username);
        }

        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setProfilePhoto(user.getProfilePhoto());
        response.setHasMentorProfile(user.getHasMentorProfile());
        response.setHasLearnerProfile(user.getHasLearnerProfile());
response.setRole(user.getRole() != null ? user.getRole().name() : "LEARNER");

        return response;
    }

    @Override
    public List<ProfileResponse> getAllUsers() {
        List<User> users = dao.findAll();
        return users.stream()
                .map(this::buildProfileResponse)
                .toList();
    }

    @Override
    public List<TopMentorResponse> getTopMentors(int limit) {
        List<User> allUsers = dao.findAll();
        
        return allUsers.stream()
                .filter(user -> user.getHasMentorProfile() != null && user.getHasMentorProfile())
                .map(user -> {
                    Long completedSessions = sessionRepository.countCompletedSessionsByMentor(user.getId());
                    List<com.talent_tandem.model.Feedback> feedbacks = feedbackRepository.findByToUserIdOrderByCreatedAtDesc(user.getId());
                    Double avgRating = feedbacks.isEmpty() ? 0.0 : 
                        feedbacks.stream().mapToDouble(com.talent_tandem.model.Feedback::getRating).average().orElse(0.0);
                    
                    return TopMentorResponse.builder()
                            .userId(user.getId())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .username(user.getUsername())
                            .profilePhoto(user.getProfilePhoto())
                            .completedSessions(completedSessions)
                            .averageRating(Math.round(avgRating * 10.0) / 10.0)
                            .build();
                })
                .filter(mentor -> mentor.getCompletedSessions() > 0)
                .sorted((m1, m2) -> {
                    int sessionCompare = m2.getCompletedSessions().compareTo(m1.getCompletedSessions());
                    return sessionCompare != 0 ? sessionCompare : m2.getAverageRating().compareTo(m1.getAverageRating());
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

}
