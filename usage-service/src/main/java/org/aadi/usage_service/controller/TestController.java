package org.aadi.usage_service.controller;

import lombok.extern.slf4j.Slf4j;
import org.aadi.kafka.event.AlertingEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
@Slf4j
public class TestController {

    @Autowired
    private KafkaTemplate<String, AlertingEvent> kafkaTemplate;

    @PostMapping("/send-alert")
    public ResponseEntity<String> sendTestAlert() {
        try {
            AlertingEvent alertingEvent = AlertingEvent.builder()
                    .userId(1L)
                    .message("Test alert - Energy consumption threshold exceeded")
                    .threshold(100.0)
                    .energyConsumed(50000.0)
                    .email("aadi@yopmail.com")
                    .build();
            
            kafkaTemplate.send("energy-alerts", alertingEvent);
            log.info("Test alert sent to Kafka topic 'energy-alerts'");
            return ResponseEntity.ok("Test alert sent successfully");
        } catch (Exception e) {
            log.error("Failed to send test alert", e);
            return ResponseEntity.status(500).body("Failed to send test alert: " + e.getMessage());
        }
    }
}
