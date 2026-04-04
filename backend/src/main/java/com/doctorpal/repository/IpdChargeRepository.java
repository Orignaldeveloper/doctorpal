package com.doctorpal.repository;

import com.doctorpal.model.IpdCharge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface IpdChargeRepository extends MongoRepository<IpdCharge, String> {
    List<IpdCharge> findByAdmissionId(String admissionId);
    boolean existsByAdmissionIdAndChargeDateAndChargeType(
        String admissionId, LocalDate date, IpdCharge.ChargeType type);
}