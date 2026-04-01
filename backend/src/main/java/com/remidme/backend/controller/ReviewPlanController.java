package com.remidme.backend.controller;

import com.remidme.backend.dto.CompleteReviewRequest;
import com.remidme.backend.dto.TodayReviewItem;
import com.remidme.backend.dto.UpcomingReviewItem;
import com.remidme.backend.service.ReviewPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewPlanController {

    private final ReviewPlanService reviewPlanService;

    public ReviewPlanController(ReviewPlanService reviewPlanService) {
        this.reviewPlanService = reviewPlanService;
    }

    @GetMapping("/today")
    public List<TodayReviewItem> getTodayReviews() {
        return reviewPlanService.getTodayPendingReviews();
    }

    @GetMapping("/upcoming")
    public List<UpcomingReviewItem> getUpcomingReviews() {
        return reviewPlanService.getUpcomingPendingReviews();
    }

    @PutMapping("/{id}/complete")
    public Map<String, Object> completeReview(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CompleteReviewRequest request
    ) {
        boolean updated = reviewPlanService.completeReview(id, request == null ? null : request.getStudyNote());
        if (!updated) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "review plan not found or already completed");
        }
        return Map.of("success", true, "reviewId", id);
    }
}
