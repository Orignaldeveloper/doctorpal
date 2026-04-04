package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "fitness_certificates")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FitnessCertificate {
    @Id
    private String id;
    private String doctorId;
    private String patientId;
    private String patientName;
    private int patientAge;
    private String patientGender;
    private String patientAddress;
    private FitnessType fitnessType;
    private String customStatement;
    private String diagnosis;
    private String remarks;
    private LocalDate certificateDate;
    private LocalDate validTill;
    @CreatedDate
    private LocalDateTime createdAt;

    public enum FitnessType {
        FIT_TO_JOIN_DUTY, FIT_TO_TRAVEL, RECOVERED_FROM_ILLNESS, CUSTOM
    }
}