package com.doctorpal.service.impl;

import com.doctorpal.dto.request.LoginRequest;
import com.doctorpal.dto.response.AuthResponse;
import com.doctorpal.exception.BadRequestException;
import com.doctorpal.model.Doctor;
import com.doctorpal.model.User;
import com.doctorpal.repository.DoctorRepository;
import com.doctorpal.repository.UserRepository;
import com.doctorpal.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getStatus() == User.UserStatus.INACTIVE) {
            throw new BadRequestException("Your account is inactive. Contact administrator.");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Update doctor last login if applicable
        if (user.getRole() == User.Role.DOCTOR) {
            doctorRepository.findByUserId(user.getId()).ifPresent(doc -> {
                doc.setLastLogin(LocalDateTime.now());
                doctorRepository.save(doc);
            });
        }

        String token = jwtUtils.generateToken(userDetails, user.getRole().name(), user.getDoctorId());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .doctorId(user.getDoctorId())
                .build();
    }
}
