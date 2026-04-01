package com.remidme.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReviewPlanDetail {

    private Long id;
    private LocalDate scheduledDate;
    private String status;
    private LocalDateTime completedAt;
    private String studyNote;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getStudyNote() {
        return studyNote;
    }

    public void setStudyNote(String studyNote) {
        this.studyNote = studyNote;
    }
}
