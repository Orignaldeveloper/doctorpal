package com.doctorpal.controller;

import com.doctorpal.dto.request.CreateReceptionistRequest;
import com.doctorpal.dto.response.ApiResponse;
import com.doctorpal.dto.response.QueueEntryResponse;
import com.doctorpal.dto.response.ReportResponse;
import com.doctorpal.model.Patient;
import com.doctorpal.model.User;
import com.doctorpal.service.impl.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@Tag(name = "Doctor", description = "Clinic management, queue control, reports")
@SecurityRequirement(name = "bearerAuth")
public class DoctorController {

    private final DoctorService doctorService;
    private final com.doctorpal.repository.UserRepository userRepository;
    private final com.doctorpal.repository.DoctorRepository doctorRepository;

    private String getDoctorId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(u -> u.getDoctorId()).orElseThrow();
    }

    // ── RECEPTIONIST ──────────────────────────────────────────────

    @PostMapping("/receptionists")
    @Operation(summary = "Create a receptionist under this doctor")
    public ResponseEntity<ApiResponse<User>> createReceptionist(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CreateReceptionistRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Receptionist created",
                doctorService.createReceptionist(getDoctorId(ud), req)));
    }

    @GetMapping("/receptionists")
    @Operation(summary = "Get all receptionists under this doctor")
    public ResponseEntity<ApiResponse<List<User>>> getReceptionists(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getReceptionists(getDoctorId(ud))));
    }

    @PatchMapping("/receptionists/{userId}/toggle")
    @Operation(summary = "Toggle receptionist active/inactive")
    public ResponseEntity<ApiResponse<User>> toggleReceptionist(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                doctorService.toggleReceptionistStatus(userId, getDoctorId(ud))));
    }

    // ── QUEUE ─────────────────────────────────────────────────────

    @GetMapping("/queue")
    @Operation(summary = "Get today's live patient queue")
    public ResponseEntity<ApiResponse<List<QueueEntryResponse>>> getQueue(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getTodayQueue(getDoctorId(ud))));
    }

    @PostMapping("/queue/next")
    @Operation(summary = "Call next patient (completes current, promotes next WAITING)")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> nextPatient(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success("Next patient called",
                doctorService.callNextPatient(getDoctorId(ud))));
    }

    @PatchMapping("/visits/{visitId}/status")
    @Operation(summary = "Update a visit status manually")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> updateStatus(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String visitId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                doctorService.updateVisitStatus(visitId, getDoctorId(ud), status)));
    }

      @DeleteMapping("/visits/{visitId}")
    @Operation(summary = "Delete a visit entry")
    public ResponseEntity<ApiResponse<Void>> deleteVisit(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String visitId) {
        doctorService.deleteVisit(visitId, getDoctorId(ud));
        return ResponseEntity.ok(ApiResponse.success("Visit deleted", null));
    }

    @PatchMapping("/visits/{visitId}/skip")
    @Operation(summary = "Skip a patient — marks as SKIPPED")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> skipPatient(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String visitId) {
        return ResponseEntity.ok(ApiResponse.success("Patient skipped",
                doctorService.updateVisitStatus(visitId, getDoctorId(ud), "SKIPPED")));
    }

    // ── PATIENTS ──────────────────────────────────────────────────

    @GetMapping("/patients")
    @Operation(summary = "Search patients by name or phone")
    public ResponseEntity<ApiResponse<List<Patient>>> searchPatients(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchPatients(getDoctorId(ud), q)));
    }

    @GetMapping("/patients/{patientId}/history")
    @Operation(summary = "Get all visits for a patient")
    public ResponseEntity<ApiResponse<List<QueueEntryResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                doctorService.getPatientVisitHistory(patientId, getDoctorId(ud))));
    }

    // ── REPORTS ───────────────────────────────────────────────────

    @GetMapping("/reports/daily")
    @Operation(summary = "Daily report for today")
    public ResponseEntity<ApiResponse<ReportResponse>> dailyReport(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDailyReport(getDoctorId(ud))));
    }

    @GetMapping("/reports/weekly")
    @Operation(summary = "Weekly report (last 7 days)")
    public ResponseEntity<ApiResponse<ReportResponse>> weeklyReport(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getWeeklyReport(getDoctorId(ud))));
    }

    @GetMapping("/reports/monthly")
    @Operation(summary = "Monthly report (current month)")
    public ResponseEntity<ApiResponse<ReportResponse>> monthlyReport(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getMonthlyReport(getDoctorId(ud))));
    }
}
