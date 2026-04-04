package com.doctorpal.controller;

import com.doctorpal.dto.request.*;
import com.doctorpal.dto.response.ApiResponse;
import com.doctorpal.dto.response.IpdBillResponse;
import com.doctorpal.model.*;
import com.doctorpal.repository.UserRepository;
import com.doctorpal.service.impl.IpdService;
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
@RequestMapping("/api/ipd")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@Tag(name = "IPD", description = "In-Patient Department Management")
@SecurityRequirement(name = "bearerAuth")
public class IpdController {

    private final IpdService ipdService;
    private final UserRepository userRepository;

    private String getDoctorId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(u -> u.getDoctorId()).orElseThrow();
    }

    @PostMapping("/beds")
    public ResponseEntity<ApiResponse<Bed>> createBed(
            @AuthenticationPrincipal UserDetails ud, @Valid @RequestBody BedRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Bed created",
                ipdService.createBed(getDoctorId(ud), req)));
    }

    @GetMapping("/beds")
    public ResponseEntity<ApiResponse<List<Bed>>> getBeds(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(ipdService.getBeds(getDoctorId(ud))));
    }

    @PutMapping("/beds/{bedId}")
    public ResponseEntity<ApiResponse<Bed>> updateBed(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String bedId,
            @Valid @RequestBody BedRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Bed updated",
                ipdService.updateBed(bedId, getDoctorId(ud), req)));
    }

    @PatchMapping("/beds/{bedId}/status")
    public ResponseEntity<ApiResponse<Bed>> updateBedStatus(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String bedId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                ipdService.updateBedStatus(bedId, getDoctorId(ud), status)));
    }

    @PostMapping("/admit")
    public ResponseEntity<ApiResponse<Admission>> admitPatient(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody AdmitPatientRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Patient admitted",
                ipdService.admitPatient(getDoctorId(ud), req)));
    }

    @GetMapping("/admitted")
    public ResponseEntity<ApiResponse<List<Admission>>> getAdmitted(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                ipdService.getAdmittedPatients(getDoctorId(ud))));
    }

    @GetMapping("/admissions")
    public ResponseEntity<ApiResponse<List<Admission>>> getAllAdmissions(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                ipdService.getAllAdmissions(getDoctorId(ud))));
    }

    @PostMapping("/charges")
    public ResponseEntity<ApiResponse<IpdCharge>> addCharge(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody AddIpdChargeRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Charge added",
                ipdService.addCharge(getDoctorId(ud), req)));
    }

    @DeleteMapping("/charges/{chargeId}")
    public ResponseEntity<ApiResponse<Void>> deleteCharge(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String chargeId) {
        ipdService.deleteCharge(chargeId, getDoctorId(ud));
        return ResponseEntity.ok(ApiResponse.success("Charge deleted", null));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<IpdPayment>> addPayment(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody AddIpdPaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded",
                ipdService.addPayment(getDoctorId(ud), req)));
    }

    @GetMapping("/bill/{admissionId}")
    public ResponseEntity<ApiResponse<IpdBillResponse>> getBill(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String admissionId) {
        return ResponseEntity.ok(ApiResponse.success(
                ipdService.getBill(admissionId, getDoctorId(ud))));
    }

    @PostMapping("/discharge")
    public ResponseEntity<ApiResponse<Admission>> discharge(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody DischargeRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Patient discharged",
                ipdService.dischargePatient(getDoctorId(ud), req)));
    }
}