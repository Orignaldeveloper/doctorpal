package com.doctorpal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PatientEntryRequest {

    @NotBlank(message = "Patient name is required")
    private String patientName;

    @NotNull @Min(1) @Max(150)
    private Integer age;

    @NotBlank
    private String gender;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Symptoms are required")
    private String symptoms;

    private String address;
    private String bloodGroup;
    private String notes;
}
