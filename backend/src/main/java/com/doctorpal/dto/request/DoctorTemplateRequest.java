package com.doctorpal.dto.request;

import lombok.Data;

@Data
public class DoctorTemplateRequest {
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