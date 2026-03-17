package com.doctorpal.dto.response;

import com.doctorpal.model.Visit;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueEntryResponse {
    private String visitId;
    private int tokenNumber;
    private String patientId;
    private String patientName;
    private String patientPhone;
    private int patientAge;
    private String patientGender;
    private String symptoms;
    private String notes;
    private Visit.VisitStatus status;
    private LocalDate visitDate;
    private LocalDateTime checkInTime;
    private int estimatedWaitMinutes;
}
