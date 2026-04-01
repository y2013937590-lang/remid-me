package com.remidme.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class KnowledgeItemSummary {

    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private Long totalPlans;
    private Long completedPlans;
    private Long pendingPlans;
    private LocalDate nextReviewDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getTotalPlans() {
        return totalPlans;
    }

    public void setTotalPlans(Long totalPlans) {
        this.totalPlans = totalPlans;
    }

    public Long getCompletedPlans() {
        return completedPlans;
    }

    public void setCompletedPlans(Long completedPlans) {
        this.completedPlans = completedPlans;
    }

    public Long getPendingPlans() {
        return pendingPlans;
    }

    public void setPendingPlans(Long pendingPlans) {
        this.pendingPlans = pendingPlans;
    }

    public LocalDate getNextReviewDate() {
        return nextReviewDate;
    }

    public void setNextReviewDate(LocalDate nextReviewDate) {
        this.nextReviewDate = nextReviewDate;
    }
}
