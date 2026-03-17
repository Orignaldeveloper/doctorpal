package com.doctorpal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReceptionistRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 6)
    private String password;

    @NotBlank
    private String phoneNumber;
}
