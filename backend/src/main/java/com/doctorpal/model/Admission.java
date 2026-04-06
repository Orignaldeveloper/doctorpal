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
import java.util.List;

@Document(collection = "admissions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Admission {
    @Id
    private String id;
    private String doctorId;
    private String patientId;
    private String bedId;
    private String patientName;
    private String patientPhone;
    private int patientAge;
    private String patientGender;
    private String patientAddress;
    private String bloodGroup;
    private String emergencyContact;
    private String emergencyPhone;
    private String diagnosis;
    private String admissionReason;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private LocalDate expectedDischargeDate;
    private String treatmentSummary;
    private String dischargeAdvice;
    private List<String> medicinesOnDischarge;
    private Double bedRatePerDay;
    private Double advancePaid;
    private Double totalBill;
    private Double totalPaid;
    private Double balanceDue;
    private String billNumber;
    private AdmissionStatus status;
    @CreatedDate
    private LocalDateTime createdAt;

    public enum AdmissionStatus {
        ADMITTED, DISCHARGED
    }
}