package com.talent_tandem.requestdto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailVerificationRequest {

    @NotBlank(message = "Verification token is required")
    private String token;
}