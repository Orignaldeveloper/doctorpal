package com.doctorpal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private long totalPatients;
    private long completed;
    private long cancelled;
    private long waiting;
    private String busiestDay;
    private Map<String, Long> dailyBreakdown;
}
