package com.talent_tandem.requestdto;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
//    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, underscores, and hyphens")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    public void setUsername(String username) {
        this.username = username != null ? username.trim() : null;
    }
}
