package com.talent_tandem.service;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;


public interface IUserService {

     public UserResponse update(UserRequest request, MultipartFile file);
     public UserResponse add(RegisterRequest request);
     public UserResponse getUser(LoginRequest request);
     boolean verifyEmailWithOtp(String email, String otp);
     boolean resendOtp(String email);
     ProfileResponse updateProfile(@Valid ProfileUpdateRequest request, MultipartFile profileImage);
     ProfileResponse getUserProfile(Long userId);
     LoginResponse authenticateUser(String username);
     boolean initiateSignup(String email);
     boolean completeSignup(CompleteSignupRequest request);
     java.util.List<ProfileResponse> getAllUsers();
     java.util.List<com.talent_tandem.responsedto.TopMentorResponse> getTopMentors(int limit);
}