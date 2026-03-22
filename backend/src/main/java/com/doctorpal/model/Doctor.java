package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;


@Document(collection = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    private String id;

    private String userId; // link to users collection

    private String doctorName;
    private String clinicName;

    @Indexed(unique = true)
    private String email;

    private String phoneNumber;
    private String specialization;
    private String clinicAddress;
    private String city;
    private String state;
    private String pincode;

    // Clinic configuration
    private Double consultationFee;
    private String clinicStartTime; // "09:00"
    private String clinicEndTime;   // "18:00"
    private int tokenStartNumber;
    private boolean dailyTokenReset;

    private DoctorStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    public enum DoctorStatus {
        ACTIVE, INACTIVE
    }
}
