package com.doctorpal.service.impl;

import com.doctorpal.dto.request.*;
import com.doctorpal.dto.response.IpdBillResponse;
import com.doctorpal.exception.BadRequestException;
import com.doctorpal.exception.ResourceNotFoundException;
import com.doctorpal.model.*;
import com.doctorpal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IpdService {

    private final BedRepository bedRepository;
    private final AdmissionRepository admissionRepository;
    private final IpdChargeRepository ipdChargeRepository;
    private final IpdPaymentRepository ipdPaymentRepository;

    // ── BEDS ─────────────────────────────────────────────────────

    public Bed createBed(String doctorId, BedRequest req) {
        if (bedRepository.existsByDoctorIdAndBedNumber(doctorId, req.getBedNumber()))
            throw new BadRequestException("Bed number already exists: " + req.getBedNumber());
        return bedRepository.save(Bed.builder()
                .doctorId(doctorId).bedNumber(req.getBedNumber())
                .bedType(req.getBedType()).ratePerDay(req.getRatePerDay())
                .status(Bed.BedStatus.AVAILABLE).build());
    }

    public List<Bed> getBeds(String doctorId) {
        return bedRepository.findByDoctorId(doctorId);
    }

    public Bed updateBed(String bedId, String doctorId, BedRequest req) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));
        if (!bed.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        bed.setBedNumber(req.getBedNumber());
        bed.setBedType(req.getBedType());
        bed.setRatePerDay(req.getRatePerDay());
        return bedRepository.save(bed);
    }

    public Bed updateBedStatus(String bedId, String doctorId, String status) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));
        if (!bed.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        bed.setStatus(Bed.BedStatus.valueOf(status.toUpperCase()));
        return bedRepository.save(bed);
    }

    // ── ADMISSIONS ───────────────────────────────────────────────

    public Admission admitPatient(String doctorId, AdmitPatientRequest req) {
        Bed bed = bedRepository.findById(req.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));
        if (!bed.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        if (bed.getStatus() == Bed.BedStatus.OCCUPIED)
            throw new BadRequestException("Bed is already occupied");
        if (bed.getStatus() == Bed.BedStatus.MAINTENANCE)
            throw new BadRequestException("Bed is under maintenance");

        bed.setStatus(Bed.BedStatus.OCCUPIED);
        bedRepository.save(bed);

        double advance = req.getAdvancePaid() != null ? req.getAdvancePaid() : 0.0;
        Admission admission = admissionRepository.save(Admission.builder()
                .doctorId(doctorId).patientId(req.getExistingPatientId())
                .bedId(req.getBedId()).patientName(req.getPatientName())
                .patientPhone(req.getPatientPhone()).patientAge(req.getPatientAge())
                .patientGender(req.getPatientGender()).patientAddress(req.getPatientAddress())
                .bloodGroup(req.getBloodGroup()).emergencyContact(req.getEmergencyContact())
                .emergencyPhone(req.getEmergencyPhone()).diagnosis(req.getDiagnosis())
                .admissionReason(req.getAdmissionReason()).admissionDate(LocalDateTime.now())
                .bedRatePerDay(bed.getRatePerDay()).advancePaid(advance).totalPaid(advance)
                .status(Admission.AdmissionStatus.ADMITTED).build());

        // First day bed charge
        addBedChargeForDate(admission, LocalDate.now());

        // Record advance payment
        if (advance > 0) {
            ipdPaymentRepository.save(IpdPayment.builder()
                    .admissionId(admission.getId()).doctorId(doctorId)
                    .amount(advance).paymentMode("Cash")
                    .note("Advance at admission").paidAt(LocalDateTime.now()).build());
        }
        return admission;
    }

    public List<Admission> getAdmittedPatients(String doctorId) {
        return admissionRepository.findByDoctorIdAndStatus(
                doctorId, Admission.AdmissionStatus.ADMITTED);
    }

    public List<Admission> getAllAdmissions(String doctorId) {
        return admissionRepository.findByDoctorId(doctorId);
    }

    // ── CHARGES ──────────────────────────────────────────────────

    public IpdCharge addCharge(String doctorId, AddIpdChargeRequest req) {
        Admission admission = admissionRepository.findById(req.getAdmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));
        if (!admission.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        if (admission.getStatus() == Admission.AdmissionStatus.DISCHARGED)
            throw new BadRequestException("Patient already discharged");
        return ipdChargeRepository.save(IpdCharge.builder()
                .admissionId(req.getAdmissionId()).doctorId(doctorId)
                .chargeType(req.getChargeType()).description(req.getDescription())
                .amount(req.getAmount()).quantity(req.getQuantity() != null ? req.getQuantity() : 1)
                .chargeDate(LocalDate.now()).isAutoGenerated(false).build());
    }

    public void deleteCharge(String chargeId, String doctorId) {
        IpdCharge charge = ipdChargeRepository.findById(chargeId)
                .orElseThrow(() -> new ResourceNotFoundException("Charge not found"));
        if (!charge.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        if (charge.isAutoGenerated()) throw new BadRequestException("Cannot delete auto bed charge");
        ipdChargeRepository.delete(charge);
    }

    // ── PAYMENTS ─────────────────────────────────────────────────

    public IpdPayment addPayment(String doctorId, AddIpdPaymentRequest req) {
        Admission admission = admissionRepository.findById(req.getAdmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));
        if (!admission.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        IpdPayment payment = ipdPaymentRepository.save(IpdPayment.builder()
                .admissionId(req.getAdmissionId()).doctorId(doctorId)
                .amount(req.getAmount()).paymentMode(req.getPaymentMode())
                .note(req.getNote()).paidAt(LocalDateTime.now()).build());
        admission.setTotalPaid(admission.getTotalPaid() + req.getAmount());
        admissionRepository.save(admission);
        return payment;
    }

    // ── BILL ─────────────────────────────────────────────────────

    public IpdBillResponse getBill(String admissionId, String doctorId) {
        Admission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));
        if (!admission.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");

        List<IpdCharge> charges = ipdChargeRepository.findByAdmissionId(admissionId);
        List<IpdPayment> payments = ipdPaymentRepository.findByAdmissionId(admissionId);

        double totalCharges = charges.stream().mapToDouble(c -> c.getAmount() * c.getQuantity()).sum();
        double totalPaid    = payments.stream().mapToDouble(IpdPayment::getAmount).sum();

        Map<String, Double> breakdown = new LinkedHashMap<>();
        for (IpdCharge.ChargeType type : IpdCharge.ChargeType.values()) {
            double sum = charges.stream().filter(c -> c.getChargeType() == type)
                    .mapToDouble(c -> c.getAmount() * c.getQuantity()).sum();
            if (sum > 0) breakdown.put(type.name(), sum);
        }

        long totalDays = ChronoUnit.DAYS.between(
                admission.getAdmissionDate().toLocalDate(),
                admission.getDischargeDate() != null
                        ? admission.getDischargeDate().toLocalDate() : LocalDate.now()) + 1;

        return IpdBillResponse.builder()
                .admission(admission).charges(charges).payments(payments)
                .chargeBreakdown(breakdown).totalCharges(totalCharges)
                .totalPaid(totalPaid).balanceDue(totalCharges - totalPaid)
                .totalDays(totalDays).build();
    }

    // ── DISCHARGE ────────────────────────────────────────────────

    public Admission dischargePatient(String doctorId, DischargeRequest req) {
        Admission admission = admissionRepository.findById(req.getAdmissionId())
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found"));
        if (!admission.getDoctorId().equals(doctorId)) throw new BadRequestException("Unauthorized");
        if (admission.getStatus() == Admission.AdmissionStatus.DISCHARGED)
            throw new BadRequestException("Patient already discharged");

        List<IpdCharge> charges   = ipdChargeRepository.findByAdmissionId(req.getAdmissionId());
        List<IpdPayment> payments = ipdPaymentRepository.findByAdmissionId(req.getAdmissionId());
        double totalBill = charges.stream().mapToDouble(c -> c.getAmount() * c.getQuantity()).sum();
        double totalPaid = payments.stream().mapToDouble(IpdPayment::getAmount).sum();

        admission.setDischargeDate(LocalDateTime.now());
        admission.setTreatmentSummary(req.getTreatmentSummary());
        admission.setDischargeAdvice(req.getDischargeAdvice());
        admission.setMedicinesOnDischarge(req.getMedicinesOnDischarge());
        admission.setTotalBill(totalBill);
        admission.setTotalPaid(totalPaid);
        admission.setBalanceDue(totalBill - totalPaid);
        admission.setStatus(Admission.AdmissionStatus.DISCHARGED);
        admissionRepository.save(admission);

        bedRepository.findById(admission.getBedId()).ifPresent(bed -> {
            bed.setStatus(Bed.BedStatus.AVAILABLE);
            bedRepository.save(bed);
        });
        return admission;
    }

    // ── AUTO BED CHARGE — midnight ────────────────────────────────

    @Scheduled(cron = "0 0 0 * * *")
    public void autoAddDailyBedCharges() {
        LocalDate today = LocalDate.now();
        admissionRepository.findAll().stream()
                .filter(a -> a.getStatus() == Admission.AdmissionStatus.ADMITTED)
                .forEach(admission -> {
                    boolean alreadyCharged = ipdChargeRepository
                            .existsByAdmissionIdAndChargeDateAndChargeType(
                                    admission.getId(), today, IpdCharge.ChargeType.BED);
                    if (!alreadyCharged) addBedChargeForDate(admission, today);
                });
    }

    private void addBedChargeForDate(Admission admission, LocalDate date) {
        ipdChargeRepository.save(IpdCharge.builder()
                .admissionId(admission.getId()).doctorId(admission.getDoctorId())
                .chargeType(IpdCharge.ChargeType.BED)
                .description("Bed charge - " + date)
                .amount(admission.getBedRatePerDay()).quantity(1)
                .chargeDate(date).isAutoGenerated(true).build());
    }
}