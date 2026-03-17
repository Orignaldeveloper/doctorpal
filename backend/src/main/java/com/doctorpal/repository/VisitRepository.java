package com.doctorpal.repository;

import com.doctorpal.model.Visit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitRepository extends MongoRepository<Visit, String> {
    List<Visit> findByDoctorIdAndVisitDateOrderByTokenNumberAsc(String doctorId, LocalDate visitDate);
    List<Visit> findByDoctorIdAndVisitDateAndStatus(String doctorId, LocalDate visitDate, Visit.VisitStatus status);
    List<Visit> findByPatientIdOrderByVisitDateDesc(String patientId);
    Optional<Visit> findByDoctorIdAndStatusIn(String doctorId, List<Visit.VisitStatus> statuses);
    long countByDoctorIdAndVisitDate(String doctorId, LocalDate date);
    long countByDoctorIdAndVisitDateAndStatus(String doctorId, LocalDate date, Visit.VisitStatus status);
    List<Visit> findByDoctorIdAndVisitDateBetween(String doctorId, LocalDate from, LocalDate to);
    int countByDoctorIdAndVisitDateBetween(String doctorId, LocalDate from, LocalDate to);
}
