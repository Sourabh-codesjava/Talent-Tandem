package com.talent_tandem.requestdto;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Email is required")
    private String email;
}
