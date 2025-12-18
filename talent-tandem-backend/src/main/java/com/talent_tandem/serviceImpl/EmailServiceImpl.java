package com.talent_tandem.serviceImpl;

import com.talent_tandem.service.IEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;
    
    @Value("${email.enabled:false}")
    private boolean emailEnabled;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        log.info("📧 Attempting to send OTP email to: {}", toEmail);
        log.info("⚙️ Email enabled: {}", emailEnabled);
        
        if (!emailEnabled) {
            log.warn("⚠️ Email is disabled, showing OTP in console");
            showOtpInConsole(toEmail, otp);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Verify Your Email - Talent Tandem");
            message.setText("Hi there!\n\n" +
                    "Welcome to Talent Tandem! Your email verification OTP is:\n\n" +
                    "OTP: " + otp + "\n\n" +
                    "This OTP will expire in 10 minutes.\n\n" +
                    "If you didn't create an account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Talent Tandem Team");
            
            log.info("📤 Sending email via SMTP...");
            mailSender.send(message);
            log.info("✅ OTP email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send OTP email to: {}. Error: {}", toEmail, e.getMessage());
            log.error("🔍 Full error: ", e);
            showOtpInConsole(toEmail, otp);
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String username) {
        if (!emailEnabled) {
            System.out.println("\n🎉 WELCOME EMAIL (Console): Welcome " + username + "! Email verified successfully.");
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Welcome to Talent Tandem!");
            message.setText("Hi " + username + "!\n\n" +
                    "Welcome to Talent Tandem! Your email has been verified successfully.\n\n" +
                    "You can now start using our platform to connect with mentors and learners.\n\n" +
                    "Happy Learning!\n\n" +
                    "Best regards,\n" +
                    "Talent Tandem Team");
            
            mailSender.send(message);
            log.info("✅ Welcome email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send welcome email to: {}", toEmail, e.getMessage());
            System.out.println("\n🎉 WELCOME EMAIL (SMTP FAILED): Welcome " + username + "! Email verified successfully.");
        }
    }
    
    private void showOtpInConsole(String toEmail, String otp) {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("📧 EMAIL VERIFICATION OTP");
        System.out.println("To: " + toEmail);
        System.out.println("🔢 OTP: " + otp);
        System.out.println("⏰ Expires: 10 minutes");
        System.out.println("=".repeat(50) + "\n");
    }
}