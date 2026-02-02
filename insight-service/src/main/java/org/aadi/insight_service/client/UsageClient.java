package org.aadi.insight_service.client;

import org.aadi.insight_service.dto.UsageDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class UsageClient {

    private final RestTemplate restTemplate;

    private final String baseUrl;

    public UsageClient(@Value("${usage.service.url:http://localhost:8086/api/v1/user}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
        this.baseUrl = baseUrl;
    }

    public UsageDto getXDaysUsageForUser (Long userId, int days) {
        try {
            log.info("Fetching usage data for userId {} from {}", userId, baseUrl);
            
            String url = UriComponentsBuilder
                    .fromUriString(baseUrl)
                    .path("/{userId}")
                    .queryParam("days", days)
                    .buildAndExpand(userId)
                    .toUriString();

            ResponseEntity<UsageDto> response = restTemplate.getForEntity(url, UsageDto.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully fetched usage data for userId {}", userId);
                return response.getBody();
            } else {
                log.warn("Received non-OK response for userId {}: {}", userId, response.getStatusCode());
                return createFallbackUsageDto(userId);
            }
            
        } catch (HttpClientErrorException e) {
            log.error("HTTP error fetching usage data for userId {}: {}", userId, e.getMessage());
            return createFallbackUsageDto(userId);
        } catch (ResourceAccessException e) {
            log.error("Connection timeout fetching usage data for userId {}: {}", userId, e.getMessage());
            return createFallbackUsageDto(userId);
        } catch (Exception e) {
            log.error("Unexpected error fetching usage data for userId {}: {}", userId, e.getMessage(), e);
            return createFallbackUsageDto(userId);
        }
    }
    
    private UsageDto createFallbackUsageDto(Long userId) {
        return UsageDto.builder()
                .userId(userId)
                .devices(null)
                .build();
    }
}
