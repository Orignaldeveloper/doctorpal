package com.doctorpal.config;

import com.doctorpal.model.User;
import com.doctorpal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@doctorpal.in")) {
            User superAdmin = User.builder()
                    .name("Platform Admin")
                    .email("admin@doctorpal.in")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(User.Role.SUPER_ADMIN)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            userRepository.save(superAdmin);
            log.info("✅ Default Super Admin created: admin@doctorpal.in / Admin@123");
        }
    }
}
