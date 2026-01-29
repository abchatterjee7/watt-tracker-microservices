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

        // send email alert
        final String subject = "Energy Usage Alert for User "
                + alertingEvent.getUserId();
        final String message = "Alert: " + alertingEvent.getMessage() +
                "\nThreshold: " + alertingEvent.getThreshold() +
                "\nEnergy Consumed: " + alertingEvent.getEnergyConsumed();
        emailService.sendEmail(alertingEvent.getEmail(),
                subject,
                message,
                alertingEvent.getUserId());
    }

    public List<Alert> getAlertsForUser(Long userId) {
        return alertRepository.findByUserId(userId);
    }
}
