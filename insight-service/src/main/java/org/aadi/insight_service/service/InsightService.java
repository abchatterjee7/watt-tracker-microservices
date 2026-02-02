package org.aadi.insight_service.service;

import org.aadi.insight_service.client.UsageClient;
import org.aadi.insight_service.dto.DeviceDto;
import org.aadi.insight_service.dto.InsightDto;
import org.aadi.insight_service.dto.UsageDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class InsightService {

    private final UsageClient usageClient;
    private OllamaChatModel ollamaChatModel;
    private ChatClient chatClient;

    public InsightService(UsageClient usageClient,
                          OllamaChatModel ollamaChatModel,
                          ChatClient chatClient) {
        this.usageClient = usageClient;
        this.ollamaChatModel = ollamaChatModel;
        this.chatClient = chatClient;
    }

    public InsightDto getSavingsTips (Long userId) {
        double totalUsage = 0.0;
        try {
            log.info("Getting savings tips for userId {}", userId);
            
            // Fetch data from Usage Service with timeout handling
            UsageDto usageData;
            try {
                usageData = usageClient.getXDaysUsageForUser(userId, 3);
                log.info("Successfully fetched usage data for userId {}", userId);
            } catch (Exception e) {
                log.error("Failed to fetch usage data for userId {}: {}", userId, e.getMessage());
                // Return fallback response
                return InsightDto.builder()
                        .userId(userId)
                        .tips("Unable to fetch your energy usage data at the moment. Please try again later.")
                        .energyUsage(0.0)
                        .build();
            }

            totalUsage = usageData.devices() != null ? 
                usageData.devices().stream()
                    .mapToDouble(DeviceDto::energyConsumed)
                    .sum() : 0.0;

            log.info("Calling Ollama for userId {} with total usage {}", userId, totalUsage);

            String prompt = new StringBuilder()
                    .append("Energy usage: ")
                    .append(totalUsage)
                    .append(" kWh for 3 days. Give 3-5 brief energy saving tips.")
                    .toString();

            // Add timeout for Ollama call
            ChatResponse response = ollamaChatModel.call(
                    Prompt.builder()
                            .content(prompt)
                            .build());

            return InsightDto.builder()
                    .userId(userId)
                    .tips(response.getResult().getOutput().getText())
                    .energyUsage(totalUsage)
                    .build();
                    
        } catch (TransientAiException e) {
            log.error("AI model memory constraint for userId {}: {}", userId, e.getMessage());
            return InsightDto.builder()
                    .userId(userId)
                    .tips("AI model is currently experiencing memory constraints. Here are some general energy saving tips: 1) Turn off lights when not in use, 2) Unplug devices that aren't needed, 3) Use energy-efficient appliances, 4) Consider using natural light during the day.")
                    .energyUsage(totalUsage)
                    .build();
        } catch (Exception e) {
            log.error("Error generating savings tips for userId {}: {}", userId, e.getMessage(), e);
            return InsightDto.builder()
                    .userId(userId)
                    .tips("AI service is currently unavailable. Please check your energy usage manually and try again later.")
                    .energyUsage(0.0)
                    .build();
        }
    }

    public Flux<String> getSavingsTipsStream(Long userId) {
        return getUsageData(userId)
                .flatMapMany(usageData -> {
                    double totalUsage = usageData.devices() != null ? 
                        usageData.devices().stream()
                            .mapToDouble(DeviceDto::energyConsumed)
                            .sum() : 0.0;

                    log.info("Calling Ollama streaming for userId {} with total usage {}", userId, totalUsage);

                    String prompt = new StringBuilder()
                            .append("Energy usage: ")
                            .append(totalUsage)
                            .append(" kWh for 3 days. Give 3-5 brief energy saving tips.")
                            .toString();

                    try {
                        return chatClient.prompt()
                                .user(prompt)
                                .stream()
                                .content()
                                .concatWith(Flux.just("[DONE]"));
                    } catch (Exception e) {
                        return Flux.just("AI service is currently unavailable. Please check your energy usage manually and try again later.", "[DONE]");
                    }
                })
                .onErrorResume(e -> {
                    log.error("Error in streaming savings tips for userId {}: {}", userId, e.getMessage());
                    return Flux.just("Unable to fetch your energy usage data at the moment. Please try again later.", "[DONE]");
                });
    }

    public Flux<String> getOverviewStream(Long userId) {
        return getUsageData(userId)
                .flatMapMany(usageData -> {
                    double totalUsage = usageData.devices() != null ? 
                        usageData.devices().stream()
                            .mapToDouble(DeviceDto::energyConsumed)
                            .sum() : 0.0;

                    log.info("Calling Ollama streaming for userId {} with total usage {}", userId, totalUsage);

                    String prompt = new StringBuilder()
                            .append("Brief energy analysis for 3 days usage: ")
                            .append(usageData.devices())
                            .append(". Give 2-3 key insights.")
                            .toString();

                    try {
                        return chatClient.prompt()
                                .user(prompt)
                                .stream()
                                .content()
                                .concatWith(Flux.just("[DONE]"));
                    } catch (Exception e) {
                        return Flux.just("AI service is currently unavailable. Please check your energy usage manually and try again later.", "[DONE]");
                    }
                })
                .onErrorResume(e -> {
                    log.error("Error in streaming overview for userId {}: {}", userId, e.getMessage());
                    return Flux.just("Unable to fetch your energy usage data at the moment. Please try again later.", "[DONE]");
                });
    }

    private Mono<UsageDto> getUsageData(Long userId) {
        return Mono.fromCallable(() -> {
            UsageDto usageData = usageClient.getXDaysUsageForUser(userId, 3);
            log.info("Successfully fetched usage data for userId {}", userId);
            return usageData;
        })
        .onErrorMap(e -> {
            log.error("Failed to fetch usage data for userId {}: {}", userId, e.getMessage());
            return new RuntimeException("Failed to fetch usage data", e);
        });
    }

    public InsightDto getOverview (Long userId) {
        double totalUsage = 0.0;
        try {
            log.info("Getting overview for userId {}", userId);
            
            // Fetch data from Usage Service with timeout handling
            UsageDto usageData;
            try {
                usageData = usageClient.getXDaysUsageForUser(userId, 3);
                log.info("Successfully fetched usage data for userId {}", userId);
            } catch (Exception e) {
                log.error("Failed to fetch usage data for userId {}: {}", userId, e.getMessage());
                return InsightDto.builder()
                        .userId(userId)
                        .tips("Unable to fetch your energy usage data at the moment. Please try again later.")
                        .energyUsage(0.0)
                        .build();
            }

            totalUsage = usageData.devices() != null ? 
                usageData.devices().stream()
                    .mapToDouble(DeviceDto::energyConsumed)
                    .sum() : 0.0;

            log.info("Calling Ollama for userId {} with total usage {}", userId, totalUsage);

            String prompt = new StringBuilder()
                    .append("Brief energy analysis for 3 days usage: ")
                    .append(usageData.devices())
                    .append(". Give 2-3 key insights.")
                    .toString();

            // Add timeout for Ollama call
            ChatResponse response = ollamaChatModel.call(
                    Prompt.builder()
                            .content(prompt)
                            .build());

            return InsightDto.builder()
                    .userId(userId)
                    .tips(response.getResult().getOutput().getText())
                    .energyUsage(totalUsage)
                    .build();
                    
        } catch (TransientAiException e) {
            log.error("AI model memory constraint for userId {}: {}", userId, e.getMessage());
            return InsightDto.builder()
                    .userId(userId)
                    .tips("AI model is currently experiencing memory constraints. Based on your usage data, consider reviewing device consumption patterns and identifying high-energy appliances.")
                    .energyUsage(totalUsage)
                    .build();
        } catch (Exception e) {
            log.error("Error generating overview for userId {}: {}", userId, e.getMessage(), e);
            return InsightDto.builder()
                    .userId(userId)
                    .tips("AI service is currently unavailable. Please check your energy usage manually and try again later.")
                    .energyUsage(0.0)
                    .build();
        }
    }
}
