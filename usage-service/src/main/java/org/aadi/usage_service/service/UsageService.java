package org.aadi.usage_service.service;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import org.aadi.kafka.event.AlertingEvent;
import org.aadi.kafka.event.EnergyUsageEvent;
import org.aadi.usage_service.client.DeviceClient;
import org.aadi.usage_service.client.UserClient;
import org.aadi.usage_service.dto.DeviceDto;
import org.aadi.usage_service.dto.UsageDto;
import org.aadi.usage_service.dto.UserDto;
import org.aadi.usage_service.model.Device;
import org.aadi.usage_service.model.DeviceEnergy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import javax.annotation.Nullable;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UsageService {

    private InfluxDBClient influxDBClient;
    private DeviceClient deviceClient;
    private UserClient userClient;

    @Value("${influx.bucket}")
    @Nullable
    private String influxBucket;

    @Value("${influx.org}")
    @Nullable
    private String influxOrg;

    private final KafkaTemplate<String, AlertingEvent> kafkaTemplate;

    public UsageService(InfluxDBClient influxDBClient,
                        DeviceClient deviceClient,
                        UserClient userClient,
                        KafkaTemplate<String, AlertingEvent> kafkaTemplate) {
        this.influxDBClient = influxDBClient;
        this.deviceClient = deviceClient;
        this.userClient = userClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "energy-usage", groupId = "usage-service")
    public void energyUsageEvent(EnergyUsageEvent energyUsageEvent, Acknowledgment acknowledgment) {
        try {
            log.info("Received energy usage event: {}", energyUsageEvent);
            
            // Check InfluxDB connection health
            if (!isInfluxDBHealthy()) {
                log.error("InfluxDB is not healthy - skipping message processing");
                acknowledgment.acknowledge();
                return;
            }
            
            if (influxBucket == null || influxOrg == null) {
                log.error("InfluxDB configuration is missing - bucket or org is null");
                acknowledgment.acknowledge();
                return;
            }
            
            Point point = Point.measurement("energy_usage")
                    .addTag("deviceId", String.valueOf(energyUsageEvent.deviceId()))
                    .addField("energyConsumed", energyUsageEvent.energyConsumed())
                    .time(energyUsageEvent.timestamp(), WritePrecision.MS);
            influxDBClient.getWriteApiBlocking().writePoint(
                    Objects.requireNonNull(influxBucket, "influxBucket cannot be null"),
                    Objects.requireNonNull(influxOrg, "influxOrg cannot be null"),
                    point);
            log.debug("Successfully wrote energy usage for device {}", energyUsageEvent.deviceId());
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process energy usage event for device {}: {}", 
                    energyUsageEvent.deviceId(), e.getMessage());
            // Acknowledge to prevent infinite retries
            acknowledgment.acknowledge();
        }
    }

    private boolean isInfluxDBHealthy() {
        try {
            influxDBClient.ping();
            return true;
        } catch (Exception e) {
            log.warn("InfluxDB health check failed: {}", e.getMessage());
            return false;
        }
    }

    @Scheduled(cron = "*/10 * * * * *")
    public void aggregateDeviceEnergyUsage() {
        log.info("Starting aggregateDeviceEnergyUsage...");
        final Instant now = Instant.now();
        final Instant oneDayAgo = now.minusSeconds(86400); // Look back 24 hours for testing

        if (influxBucket == null || influxOrg == null) {
            log.error("InfluxDB configuration is missing - cannot aggregate device energy usage");
            return;
        }
        
        log.info("Querying InfluxDB from {} to {}", oneDayAgo, now);
        String fluxQuery = String.format("""
        from(bucket: "%s")
          |> range(start: time(v: "%s"), stop: time(v: "%s"))
          |> filter(fn: (r) => r["_measurement"] == "energy_usage")
          |> filter(fn: (r) => r["_field"] == "energyConsumed")
          |> filter(fn: (r) => exists(r["deviceId"]))
          |> group(columns: ["deviceId"])
          |> sum(column: "_value")
        """, influxBucket, oneDayAgo.toString(), now.toString());

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(
                Objects.requireNonNull(fluxQuery, "fluxQuery cannot be null"),
                Objects.requireNonNull(influxOrg, "influxOrg cannot be null"));

        log.info("InfluxDB query executed, found {} tables", tables.size());
        List<DeviceEnergy> deviceEnergies = new ArrayList<>();

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                Object deviceIdObj = record.getValueByKey("deviceId");
                Object energyValue = record.getValue();
                if (deviceIdObj == null || energyValue == null || deviceIdObj.toString().isEmpty()) {
                    log.warn("Skipping record with null/empty deviceId or energy value: {}", record);
                    continue;
                }
                log.info("Found record: deviceId={}, energy={}", 
                    deviceIdObj, energyValue);
                deviceEnergies.add(
                        DeviceEnergy.builder()
                                .deviceId(Long.valueOf(deviceIdObj.toString()))
                                .energyConsumed(Double.valueOf(energyValue.toString()))
                                .build()
                );
            }
        }
        log.info("Aggregated device energies over the past hour: {}", deviceEnergies);

        for (DeviceEnergy deviceEnergy : deviceEnergies) {
            try {
                final DeviceDto deviceResponse = deviceClient.getDeviceById(deviceEnergy.getDeviceId());

                if (deviceResponse == null || deviceResponse.id() == null) {
                    log.warn("Device not found for ID: {}", deviceEnergy.getDeviceId());
                    continue;
                }
                deviceEnergy.setUserId(deviceResponse.userId());
            } catch (Exception e) {
                log.warn("Failed to fetch device for ID: {}", deviceEnergy.getDeviceId());
            }
        }

        // remove devices with null userId
        deviceEnergies.removeIf(de -> de.getUserId() == null);

        // Get user-device mapping and aggregate per user
        Map<Long, List<DeviceEnergy>> userDeviceEnergyMap =
                deviceEnergies.stream()
                        .collect(Collectors.groupingBy(DeviceEnergy::getUserId));

        log.info("User-Device Energy Map: {}", userDeviceEnergyMap);

        // get users energy consumption thresholds
        List<Long> userIds = new ArrayList<>(userDeviceEnergyMap.keySet());
        final Map<Long, Double> userThresholdMap = new HashMap<>();
        final Map<Long, String> userEmailMap = new HashMap<>();

        for (final Long userId : userIds) {
            try {
                UserDto user = userClient.getUserById(userId);
                if (user == null || user.id() == null || !user.alerting()) {
                    log.warn("User not found or alerting disabled for ID: {}", userId);
                    continue;
                }
                userThresholdMap.put(userId, user.energyAlertingThreshold());
                userEmailMap.put(userId, user.email());
            } catch (Exception e) {
                log.warn("Failed to fetch user for ID: {}", userId);
            }
        }
        log.info("User Threshold Map: {}", userThresholdMap);


        // Check thresholds against aggregated usage
        final List<Long> alertedUsers = new ArrayList<>(userThresholdMap.keySet());
        for (final Long userId : alertedUsers) {
            final Double threshold = userThresholdMap.get(userId);
            final List<DeviceEnergy> devices = userDeviceEnergyMap.get(userId);

            final Double totalConsumption = devices.stream()
                    .mapToDouble(DeviceEnergy::getEnergyConsumed)
                    .sum();

           if (totalConsumption > threshold) {
               log.info("ALERT: User ID {} has exceeded the energy threshold! " +
                       "Total Consumption: {}, Threshold: {}",
                       userId, totalConsumption, threshold);
               // Put message on kafak alert-topic
               final AlertingEvent alertingEvent = AlertingEvent.builder()
                       .userId(userId)
                       .message("Energy consumption threshold exceeded")
                       .threshold(threshold)
                       .energyConsumed(totalConsumption)
                       .email(userEmailMap.get(userId))
                       .build();
               kafkaTemplate.send("energy-alerts", alertingEvent);
           } else {
                log.info("User ID {} is within the energy threshold. " +
                          "Total Consumption: {}, Threshold: {}",
                          userId, totalConsumption, threshold);
           }
        }
    }


    public UsageDto getXDaysUsageForUser(Long userId, int days) {
        log.info("Getting usage for userId {} over past {} days", userId, days);
        final List<DeviceDto> devicesDto = deviceClient.getAllDevicesForUser(userId);

        final List<Device> devices = new ArrayList<>();
        for (DeviceDto deviceDto : devicesDto) {
            devices.add(Device.builder()
                    .id(deviceDto.id())
                    .name(deviceDto.name())
                    .type(deviceDto.type())
                    .location(deviceDto.location())
                    .userId(deviceDto.userId())
                    .build());
        }

        if (devices == null || devices.isEmpty()) {
            return UsageDto.builder()
                    .userId(userId)
                    .devices(null)
                    .build();
        }

        // build a set of device ids to filter on Flux query
        List<String> deviceIdStrings = devices.stream()
                .map(Device::getId)
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .toList();

        final Instant now = Instant.now();
        final Instant start  = now.minusSeconds((long) days * 24 * 3600);

        // build device filter "r[\"deviceId\"] == \"1\" or r[\"deviceId\"] == \"2\""
        final String deviceFilter = deviceIdStrings.stream()
                .map(idStr -> String.format("r[\"deviceId\"] == \"%s\"", idStr))
                .collect(Collectors.joining(" or "));

        if (influxBucket == null || influxOrg == null) {
            log.error("InfluxDB configuration is missing - cannot get usage for user {}", userId);
            return UsageDto.builder()
                    .userId(userId)
                    .devices(null)
                    .build();
        }
        
        String fluxQuery = String.format("""
        from(bucket: "%s")
          |> range(start: time(v: "%s"), stop: time(v: "%s"))
          |> filter(fn: (r) => r["_measurement"] == "energy_usage")
          |> filter(fn: (r) => r["_field"] == "energyConsumed")
          |> filter(fn: (r) => exists(r["deviceId"]))
          |> filter(fn: (r) => %s)
          |> group(columns: ["deviceId"])
          |> sum(column: "_value")
        """, influxBucket, start.toString(), now.toString(), deviceFilter);

        final Map<Long, Double> aggregatedMap = new HashMap<>();

        try {
            QueryApi queryApi = influxDBClient.getQueryApi();
            List<FluxTable> tables = queryApi.query(fluxQuery,
                    Objects.requireNonNull(influxOrg, "influxOrg cannot be null"));

            for (FluxTable table : tables) {
                for (FluxRecord record : table.getRecords()) {
                    Object deviceIdObj = record.getValueByKey("deviceId");
                    String deviceIdStr = deviceIdObj == null ? null : deviceIdObj.toString();
                    if (deviceIdStr == null) continue;

                    Object valueObj = record.getValueByKey("_value");
                    Double energyConsumed = (valueObj instanceof Number)
                            ? ((Number) valueObj).doubleValue()
                            : 0.0;

                    try {
                        Long deviceId = Long.valueOf(deviceIdStr);
                        aggregatedMap.put(deviceId, aggregatedMap.getOrDefault(deviceId, 0.0) + energyConsumed);
                    } catch (NumberFormatException nfe) {
                        log.warn("Failed to parse deviceId from flux record: {}", deviceIdStr);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to query InfluxDB for user {} usage over {} days: {}", userId, days, e.getMessage());
            // set aggregatedConsumption to 0.0 on error
            devices.forEach(d -> d.setEnergyConsumed(0.0));
            return UsageDto.builder()
                    .userId(userId)
                    .devices(null)
                    .build();
        }

        // populate aggregated energy consumed per device
        for (Device device : devices) {
            if (device == null || device.getId() == null) continue;
            device.setEnergyConsumed(aggregatedMap.getOrDefault(device.getId(), 0.0));
        }

        log.info("Aggregated energy consumption for userId {}: {}", userId, aggregatedMap);

        final List<DeviceDto> resultDevices = devices.stream()
                .map(d -> DeviceDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .type(d.getType())
                        .location(d.getLocation())
                        .userId(d.getUserId())
                        .energyConsumed(d.getEnergyConsumed())
                        .build())
                .toList();

        return UsageDto.builder()
                .userId(userId)
                .devices(resultDevices)
                .build();

    }
}
