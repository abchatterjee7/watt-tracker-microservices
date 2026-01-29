package org.aadi.user_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aadi.user_service.dto.AuthRequest;
import org.aadi.user_service.dto.AuthResponse;
import org.aadi.user_service.entity.User;
import org.aadi.user_service.repository.UserRepository;
import org.aadi.user_service.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse authenticate(AuthRequest authRequest) {
        log.info("Authenticating user: {}", authRequest.getUsername());
        
        User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + authRequest.getUsername()));

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password for user: " + authRequest.getUsername());
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                List.of(user.getRole().name()),
                user.getId()
        );

        log.info("User authenticated successfully: {}", authRequest.getUsername());
        
        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getRole().name()
        );
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
