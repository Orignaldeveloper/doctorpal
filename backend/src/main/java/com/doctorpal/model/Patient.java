package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    private String id;

    private String doctorId; // tenant isolation

    private String name;
    private String phone;
    private int age;
    private String gender;
    private String bloodGroup;
    private String address;

    @CreatedDate
    private LocalDateTime createdAt;
}
