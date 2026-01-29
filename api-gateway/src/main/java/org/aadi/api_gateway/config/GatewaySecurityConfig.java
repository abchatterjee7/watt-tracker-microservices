package org.aadi.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges
                // Allow all OPTIONS requests for CORS preflight
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Authentication endpoints
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers("/user-service/api/v1/auth/**").permitAll()
                .pathMatchers("/user-service/api/v1/user/login").permitAll()
                .pathMatchers("/user-service/api/v1/user/register").permitAll()
                .pathMatchers("/user-service/api/v1/user/validate-token").permitAll()
                
                // Eureka dashboard
                .pathMatchers("/eureka/**").permitAll()
                
                // Health check and monitoring endpoints
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/health/**").permitAll()
                .pathMatchers("/info/**").permitAll()
                
                // Public API endpoints that don't require authentication
                .pathMatchers("/ingestion-service/api/v1/ingestion").permitAll()
                .pathMatchers("/device-service/api/v1/device/**").permitAll()
                .pathMatchers("/usage-service/api/v1/usage/**").permitAll()
                .pathMatchers("/insight-service/api/v1/insight/**").permitAll()
                .pathMatchers("/alert-service/api/v1/alert/**").permitAll()
                
                // All other endpoints require authentication
                .anyExchange().authenticated()
            )
            .build();
    }
}
