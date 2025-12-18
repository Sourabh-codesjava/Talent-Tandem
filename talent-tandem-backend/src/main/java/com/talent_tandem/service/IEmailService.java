package com.talent_tandem.service;

public interface IEmailService {
    
    void sendOtpEmail(String toEmail, String otp);
    void sendWelcomeEmail(String toEmail, String username);
}