package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "ipd_payments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IpdPayment {
    @Id
    private String id;
    private String admissionId;
    private String doctorId;
    private Double amount;
    private String paymentMode;
    private String note;
    private LocalDateTime paidAt;
    @CreatedDate
    private LocalDateTime createdAt;
}