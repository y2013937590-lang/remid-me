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
        LocalDate today = LocalDate.now();
        List<TodayReviewItem> reviewItems = reviewPlanMapper.findPendingDueUntil(today);
        for (TodayReviewItem reviewItem : reviewItems) {
            reviewItem.setOverdue(reviewItem.getScheduledDate() != null && reviewItem.getScheduledDate().isBefore(today));
        }
        return reviewItems;
    }

    public boolean completeReview(Long reviewId, String studyNote) {
        return reviewPlanMapper.markCompleted(reviewId, normalizeStudyNote(studyNote)) > 0;
    }

    private String normalizeStudyNote(String studyNote) {
        if (studyNote == null) {
            return null;
        }

        String trimmed = studyNote.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
