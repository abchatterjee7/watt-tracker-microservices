package org.aadi.alert_service.controller;

import org.aadi.alert_service.entity.Alert;
import org.aadi.alert_service.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alert")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alert>> getAlertsForUser(@PathVariable Long userId) {
        List<Alert> alerts = alertService.getAlertsForUser(userId);
        return ResponseEntity.ok(alerts);
    }
}
