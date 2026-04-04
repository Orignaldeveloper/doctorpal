package com.doctorpal.repository;

import com.doctorpal.model.DoctorTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DoctorTemplateRepository extends MongoRepository<DoctorTemplate, String> {
    Optional<DoctorTemplate> findByDoctorId(String doctorId);
}