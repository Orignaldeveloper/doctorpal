package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "beds")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Bed {
    @Id
    private String id;
    private String doctorId;
    private String bedNumber;
    private String bedType;
    private Double ratePerDay;
    private BedStatus status;
    @CreatedDate
    private LocalDateTime createdAt;

    public enum BedStatus {
        AVAILABLE, OCCUPIED, MAINTENANCE
    }
}