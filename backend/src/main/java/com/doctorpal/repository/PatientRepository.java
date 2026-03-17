package com.doctorpal.repository;

import com.doctorpal.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {
    Optional<Patient> findByPhoneAndDoctorId(String phone, String doctorId);
    List<Patient> findByDoctorId(String doctorId);
    List<Patient> findByDoctorIdAndNameContainingIgnoreCase(String doctorId, String name);
    Optional<Patient> findByDoctorIdAndPhone(String doctorId, String phone);
}
