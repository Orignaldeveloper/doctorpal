package com.doctorpal.controller;

import com.doctorpal.dto.request.DoctorTemplateRequest;
import com.doctorpal.dto.request.FitnessCertificateRequest;
import com.doctorpal.dto.response.ApiResponse;
import com.doctorpal.model.DoctorTemplate;
import com.doctorpal.model.FitnessCertificate;
import com.doctorpal.repository.UserRepository;
import com.doctorpal.service.impl.TemplateService;
//import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/template")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
@Tag(name = "Template", description = "Clinic letterhead and fitness certificates")
@SecurityRequirement(name = "bearerAuth")
public class TemplateController {

    private final TemplateService templateService;
    private final UserRepository userRepository;

    private String getDoctorId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(u -> u.getDoctorId()).orElseThrow();
    }

    @PostMapping("/letterhead")
    public ResponseEntity<ApiResponse<DoctorTemplate>> saveTemplate(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody DoctorTemplateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Template saved",
                templateService.saveTemplate(getDoctorId(ud), req)));
    }

    @GetMapping("/letterhead")
    public ResponseEntity<ApiResponse<DoctorTemplate>> getTemplate(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                templateService.getTemplate(getDoctorId(ud))));
    }

    @PostMapping("/fitness")
    public ResponseEntity<ApiResponse<FitnessCertificate>> createCertificate(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody FitnessCertificateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Certificate created",
                templateService.createCertificate(getDoctorId(ud), req)));
    }

    @PutMapping("/fitness/{id}")
    public ResponseEntity<ApiResponse<FitnessCertificate>> updateCertificate(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id,
            @Valid @RequestBody FitnessCertificateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Certificate updated",
                templateService.updateCertificate(id, getDoctorId(ud), req)));
    }

    @GetMapping("/fitness")
    public ResponseEntity<ApiResponse<List<FitnessCertificate>>> getCertificates(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(
                templateService.getCertificates(getDoctorId(ud))));
    }

    @GetMapping("/fitness/{id}")
    public ResponseEntity<ApiResponse<FitnessCertificate>> getCertificate(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                templateService.getCertificate(id, getDoctorId(ud))));
    }

    @DeleteMapping("/fitness/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCertificate(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String id) {
        templateService.deleteCertificate(id, getDoctorId(ud));
        return ResponseEntity.ok(ApiResponse.success("Certificate deleted", null));
    }
}