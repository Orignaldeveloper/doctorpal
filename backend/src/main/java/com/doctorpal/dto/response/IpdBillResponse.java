package com.doctorpal.dto.response;

import com.doctorpal.model.Admission;
import com.doctorpal.model.IpdCharge;
import com.doctorpal.model.IpdPayment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IpdBillResponse {
    private Admission admission;
    private List<IpdCharge> charges;
    private List<IpdPayment> payments;
    private Map<String, Double> chargeBreakdown;
    private Double totalCharges;
    private Double totalPaid;
    private Double balanceDue;
    private long totalDays;
}