package com.talent_tandem.requestdto;
import jakarta.validation.constraints.*;
import lombok.Data;


@Data
public class ProfileUpdateRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;
}
