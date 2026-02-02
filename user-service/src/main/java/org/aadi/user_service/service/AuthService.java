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
        String email = authRequest.getEmail();
        log.info("Authenticating user: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password for user: " + email);
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                List.of(user.getRole().name()),
                user.getId()
        );

        log.info("User authenticated successfully: {}", email);
        
        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
