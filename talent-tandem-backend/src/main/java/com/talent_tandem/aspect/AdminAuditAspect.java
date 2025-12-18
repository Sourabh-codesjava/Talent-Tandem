package com.talent_tandem.aspect;

import com.talent_tandem.model.AdminAuditLog;
import com.talent_tandem.repository.IAdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AdminAuditAspect {

    private final IAdminAuditLogRepository auditLogRepository;

    @Before("execution(* com.talent_tandem.controller.AdminController.*(..))")
    public void logAdminAction(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            Object[] args = joinPoint.getArgs();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String adminUsername = auth != null ? auth.getName() : "unknown";

            HttpServletRequest request = getCurrentRequest();
            String ipAddress = getClientIpAddress(request);

            log.info("ADMIN_ACTION_START - Admin: {}, Method: {}.{}, IP: {}, Args: {}",
                    adminUsername, className, methodName, ipAddress, args.length);

            MDC.put("adminAction", methodName);
            MDC.put("adminUser", adminUsername);

        } catch (Exception e) {
            log.error("Failed to log admin action start: {}", e.getMessage());
        }
    }

    @AfterReturning(pointcut = "execution(* com.talent_tandem.controller.AdminController.*(..))", returning = "result")
    public void logAdminActionSuccess(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String adminUsername = auth != null ? auth.getName() : "unknown";
            Long adminId = getAdminIdFromAuth(auth);

            HttpServletRequest request = getCurrentRequest();
            String ipAddress = getClientIpAddress(request);

            createAuditLog(adminId, adminUsername, methodName, "SUCCESS",
                    "Admin action completed successfully", ipAddress);

            log.info("ADMIN_ACTION_SUCCESS - Admin: {}, Method: {}.{}, IP: {}",
                    adminUsername, className, methodName, ipAddress);

        } catch (Exception e) {
            log.error("Failed to log admin action success: {}", e.getMessage());
        } finally {
            MDC.remove("adminAction");
            MDC.remove("adminUser");
        }
    }

    @AfterThrowing(pointcut = "execution(* com.talent_tandem.controller.AdminController.*(..))", throwing = "exception")
    public void logAdminActionFailure(JoinPoint joinPoint, Throwable exception) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String adminUsername = auth != null ? auth.getName() : "unknown";
            Long adminId = getAdminIdFromAuth(auth);

            HttpServletRequest request = getCurrentRequest();
            String ipAddress = getClientIpAddress(request);

            createAuditLog(adminId, adminUsername, methodName, "FAILURE",
                    "Admin action failed: " + exception.getMessage(), ipAddress);

            log.error("ADMIN_ACTION_FAILURE - Admin: {}, Method: {}.{}, IP: {}, Error: {}",
                    adminUsername, className, methodName, ipAddress, exception.getMessage());

        } catch (Exception e) {
            log.error("Failed to log admin action failure: {}", e.getMessage());
        } finally {
            MDC.remove("adminAction");
            MDC.remove("adminUser");
        }
    }

    private void createAuditLog(Long adminId, String adminUsername, String action,
                                String status, String details, String ipAddress) {
        try {
            AdminAuditLog auditLog = AdminAuditLog.builder()
                    .adminId(adminId)
                    .adminUsername(adminUsername)
                    .action(action + "_" + status)
                    .targetType("ADMIN_CONTROLLER")
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

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

    private Long getAdminIdFromAuth(Authentication auth) {
        try {
            if (auth != null && auth.getPrincipal() != null) {
                String userId = MDC.get("userId");
                if (userId != null && !userId.equals("unknown")) {
                    return Long.parseLong(userId);
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract admin ID from authentication: {}", e.getMessage());
        }
        return null;
    }
}