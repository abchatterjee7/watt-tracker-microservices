package org.aadi.api_gateway.config;

import org.aadi.api_gateway.filter.JwtAuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public RouteConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/user-service/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter)
                                .stripPrefix(2))
                        .uri("lb://user-service"))
                
                .route("device-service", r -> r.path("/device-service/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter)
                                .stripPrefix(2))
                        .uri("lb://device-service"))
                
                .route("usage-service", r -> r.path("/usage-service/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter)
                                .stripPrefix(2))
                        .uri("lb://usage-service"))
                
                .route("alert-service", r -> r.path("/alert-service/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter)
                                .stripPrefix(2))
                        .uri("lb://alert-service"))
                
                .route("ingestion-service", r -> r.path("/ingestion-service/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter)
                                .stripPrefix(2))
                        .uri("lb://ingestion-service"))
                
                .route("insight-service", r -> r.path("/insight-service/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter)
                                .stripPrefix(2))
                        .uri("lb://insight-service"))
                
                .build();
    }
}
