package com.doctorpal.repository;

import com.doctorpal.model.Bed;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BedRepository extends MongoRepository<Bed, String> {
    List<Bed> findByDoctorId(String doctorId);
    List<Bed> findByDoctorIdAndStatus(String doctorId, Bed.BedStatus status);
    boolean existsByDoctorIdAndBedNumber(String doctorId, String bedNumber);
}