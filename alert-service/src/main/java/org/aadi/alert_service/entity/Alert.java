package org.aadi.alert_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "alert")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private LocalDateTime createdAt;
    private boolean sent;
    private String type;
    private String severity;
    private String message;
    private Double value;
    private Double threshold;
    private Double expectedValue;
    private Double averageValue;
    private String device;
    private LocalDateTime timestamp;
    private boolean acknowledged;
    private String email;
}
