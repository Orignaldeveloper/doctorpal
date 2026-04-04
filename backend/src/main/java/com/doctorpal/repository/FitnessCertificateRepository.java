package com.doctorpal.repository;

import com.doctorpal.model.FitnessCertificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FitnessCertificateRepository extends MongoRepository<FitnessCertificate, String> {
    List<FitnessCertificate> findByDoctorId(String doctorId);
}