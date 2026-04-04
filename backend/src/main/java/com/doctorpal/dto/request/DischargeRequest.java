package com.doctorpal.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class DischargeRequest {
    private String admissionId;
    private String treatmentSummary;
    private String dischargeAdvice;
    private List<String> medicinesOnDischarge;
}