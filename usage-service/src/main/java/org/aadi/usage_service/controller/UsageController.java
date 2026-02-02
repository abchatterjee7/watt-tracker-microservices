package org.aadi.usage_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.aadi.usage_service.dto.UsageDto;
import org.aadi.usage_service.service.UsageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/usage")
public class UsageController {

    private final UsageService usageService;

    public UsageController(UsageService usageService) {
        this.usageService = usageService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UsageDto> getUserDeviceUsage(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "3") int days) {
        UsageDto usageDto = usageService.getXDaysUsageForUser(userId, days);
        return ResponseEntity.ok(usageDto);
    }

    @PostMapping("/check-alerts")
    public ResponseEntity<String> checkAlerts() {
        try {
            log.info("Manual alert check triggered");
            usageService.aggregateDeviceEnergyUsage();
            return ResponseEntity.ok("Alert check completed");
        } catch (Exception e) {
            log.error("Failed to check alerts", e);
            return ResponseEntity.status(500).body("Failed to check alerts: " + e.getMessage());
        }
    }
}
