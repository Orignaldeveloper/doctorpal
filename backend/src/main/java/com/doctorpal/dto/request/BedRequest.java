package com.doctorpal.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BedRequest {
    @NotBlank(message = "Bed number is required")
    private String bedNumber;
    @NotBlank(message = "Bed type is required")
    private String bedType;
    @NotNull @Min(0)
    private Double ratePerDay;
}