package com.remidme.backend.service;

import com.remidme.backend.dto.TodayReviewItem;
import com.remidme.backend.mapper.ReviewPlanMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReviewPlanService {

    private final ReviewPlanMapper reviewPlanMapper;

    public ReviewPlanService(ReviewPlanMapper reviewPlanMapper) {
        this.reviewPlanMapper = reviewPlanMapper;
    }

    public List<TodayReviewItem> getTodayPendingReviews() {
        return reviewPlanMapper.findTodayPending(LocalDate.now());
    }

    public boolean completeReview(Long reviewId) {
        return reviewPlanMapper.markCompleted(reviewId) > 0;
    }
}
