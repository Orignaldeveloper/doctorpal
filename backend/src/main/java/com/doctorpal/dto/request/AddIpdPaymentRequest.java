package com.doctorpal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddIpdPaymentRequest {
    @NotBlank private String admissionId;
    @NotNull @Min(1) private Double amount;
    @NotBlank private String paymentMode;
    private String note;
}