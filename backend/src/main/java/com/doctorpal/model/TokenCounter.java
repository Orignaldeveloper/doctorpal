package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "token_counters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenCounter {

    @Id
    private String id; // doctorId + "_" + date

    private String doctorId;
    private LocalDate date;
    private int currentToken;
}
