package com.doctorpal.repository;

import com.doctorpal.model.TokenCounter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TokenCounterRepository extends MongoRepository<TokenCounter, String> {
    Optional<TokenCounter> findByDoctorIdAndDate(String doctorId, LocalDate date);
}
