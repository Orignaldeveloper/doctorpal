package com.doctorpal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DoctorPalApplication {
    public static void main(String[] args) {
        SpringApplication.run(DoctorPalApplication.class, args);
    }
}
