package com.talent_tandem.controller;
import com.talent_tandem.security.JwtUtil;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.LoginResponse;
import com.talent_tandem.service.IUserService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IUserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody com.talent_tandem.requestdto.OtpVerificationRequest request) {
        System.out.println("\n========== OTP VERIFICATION REQUEST ==========");
        System.out.println("Email: " + request.getEmail());
        System.out.println("OTP: " + request.getOtp());
        System.out.println("=============================================\n");
        
        Map<String, String> response = new HashMap<>();
        
        boolean isVerified = userService.verifyEmailWithOtp(request.getEmail(), request.getOtp());
        
        System.out.println("Verification result: " + isVerified);
        
        if (isVerified) {
            response.put("status", "success");
            response.put("message", "Email verified successfully! You can now login.");
        } else {
            response.put("status", "error");
            response.put("message", "Invalid or expired OTP.");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@Valid @RequestBody com.talent_tandem.requestdto.ResendOtpRequest request) {
        Map<String, String> response = new HashMap<>();
        
        boolean isSent = userService.resendOtp(request.getEmail());
        
        if (isSent) {
            response.put("status", "success");
            response.put("message", "OTP sent successfully!");
        } else {
            response.put("status", "error");
            response.put("message", "Failed to send OTP. User may already be verified.");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            
            // Get user details and generate tokens
            LoginResponse loginResponse = userService.authenticateUser(loginRequest.getUsername());
            String role = loginResponse.getRole() != null ? loginResponse.getRole() : "LEARNER";
            String accessToken = jwtUtil.generateAccessToken(loginRequest.getUsername(), loginResponse.getEmail(), loginResponse.getId(), role);
            String refreshToken = jwtUtil.generateRefreshToken(loginRequest.getUsername(), loginResponse.getId());
            
            loginResponse.setAccessToken(accessToken);
            loginResponse.setRefreshToken(refreshToken);
            loginResponse.setStatus(true);
            loginResponse.setMessage("Login successful");
            
            return ResponseEntity.ok(loginResponse);
            
        } catch (BadCredentialsException e) {
            LoginResponse errorResponse = new LoginResponse();
            errorResponse.setStatus(false);
            errorResponse.setMessage("Invalid username or password. Please check your credentials and try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (DisabledException e) {
            LoginResponse errorResponse = new LoginResponse();
            errorResponse.setStatus(false);
            errorResponse.setMessage("Account not verified. Please verify your email with OTP before logging in.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (AuthenticationException e) {
            LoginResponse errorResponse = new LoginResponse();
            errorResponse.setStatus(false);
            errorResponse.setMessage("Authentication failed. Please try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("status", false);
                response.put("message", "Missing or invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String refreshToken = authHeader.substring(7); // Remove "Bearer "
            
            if (!jwtUtil.validateRefreshToken(refreshToken)) {
                response.put("status", false);
                response.put("message", "Invalid or expired refresh token. Please login again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String username = jwtUtil.extractUsername(refreshToken);
            Long userId = jwtUtil.extractUserId(refreshToken);
            
            // Get user email and role for new access token
            LoginResponse userDetails = userService.authenticateUser(username);
            String role = userDetails.getRole() != null ? userDetails.getRole() : "LEARNER";
            String newAccessToken = jwtUtil.generateAccessToken(username, userDetails.getEmail(), userId, role);
            
            response.put("status", true);
            response.put("accessToken", newAccessToken);
            response.put("message", "Token refreshed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (ExpiredJwtException e) {
            response.put("status", false);
            response.put("message", "Refresh token has expired. Please login again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("status", false);
            response.put("message", "Token refresh failed. Please login again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @PostMapping("/signup/step1")
    public ResponseEntity<Map<String, String>> signupStep1(@Valid @RequestBody EmailStepRequest request) {
        Map<String, String> response = new HashMap<>();
        
        boolean isEmailSent = userService.initiateSignup(request.getEmail());
        
        if (isEmailSent) {
            response.put("status", "success");
            response.put("message", "OTP sent to your email. Please verify to continue.");
        } else {
            response.put("status", "error");
            response.put("message", "Email already exists or failed to send OTP.");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/signup/complete")
    public ResponseEntity<Map<String, String>> completeSignup(@Valid @RequestBody CompleteSignupRequest request) {
        Map<String, String> response = new HashMap<>();
        
        boolean isCompleted = userService.completeSignup(request);
        
        if (isCompleted) {
            response.put("status", "success");
            response.put("message", "Account created successfully! You can now login.");
        } else {
            response.put("status", "error");
            response.put("message", "Failed to complete signup. Please verify your email first.");
        }
        
        return ResponseEntity.ok(response);
    }
}