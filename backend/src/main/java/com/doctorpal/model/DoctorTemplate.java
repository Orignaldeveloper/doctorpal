package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "doctor_templates")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DoctorTemplate {
    @Id
    private String id;
    private String doctorId;
    private String clinicName;
    private String doctorName;
    private String qualification;
    private String registrationNumber;
    private String specialization;
    private String clinicAddress;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String email;
    private String timings;
    private String signatureText;
    private String footerNote;
    private boolean showLogo;
    private boolean showWithHeader;
    private boolean showWithoutHeader;
}