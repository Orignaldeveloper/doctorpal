package com.doctorpal.repository;

import com.doctorpal.model.IpdPayment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IpdPaymentRepository extends MongoRepository<IpdPayment, String> {
    List<IpdPayment> findByAdmissionId(String admissionId);
}