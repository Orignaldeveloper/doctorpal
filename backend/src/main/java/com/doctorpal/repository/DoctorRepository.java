package com.doctorpal.repository;

import com.doctorpal.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {
    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByUserId(String userId);
    boolean existsByEmail(String email);
    List<Doctor> findByStatus(Doctor.DoctorStatus status);
    List<Doctor> findByCity(String city);
}
