package com.doctorpal.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private Role role;

    private String doctorId; // null for SUPER_ADMIN, set for DOCTOR and RECEPTIONIST

    private UserStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    public enum Role {
        SUPER_ADMIN, DOCTOR, RECEPTIONIST
    }

    public enum UserStatus {
        ACTIVE, INACTIVE
    }
}
