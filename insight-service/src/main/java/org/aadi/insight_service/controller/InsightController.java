package org.aadi.insight_service.controller;

import org.aadi.insight_service.dto.InsightDto;
import org.aadi.insight_service.service.InsightService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/insight")
@CrossOrigin(origins = {"http://localhost:5173"})
public class InsightController {

    private final InsightService insightService;

    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping("/saving-tips/{userId}")
    public ResponseEntity<InsightDto> getSavingTips(@PathVariable Long userId) {
        final InsightDto insight = insightService.getSavingsTips(userId);
        return ResponseEntity.ok(insight);
    }

    @GetMapping("/overview/{userId}")
    public ResponseEntity<InsightDto> getOverview(@PathVariable Long userId) {
        final InsightDto insight = insightService.getOverview(userId);
        return ResponseEntity.ok(insight);
    }

    @GetMapping(value = "/saving-tips/{userId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getSavingTipsStream(@PathVariable Long userId) {
        return insightService.getSavingsTipsStream(userId);
    }

    @GetMapping(value = "/overview/{userId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getOverviewStream(@PathVariable Long userId) {
        return insightService.getOverviewStream(userId);
    }
}
