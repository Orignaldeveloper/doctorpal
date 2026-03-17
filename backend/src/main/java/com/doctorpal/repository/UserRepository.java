package com.doctorpal.repository;

import com.doctorpal.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByDoctorIdAndRole(String doctorId, User.Role role);
    List<User> findByRole(User.Role role);
}
