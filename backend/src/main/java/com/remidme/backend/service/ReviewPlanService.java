package com.remidme.backend.service;

import com.remidme.backend.dto.TodayReviewItem;
import com.remidme.backend.entity.ReviewPlan;
import com.remidme.backend.mapper.ReviewPlanMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReviewPlanService {

    private static final int[] REVIEW_OFFSETS = {0, 1, 2, 4, 7, 15, 21};

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

    @Transactional
    public boolean completeReview(Long reviewId, String studyNote) {
        ReviewPlan currentPlan = reviewPlanMapper.findById(reviewId);
        if (currentPlan == null || !"pending".equals(currentPlan.getStatus())) {
            return false;
        }

        String normalizedStudyNote = normalizeStudyNote(studyNote);
        boolean updated = reviewPlanMapper.markCompleted(reviewId, normalizedStudyNote) > 0;
        if (!updated) {
            return false;
        }

        LocalDate today = LocalDate.now();
        if (currentPlan.getScheduledDate() != null && currentPlan.getScheduledDate().isBefore(today)) {
            rescheduleRemainingPlans(currentPlan, today);
        }

        return true;
    }

    private String normalizeStudyNote(String studyNote) {
        if (studyNote == null) {
            return null;
        }

        String trimmed = studyNote.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void rescheduleRemainingPlans(ReviewPlan completedPlan, LocalDate completionDate) {
        List<ReviewPlan> plans = reviewPlanMapper.findByItemIdOrderBySchedule(completedPlan.getItemId());
        int currentIndex = findPlanIndex(plans, completedPlan.getId());
        if (currentIndex < 0 || currentIndex >= REVIEW_OFFSETS.length) {
            return;
        }

        for (int index = currentIndex + 1; index < plans.size() && index < REVIEW_OFFSETS.length; index++) {
            ReviewPlan nextPlan = plans.get(index);
            if (!"pending".equals(nextPlan.getStatus())) {
                continue;
            }

            int offsetDelta = REVIEW_OFFSETS[index] - REVIEW_OFFSETS[currentIndex];
            LocalDate newScheduledDate = completionDate.plusDays(offsetDelta);
            reviewPlanMapper.updateScheduledDate(nextPlan.getId(), newScheduledDate);
        }
    }

    private int findPlanIndex(List<ReviewPlan> plans, Long reviewId) {
        for (int index = 0; index < plans.size(); index++) {
            if (reviewId.equals(plans.get(index).getId())) {
                return index;
            }
        }
        return -1;
    }
}
