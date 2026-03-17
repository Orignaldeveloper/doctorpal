package com.doctorpal.service.impl;

import com.doctorpal.dto.request.PatientEntryRequest;
import com.doctorpal.dto.response.QueueEntryResponse;
import com.doctorpal.exception.ResourceNotFoundException;
import com.doctorpal.model.Doctor;
import com.doctorpal.model.Patient;
import com.doctorpal.model.TokenCounter;
import com.doctorpal.model.Visit;
import com.doctorpal.repository.DoctorRepository;
import com.doctorpal.repository.PatientRepository;
import com.doctorpal.repository.TokenCounterRepository;
import com.doctorpal.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceptionistService {

    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final TokenCounterRepository tokenCounterRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorService doctorService;

    public QueueEntryResponse addPatientEntry(String doctorId, PatientEntryRequest req) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        final String fDoctorId   = doctorId;
        final String fName       = req.getPatientName();
        final String fPhone      = req.getPhoneNumber();
        final int    fAge        = req.getAge();
        final String fGender     = req.getGender();
        final String fBlood      = req.getBloodGroup();
        final String fAddress    = req.getAddress();

        Patient patient = patientRepository
                .findByPhoneAndDoctorId(fPhone, fDoctorId)
                .orElseGet(() -> patientRepository.save(
                        Patient.builder()
                                .doctorId(fDoctorId)
                                .name(fName)
                                .phone(fPhone)
                                .age(fAge)
                                .gender(fGender)
                                .bloodGroup(fBlood)
                                .address(fAddress)
                                .build()
                ));

        int token = generateToken(doctorId, doctor);

        Visit visit = visitRepository.save(Visit.builder()
                .patientId(patient.getId())
                .doctorId(doctorId)
                .tokenNumber(token)
                .symptoms(req.getSymptoms())
                .notes(req.getNotes())
                .status(Visit.VisitStatus.WAITING)
                .visitDate(LocalDate.now())
                .checkInTime(LocalDateTime.now())
                .build());

        return doctorService.getTodayQueue(doctorId).stream()
                .filter(q -> q.getVisitId().equals(visit.getId()))
                .findFirst()
                .orElseGet(() -> buildBasicResponse(visit, patient, token));
    }

    public List<QueueEntryResponse> getTodayQueue(String doctorId) {
        return doctorService.getTodayQueue(doctorId);
    }

        public Patient lookupByPhone(String doctorId, String phone) {
        return patientRepository.findByPhoneAndDoctorId(phone, doctorId).orElse(null);
    }

    public QueueEntryResponse reQueuePatient(String visitId, String doctorId) {
        Visit oldVisit = visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));

        if (!oldVisit.getDoctorId().equals(doctorId)) {
            throw new com.doctorpal.exception.BadRequestException("Unauthorized");
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Generate new token
        int newToken = generateToken(doctorId, doctor);

        // Create new visit for same patient
        Visit newVisit = visitRepository.save(Visit.builder()
                .patientId(oldVisit.getPatientId())
                .doctorId(doctorId)
                .tokenNumber(newToken)
                .symptoms(oldVisit.getSymptoms())
                .notes("Re-queued from token #" + oldVisit.getTokenNumber())
                .status(Visit.VisitStatus.WAITING)
                .visitDate(LocalDate.now())
                .checkInTime(LocalDateTime.now())
                .build());

        return doctorService.getTodayQueue(doctorId).stream()
                .filter(q -> q.getVisitId().equals(newVisit.getId()))
                .findFirst()
                .orElseGet(() -> buildBasicResponse(newVisit,
                        patientRepository.findById(newVisit.getPatientId()).orElse(null),
                        newToken));
    }

    private int generateToken(String doctorId, Doctor doctor) {
        LocalDate today          = LocalDate.now();
        final String counterId   = doctorId + "_" + today;
        final String fDoctorId   = doctorId;
        final int    fStartToken = doctor.getTokenStartNumber() - 1;

        TokenCounter counter = tokenCounterRepository
                .findByDoctorIdAndDate(doctorId, today)
                .orElseGet(() -> TokenCounter.builder()
                        .id(counterId)
                        .doctorId(fDoctorId)
                        .date(today)
                        .currentToken(fStartToken)
                        .build());

        counter.setCurrentToken(counter.getCurrentToken() + 1);
        tokenCounterRepository.save(counter);
        return counter.getCurrentToken();
    }

    private QueueEntryResponse buildBasicResponse(Visit visit, Patient patient, int token) {
        return QueueEntryResponse.builder()
                .visitId(visit.getId())
                .tokenNumber(token)
                .patientId(patient.getId())
                .patientName(patient.getName())
                .patientPhone(patient.getPhone())
                .patientAge(patient.getAge())
                .patientGender(patient.getGender())
                .symptoms(visit.getSymptoms())
                .status(Visit.VisitStatus.WAITING)
                .visitDate(visit.getVisitDate())
                .checkInTime(visit.getCheckInTime())
                .build();
    }
}
