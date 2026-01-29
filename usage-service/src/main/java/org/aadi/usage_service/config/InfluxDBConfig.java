package org.aadi.usage_service.config;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InfluxDBConfig {

    @Value("${influx.url}")
    private String influxUrl;

    @Value("${influx.token}")
    private String influxToken;

    @Value("${influx.org}")
    private String influxOrg;

    @Bean
    @SuppressWarnings("null")
    public InfluxDBClient influxDBClient() {
        if (influxUrl == null || influxToken == null || influxOrg == null) {
            throw new IllegalStateException("InfluxDB configuration properties are not properly set");
        }
        return InfluxDBClientFactory.create(influxUrl, influxToken.toCharArray(), influxOrg);
    }
}
