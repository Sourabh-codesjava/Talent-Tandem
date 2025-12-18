package com.talent_tandem.controller;

import com.talent_tandem.requestdto.AdminLoginRequest;
import com.talent_tandem.responsedto.LoginResponse;
import com.talent_tandem.service.IAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final IAdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> adminLogin(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        log.info("ADMIN_LOGIN_ATTEMPT - Username: {}, IP: {}, UserAgent: {}",
                request.getUsername(), clientIp, userAgent);

        try {
            LoginResponse response = adminService.adminLogin(request, clientIp);

            // Set user context in MDC for subsequent logs
            MDC.put("userId", response.getId() != null ? response.getId().toString() : "unknown");
            MDC.put("username", response.getUsername());

            log.info("ADMIN_LOGIN_SUCCESS - Username: {}, Role: {}, IP: {}",
                    response.getUsername(), response.getRole(), clientIp);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("ADMIN_LOGIN_FAILED - Username: {}, IP: {}, Error: {}",
                    request.getUsername(), clientIp, e.getMessage());

            LoginResponse errorResponse = new LoginResponse();
            errorResponse.setStatus(false);
            errorResponse.setMessage("Invalid admin credentials");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}