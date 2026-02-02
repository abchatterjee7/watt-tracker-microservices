package org.aadi.alert_service.service;

import org.aadi.alert_service.entity.Alert;
import org.aadi.alert_service.repository.AlertRepository;
import org.aadi.kafka.event.AlertingEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AlertService {

    private final EmailService emailService;
    private final AlertRepository alertRepository;

    public AlertService(EmailService emailService, AlertRepository alertRepository) {
        this.emailService = emailService;
        this.alertRepository = alertRepository;
    }

    @KafkaListener(topics = "energy-alerts", groupId = "alert-service")
    public void energyUsageAlertEvent(AlertingEvent alertingEvent) {
        log.info("Received alert event: {}", alertingEvent);

        // Save alert to database
        Alert alert = Alert.builder()
                .userId(alertingEvent.getUserId())
                .type("energy_threshold")
                .severity("high")
                .message(alertingEvent.getMessage())
                .value(alertingEvent.getEnergyConsumed())
                .threshold(alertingEvent.getThreshold())
                .timestamp(java.time.LocalDateTime.now())
                .acknowledged(false)
                .email(alertingEvent.getEmail())
                .sent(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        
        alertRepository.save(alert);
        log.info("Saved alert to database for user {}", alertingEvent.getUserId());

        // Only send email if user has email notifications enabled
        if (alertingEvent.getEmail() != null && !alertingEvent.getEmail().isEmpty()) {
            log.info("Sending email alert to user {} at {}", alertingEvent.getUserId(), alertingEvent.getEmail());
            final String subject = "Energy Usage Alert for User "
                    + alertingEvent.getUserId();
            final String message = "Alert: " + alertingEvent.getMessage() +
                    "\nThreshold: " + alertingEvent.getThreshold() +
                    "\nEnergy Consumed: " + alertingEvent.getEnergyConsumed();
            try {
                emailService.sendEmail(alertingEvent.getEmail(),
                        subject,
                        message,
                        alertingEvent.getUserId());
                alert.setSent(true);
                alertRepository.save(alert);
                log.info("Email sent successfully to user {}", alertingEvent.getUserId());
            } catch (Exception e) {
                log.error("Failed to send email to user {}: {}", alertingEvent.getUserId(), e.getMessage());
            }
        } else {
            log.info("Email notifications disabled for user {} - skipping email", alertingEvent.getUserId());
        }
    }

    public List<Alert> getAlertsForUser(Long userId) {
        return alertRepository.findByUserId(userId);
    }
}
