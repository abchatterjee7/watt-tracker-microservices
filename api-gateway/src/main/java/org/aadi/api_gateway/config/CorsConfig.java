package org.aadi.api_gateway.config;

// @Configuration - Temporarily disabled to avoid duplicate CORS headers
public class CorsConfig {

    // @Bean
    // public CorsWebFilter corsWebFilter() {
    //     CorsConfiguration corsConfig = new CorsConfiguration();
    //     corsConfig.setAllowCredentials(true);
    //     corsConfig.addAllowedOrigin("http://localhost:5173");
    //     corsConfig.addAllowedOrigin("http://localhost:3000");
    //     corsConfig.addAllowedHeader("*");
    //     corsConfig.addAllowedMethod("*");
    //     
    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     source.registerCorsConfiguration("/**", corsConfig);
    //     
    //     return new CorsWebFilter(source);
    // }
}
