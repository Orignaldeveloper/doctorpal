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

@Document(collection = "visits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    private String id;

    private String patientId;
    private String doctorId;

    private int tokenNumber;
    private String symptoms;
    private String notes;

    private VisitStatus status;

    private LocalDate visitDate;
    private LocalDateTime checkInTime;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum VisitStatus {
        WAITING, WITH_DOCTOR, COMPLETED, CANCELLED, SKIPPED
    }
}
