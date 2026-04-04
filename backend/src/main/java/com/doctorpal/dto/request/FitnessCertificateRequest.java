package com.doctorpal.dto.request;

import com.doctorpal.model.FitnessCertificate;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FitnessCertificateRequest {
    @NotBlank private String patientName;
    @NotNull private Integer patientAge;
    @NotBlank private String patientGender;
    private String patientAddress;
    private String patientId;
    @NotNull private FitnessCertificate.FitnessType fitnessType;
    private String customStatement;
    private String diagnosis;
    private String remarks;
    private LocalDate validTill;
}