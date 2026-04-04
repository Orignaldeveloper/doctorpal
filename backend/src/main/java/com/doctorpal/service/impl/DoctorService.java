package com.doctorpal.service.impl;

import com.doctorpal.dto.request.CreateReceptionistRequest;
import com.doctorpal.dto.response.QueueEntryResponse;
import com.doctorpal.dto.response.ReportResponse;
import com.doctorpal.exception.BadRequestException;
import com.doctorpal.exception.ResourceNotFoundException;
import com.doctorpal.model.Patient;
import com.doctorpal.model.User;
import com.doctorpal.model.Visit;
import com.doctorpal.repository.PatientRepository;
import com.doctorpal.repository.UserRepository;
import com.doctorpal.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class DoctorService {

    private final UserRepository userRepository;
    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    // ── RECEPTIONIST MANAGEMENT ──────────────────────────────────────

    public User createReceptionist(String doctorId, CreateReceptionistRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User recept = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.RECEPTIONIST)
                .doctorId(doctorId)
                .status(User.UserStatus.ACTIVE)
                .build();
        return userRepository.save(recept);
    }

    public List<User> getReceptionists(String doctorId) {
        return userRepository.findByDoctorIdAndRole(doctorId, User.Role.RECEPTIONIST);
    }

    public User toggleReceptionistStatus(String userId, String doctorId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found"));
        if (!doctorId.equals(user.getDoctorId())) {
            throw new BadRequestException("Unauthorized action");
        }
        user.setStatus(user.getStatus() == User.UserStatus.ACTIVE
                ? User.UserStatus.INACTIVE : User.UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    // ── LIVE QUEUE ──────────────────────────────────────────────────

    public List<QueueEntryResponse> getTodayQueue(String doctorId) {
        List<Visit> visits = visitRepository
                .findByDoctorIdAndVisitDateOrderByTokenNumberAsc(doctorId, LocalDate.now());
        return visits.stream().map(v -> buildQueueEntry(v, doctorId)).collect(Collectors.toList());
    }

    public QueueEntryResponse updateVisitStatus(String visitId, String doctorId, String status) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        if (!doctorId.equals(visit.getDoctorId())) {
            throw new BadRequestException("Unauthorized");
        }
        visit.setStatus(Visit.VisitStatus.valueOf(status.toUpperCase()));
        visitRepository.save(visit);
        return buildQueueEntry(visit, doctorId);
    }

     public QueueEntryResponse callNextPatient(String doctorId) {
        // Complete ALL current WITH_DOCTOR visits (fix for multiple results)
        visitRepository.findByDoctorIdAndVisitDateAndStatus(
                doctorId, LocalDate.now(), Visit.VisitStatus.WITH_DOCTOR)
                .forEach(v -> {
                    v.setStatus(Visit.VisitStatus.COMPLETED);
                    visitRepository.save(v);
                });

        // Get next WAITING
        List<Visit> waiting = visitRepository
                .findByDoctorIdAndVisitDateAndStatus(doctorId, LocalDate.now(), Visit.VisitStatus.WAITING);
        if (waiting.isEmpty()) throw new BadRequestException("No patients in queue");

        Visit next = waiting.get(0);
        next.setStatus(Visit.VisitStatus.WITH_DOCTOR);
        visitRepository.save(next);
        return buildQueueEntry(next, doctorId);
    }

    public void deleteVisit(String visitId, String doctorId) {
        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
        if (!doctorId.equals(visit.getDoctorId())) throw new BadRequestException("Unauthorized");
        visitRepository.delete(visit);
    }

    // Runs every day at midnight — cleans up stale WITH_DOCTOR visits from previous days
@org.springframework.scheduling.annotation.Scheduled(cron = "0 1 0 * * *")
public void autoCompleteStaleVisits() {
    List<Visit> staleVisits = visitRepository.findAll().stream()
            .filter(v -> v.getStatus() == Visit.VisitStatus.WITH_DOCTOR
                    && v.getVisitDate() != null
                    && v.getVisitDate().isBefore(java.time.LocalDate.now()))
            .collect(java.util.stream.Collectors.toList());

    staleVisits.forEach(v -> {
        v.setStatus(Visit.VisitStatus.COMPLETED);
        visitRepository.save(v);
    });

    if (!staleVisits.isEmpty()) {
        log.info("Auto-completed {} stale WITH_DOCTOR visits from previous days",
                staleVisits.size());
    }
}

    // ── PATIENT HISTORY ─────────────────────────────────────────────

    public List<Patient> searchPatients(String doctorId, String query) {
        if (query == null || query.isBlank()) return patientRepository.findByDoctorId(doctorId);
        // Try phone first
        Optional<Patient> byPhone = patientRepository.findByDoctorIdAndPhone(doctorId, query);
        if (byPhone.isPresent()) return List.of(byPhone.get());
        // Then name
        return patientRepository.findByDoctorIdAndNameContainingIgnoreCase(doctorId, query);
    }

    public List<QueueEntryResponse> getPatientVisitHistory(String patientId, String doctorId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        if (!doctorId.equals(patient.getDoctorId())) throw new BadRequestException("Unauthorized");
        return visitRepository.findByPatientIdOrderByVisitDateDesc(patientId)
                .stream().map(v -> buildQueueEntry(v, doctorId)).collect(Collectors.toList());
    }

    // ── REPORTS ─────────────────────────────────────────────────────

    public ReportResponse getDailyReport(String doctorId) {
        LocalDate today = LocalDate.now();
        return ReportResponse.builder()
                .totalPatients(visitRepository.countByDoctorIdAndVisitDate(doctorId, today))
                .completed(visitRepository.countByDoctorIdAndVisitDateAndStatus(doctorId, today, Visit.VisitStatus.COMPLETED))
                .cancelled(visitRepository.countByDoctorIdAndVisitDateAndStatus(doctorId, today, Visit.VisitStatus.CANCELLED))
                .waiting(visitRepository.countByDoctorIdAndVisitDateAndStatus(doctorId, today, Visit.VisitStatus.WAITING))
                .build();
    }

    public ReportResponse getWeeklyReport(String doctorId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        List<Visit> visits = visitRepository.findByDoctorIdAndVisitDateBetween(doctorId, weekStart, today);

        Map<String, Long> daily = visits.stream().collect(
                Collectors.groupingBy(v -> v.getVisitDate().format(DateTimeFormatter.ofPattern("EEE dd MMM")),
                        Collectors.counting()));

        String busiest = daily.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("N/A");

        return ReportResponse.builder()
                .totalPatients(visits.size())
                .completed(visits.stream().filter(v -> v.getStatus() == Visit.VisitStatus.COMPLETED).count())
                .cancelled(visits.stream().filter(v -> v.getStatus() == Visit.VisitStatus.CANCELLED).count())
                .busiestDay(busiest)
                .dailyBreakdown(daily)
                .build();
    }

    public ReportResponse getMonthlyReport(String doctorId) {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        List<Visit> visits = visitRepository.findByDoctorIdAndVisitDateBetween(doctorId, monthStart, today);
        return ReportResponse.builder()
                .totalPatients(visits.size())
                .completed(visits.stream().filter(v -> v.getStatus() == Visit.VisitStatus.COMPLETED).count())
                .cancelled(visits.stream().filter(v -> v.getStatus() == Visit.VisitStatus.CANCELLED).count())
                .build();
    }

    // ── HELPERS ─────────────────────────────────────────────────────

    private QueueEntryResponse buildQueueEntry(Visit visit, String doctorId) {
        Patient patient = patientRepository.findById(visit.getPatientId()).orElse(null);
        int waitingAhead = (int) visitRepository
                .findByDoctorIdAndVisitDateAndStatus(doctorId, visit.getVisitDate(), Visit.VisitStatus.WAITING)
                .stream().filter(v -> v.getTokenNumber() < visit.getTokenNumber()).count();

        return QueueEntryResponse.builder()
                .visitId(visit.getId())
                .tokenNumber(visit.getTokenNumber())
                .patientId(visit.getPatientId())
                .patientName(patient != null ? patient.getName() : "Unknown")
                .patientPhone(patient != null ? patient.getPhone() : "")
                .patientAge(patient != null ? patient.getAge() : 0)
                .patientGender(patient != null ? patient.getGender() : "")
                .symptoms(visit.getSymptoms())
                .notes(visit.getNotes())
                .status(visit.getStatus())
                .visitDate(visit.getVisitDate())
                .checkInTime(visit.getCheckInTime())
                .estimatedWaitMinutes(waitingAhead * 8)
                .build();
    }
}
