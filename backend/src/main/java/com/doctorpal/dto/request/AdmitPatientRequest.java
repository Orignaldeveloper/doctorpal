package com.doctorpal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdmitPatientRequest {
    @NotBlank private String patientName;
    @NotBlank private String patientPhone;
    @NotNull @Min(1) @Max(150) private Integer patientAge;
    @NotBlank private String patientGender;
    private String patientAddress;
    private String bloodGroup;
    private String emergencyContact;
    private String emergencyPhone;
    @NotBlank private String bedId;
    @NotBlank private String diagnosis;
    private String admissionReason;
    private String existingPatientId;
    private Double advancePaid;
}