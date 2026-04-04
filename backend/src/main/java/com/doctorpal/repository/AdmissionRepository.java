package com.doctorpal.repository;

import com.doctorpal.model.Admission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdmissionRepository extends MongoRepository<Admission, String> {
    List<Admission> findByDoctorIdAndStatus(String doctorId, Admission.AdmissionStatus status);
    List<Admission> findByDoctorId(String doctorId);
}