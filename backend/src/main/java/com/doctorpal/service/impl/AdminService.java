package com.doctorpal.service.impl;

import com.doctorpal.dto.request.CreateDoctorRequest;
import com.doctorpal.dto.request.CreateSuperAdminRequest;
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

    // ── DOCTOR MANAGEMENT ────────────────────────────────────────────

    public Doctor createDoctor(CreateDoctorRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .name(req.getDoctorName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.DOCTOR)
                .status(User.UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

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

        userRepository.findByEmail(doctor.getEmail()).ifPresent(user -> {
            user.setStatus(newStatus == Doctor.DoctorStatus.ACTIVE
                    ? User.UserStatus.ACTIVE : User.UserStatus.INACTIVE);
            userRepository.save(user);

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

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            userRepository.findByEmail(doctor.getEmail()).ifPresent(user -> {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
                userRepository.save(user);
            });
        }

        return doctorRepository.save(doctor);
    }

    // ── SUPER ADMIN MANAGEMENT ────────────────────────────────────────

    public User createSuperAdmin(CreateSuperAdminRequest req) {
        // Check email not already used
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered: " + req.getEmail());
        }

        User superAdmin = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.SUPER_ADMIN)
                .status(User.UserStatus.ACTIVE)
                .build();

        return userRepository.save(superAdmin);
    }

    public List<User> getAllSuperAdmins() {
        return userRepository.findByRole(User.Role.SUPER_ADMIN);
    }

    public User updateSuperAdminStatus(String userId, String status, String currentUserEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found"));

        // Security check — must be a super admin
        if (targetUser.getRole() != User.Role.SUPER_ADMIN) {
            throw new BadRequestException("User is not a Super Admin");
        }

        // Prevent self-deactivation
        if (targetUser.getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("You cannot deactivate your own account");
        }

        User.UserStatus newStatus = User.UserStatus.valueOf(status.toUpperCase());
        targetUser.setStatus(newStatus);
        return userRepository.save(targetUser);
    }

    // ── PLATFORM STATS ───────────────────────────────────────────────

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("activeDoctors", doctorRepository.findByStatus(Doctor.DoctorStatus.ACTIVE).size());
        stats.put("inactiveDoctors", doctorRepository.findByStatus(Doctor.DoctorStatus.INACTIVE).size());
        stats.put("totalReceptionists", userRepository.findByRole(User.Role.RECEPTIONIST).size());
        stats.put("totalSuperAdmins", userRepository.findByRole(User.Role.SUPER_ADMIN).size());
        stats.put("patientsToday", visitRepository.countByDoctorIdAndVisitDate(null, LocalDate.now()));
        return stats;
    }
}