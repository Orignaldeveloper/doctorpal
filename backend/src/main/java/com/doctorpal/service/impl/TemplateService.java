package com.doctorpal.service.impl;

import com.doctorpal.dto.request.DoctorTemplateRequest;
import com.doctorpal.dto.request.FitnessCertificateRequest;
import com.doctorpal.exception.BadRequestException;
import com.doctorpal.exception.ResourceNotFoundException;
import com.doctorpal.model.DoctorTemplate;
import com.doctorpal.model.FitnessCertificate;
import com.doctorpal.repository.DoctorTemplateRepository;
import com.doctorpal.repository.FitnessCertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final DoctorTemplateRepository templateRepository;
    private final FitnessCertificateRepository certificateRepository;

    public DoctorTemplate saveTemplate(String doctorId, DoctorTemplateRequest req) {
        DoctorTemplate t = templateRepository.findByDoctorId(doctorId)
                .orElse(DoctorTemplate.builder().doctorId(doctorId).build());
        t.setClinicName(req.getClinicName());
        t.setDoctorName(req.getDoctorName());
        t.setQualification(req.getQualification());
        t.setRegistrationNumber(req.getRegistrationNumber());
        t.setSpecialization(req.getSpecialization());
        t.setClinicAddress(req.getClinicAddress());
        t.setCity(req.getCity());
        t.setState(req.getState());
        t.setPincode(req.getPincode());
        t.setPhone(req.getPhone());
        t.setEmail(req.getEmail());
        t.setTimings(req.getTimings());
        t.setSignatureText(req.getSignatureText());
        t.setFooterNote(req.getFooterNote());
        t.setShowLogo(req.isShowLogo());
        t.setShowWithHeader(req.isShowWithHeader());
        t.setShowWithoutHeader(req.isShowWithoutHeader());
        return templateRepository.save(t);
    }

    public DoctorTemplate getTemplate(String doctorId) {
        return templateRepository.findByDoctorId(doctorId)
                .orElse(DoctorTemplate.builder().doctorId(doctorId).build());
    }

    public FitnessCertificate createCertificate(String doctorId, FitnessCertificateRequest req) {
        return certificateRepository.save(FitnessCertificate.builder()
                .doctorId(doctorId).patientId(req.getPatientId())
                .patientName(req.getPatientName()).patientAge(req.getPatientAge())
                .patientGender(req.getPatientGender()).patientAddress(req.getPatientAddress())
                .fitnessType(req.getFitnessType()).customStatement(req.getCustomStatement())
                .diagnosis(req.getDiagnosis()).remarks(req.getRemarks())
                .certificateDate(LocalDate.now()).validTill(req.getValidTill()).build());
    }

    public FitnessCertificate updateCertificate(String certId, String doctorId,
            FitnessCertificateRequest req) {
        FitnessCertificate cert = certificateRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        if (!cert.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        cert.setPatientName(req.getPatientName());
        cert.setPatientAge(req.getPatientAge());
        cert.setPatientGender(req.getPatientGender());
        cert.setPatientAddress(req.getPatientAddress());
        cert.setFitnessType(req.getFitnessType());
        cert.setCustomStatement(req.getCustomStatement());
        cert.setDiagnosis(req.getDiagnosis());
        cert.setRemarks(req.getRemarks());
        cert.setValidTill(req.getValidTill());
        return certificateRepository.save(cert);
    }

    public List<FitnessCertificate> getCertificates(String doctorId) {
        return certificateRepository.findByDoctorId(doctorId);
    }

    public FitnessCertificate getCertificate(String certId, String doctorId) {
        FitnessCertificate cert = certificateRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        if (!cert.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        return cert;
    }

    public void deleteCertificate(String certId, String doctorId) {
        FitnessCertificate cert = certificateRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        if (!cert.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        certificateRepository.delete(cert);
    }
}