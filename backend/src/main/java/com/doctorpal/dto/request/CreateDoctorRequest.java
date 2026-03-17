package com.doctorpal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateDoctorRequest {

    @NotBlank(message = "Doctor name is required")
    private String doctorName;

    @NotBlank(message = "Clinic name is required")
    private String clinicName;

    @NotBlank @Email(message = "Valid email required")
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String specialization;

    private String clinicAddress;
    private String city;
    private String state;
    private String pincode;

    private Double consultationFee;
    private String clinicStartTime;
    private String clinicEndTime;
    private int tokenStartNumber = 1;
    private boolean dailyTokenReset = true;
}
