package com.doctorpal.dto.request;

import com.doctorpal.model.IpdCharge;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddIpdChargeRequest {
    @NotBlank private String admissionId;
    @NotNull private IpdCharge.ChargeType chargeType;
    @NotBlank private String description;
    @NotNull @Min(0) private Double amount;
    private Integer quantity = 1;
}