package org.aadi.user_service.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String password;
    private String address;
    @JsonProperty("alerting")
    private boolean alerting;
    @JsonProperty("energyAlertingThreshold")
    private double energyAlertingThreshold;
    @JsonProperty("emailNotifications")
    private boolean emailNotifications;
}
