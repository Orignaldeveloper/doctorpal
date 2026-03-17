package com.doctorpal.controller;

import com.doctorpal.dto.request.PatientEntryRequest;
import com.doctorpal.dto.response.ApiResponse;
import com.doctorpal.dto.response.QueueEntryResponse;
import com.doctorpal.model.Patient;
import com.doctorpal.repository.UserRepository;
import com.doctorpal.service.impl.ReceptionistService;
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
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RECEPTIONIST','DOCTOR')")
@Tag(name = "Receptionist", description = "Patient entry and queue viewing")
@SecurityRequirement(name = "bearerAuth")
public class ReceptionistController {

    private final ReceptionistService receptionistService;
    private final UserRepository userRepository;

    private String getDoctorId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(u -> u.getDoctorId()).orElseThrow();
    }

    @PostMapping("/patient-entry")
    @Operation(summary = "Add a new patient entry and generate token")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> addPatient(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody PatientEntryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Patient added with token",
                receptionistService.addPatientEntry(getDoctorId(ud), req)));
    }

    @GetMapping("/today-queue")
    @Operation(summary = "Get today's full queue")
    public ResponseEntity<ApiResponse<List<QueueEntryResponse>>> getTodayQueue(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(receptionistService.getTodayQueue(getDoctorId(ud))));
    }

     @GetMapping("/lookup")
    @Operation(summary = "Lookup existing patient by phone number")
    public ResponseEntity<ApiResponse<Patient>> lookupPatient(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam String phone) {
        Patient patient = receptionistService.lookupByPhone(getDoctorId(ud), phone);
        if (patient == null) return ResponseEntity.ok(ApiResponse.error("Patient not found"));
        return ResponseEntity.ok(ApiResponse.success("Returning patient found", patient));
    }

    @PostMapping("/requeue/{visitId}")
    @Operation(summary = "Re-queue a skipped patient with a new token")
    public ResponseEntity<ApiResponse<QueueEntryResponse>> reQueue(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String visitId) {
        return ResponseEntity.ok(ApiResponse.success("Patient re-queued",
                receptionistService.reQueuePatient(visitId, getDoctorId(ud))));
    }
}
