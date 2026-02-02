package org.aadi.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()              
                .route("device-service", r -> r.path("/device-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8081"))

                .route("ingestion-service", r -> r.path("/ingestion-service/**")
                        .filters(f -> f.stripPrefix(2))
                        .uri("http://localhost:8082"))
                
                .route("usage-service", r -> r.path("/usage-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8083"))
                
                .route("alert-service", r -> r.path("/alert-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8084"))
                
                .route("insight-service", r -> r.path("/insight-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8085"))
                
                .route("user-service", r -> r.path("/user-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8086"))
                
                .build();
    }
}
