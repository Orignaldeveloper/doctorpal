package com.doctorpal.service.impl;

import com.doctorpal.dto.request.CreateDoctorRequest;
import com.doctorpal.dto.response.ApiResponse;
import com.doctorpal.exception.BadRequestException;
import com.doctorpal.exception.ResourceNotFoundException;
import com.doctorpal.model.Doctor;
import com.doctorpal.model.User;
import com.doctorpal.repository.DoctorRepository;
import com.doctorpal.repository.UserRepository;
import com.doctorpal.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final VisitRepository visitRepository;
    private final PasswordEncoder passwordEncoder;

    public Doctor createDoctor(CreateDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered: " + req.getEmail());
        }

        // Create user account
        User user = User.builder()
                .name(req.getDoctorName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.DOCTOR)
                .status(User.UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        // Create doctor profile
        Doctor doctor = Doctor.builder()
                .userId(user.getId())
                .doctorName(req.getDoctorName())
                .clinicName(req.getClinicName())
                .email(req.getEmail())
                .phoneNumber(req.getPhoneNumber())
                .specialization(req.getSpecialization())
                .clinicAddress(req.getClinicAddress())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .consultationFee(req.getConsultationFee())
                .clinicStartTime(req.getClinicStartTime())
                .clinicEndTime(req.getClinicEndTime())
                .tokenStartNumber(req.getTokenStartNumber())
                .dailyTokenReset(req.isDailyTokenReset())
                .status(Doctor.DoctorStatus.ACTIVE)
                .build();
        doctor = doctorRepository.save(doctor);

        // Link doctorId to user
        user.setDoctorId(doctor.getId());
        userRepository.save(user);

        return doctor;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor updateDoctorStatus(String doctorId, String status) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        Doctor.DoctorStatus newStatus = Doctor.DoctorStatus.valueOf(status.toUpperCase());
        doctor.setStatus(newStatus);
        doctorRepository.save(doctor);

        // Update user account status too
        userRepository.findByEmail(doctor.getEmail()).ifPresent(user -> {
            user.setStatus(newStatus == Doctor.DoctorStatus.ACTIVE
                    ? User.UserStatus.ACTIVE : User.UserStatus.INACTIVE);
            userRepository.save(user);

            // Deactivate receptionists under this doctor if doctor goes inactive
            if (newStatus == Doctor.DoctorStatus.INACTIVE) {
                userRepository.findByDoctorIdAndRole(doctorId, User.Role.RECEPTIONIST)
                        .forEach(r -> {
                            r.setStatus(User.UserStatus.INACTIVE);
                            userRepository.save(r);
                        });
            }
        });

        return doctor;
    }

    public Doctor updateDoctor(String doctorId, CreateDoctorRequest req) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setDoctorName(req.getDoctorName());
        doctor.setClinicName(req.getClinicName());
        doctor.setPhoneNumber(req.getPhoneNumber());
        doctor.setSpecialization(req.getSpecialization());
        doctor.setClinicAddress(req.getClinicAddress());
        doctor.setCity(req.getCity());
        doctor.setState(req.getState());
        doctor.setPincode(req.getPincode());
        doctor.setConsultationFee(req.getConsultationFee());
        doctor.setClinicStartTime(req.getClinicStartTime());
        doctor.setClinicEndTime(req.getClinicEndTime());

        // Only update password if provided
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            userRepository.findByEmail(doctor.getEmail()).ifPresent(user -> {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
                userRepository.save(user);
            });
        }

        return doctorRepository.save(doctor);
    }

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("activeDoctors", doctorRepository.findByStatus(Doctor.DoctorStatus.ACTIVE).size());
        stats.put("inactiveDoctors", doctorRepository.findByStatus(Doctor.DoctorStatus.INACTIVE).size());
        stats.put("totalReceptionists", userRepository.findByRole(User.Role.RECEPTIONIST).size());
        stats.put("patientsToday", visitRepository.countByDoctorIdAndVisitDate(null, LocalDate.now()));
        return stats;
    }
}
