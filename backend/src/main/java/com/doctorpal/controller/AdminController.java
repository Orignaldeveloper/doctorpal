package com.doctorpal.controller;

import com.doctorpal.dto.request.CreateDoctorRequest;
import com.doctorpal.dto.response.ApiResponse;
import com.doctorpal.model.Doctor;
import com.doctorpal.service.impl.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin", description = "Platform-level doctor and stats management")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/doctors")
    @Operation(summary = "Create a new doctor account")
    public ResponseEntity<ApiResponse<Doctor>> createDoctor(@Valid @RequestBody CreateDoctorRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Doctor created", adminService.createDoctor(req)));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get all doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllDoctors()));
    }

    @PutMapping("/doctors/{id}")
    @Operation(summary = "Update doctor details")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(
            @PathVariable String id,
            @Valid @RequestBody CreateDoctorRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", adminService.updateDoctor(id, req)));
    }

    @PatchMapping("/doctors/{id}/status")
    @Operation(summary = "Activate or deactivate a doctor")
    public ResponseEntity<ApiResponse<Doctor>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", adminService.updateDoctorStatus(id, status)));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform-wide statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPlatformStats()));
    }
}
