//package com.talent_tandem.service;
//
//import com.talent_tandem.repository.IPendingRegistrationRepository;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//
//@Service
//@RequiredArgsConstructor
//public class RegistrationCleanupService {
//
//    private static final Logger logger = LoggerFactory.getLogger(RegistrationCleanupService.class);
//    private final IPendingRegistrationRepository pendingRegistrationRepository;
//
//    @Scheduled(fixedRate = 300000) // Run every 5 minutes
//    @Transactional
//    public void cleanupExpiredRegistrations() {
//        try {
//            pendingRegistrationRepository.deleteByOtpExpiryBefore(LocalDateTime.now());
//            logger.debug("Cleaned up expired pending registrations");
//        } catch (Exception e) {
//            logger.error("Error cleaning up expired registrations: {}", e.getMessage());
//        }
//    }
//}