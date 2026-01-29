package org.aadi.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

// @Component - Temporarily disabled
public class JwtAuthenticationFilter implements GatewayFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret:mySuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLong}")
    private String secret;

    private SecretKey signingKey;

    @Value("${jwt.secret:mySuperSecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLong}")
    public void setSecret(String secret) {
        this.secret = secret;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Skip authentication for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod().name())) {
            return chain.filter(exchange);
        }
        
        if (isPublicPath(request.getPath().value())) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return handleError(exchange, "Missing or invalid Authorization header");
        }

        try {
            String token = authHeader.substring(7);
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-User-Id", claims.get("userId", String.class))
                    .header("X-Username", claims.getSubject())
                    .header("X-User-Roles", extractRolesAsString(claims))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return handleError(exchange, "Invalid JWT token");
        }
    }

    private String extractRolesAsString(Claims claims) {
        List<?> roles = claims.get("roles", List.class);
        if (roles == null) {
            return "";
        }
        return roles.stream()
                .map(Object::toString)
                .collect(Collectors.joining(","));
    }

    private boolean isPublicPath(String path) {
        return path.contains("/auth/") || 
               path.contains("/eureka/") ||
               path.contains("/actuator/");
    }

    private Mono<Void> handleError(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = String.format("{\"error\": \"%s\", \"status\": 401}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100;
    }
}
