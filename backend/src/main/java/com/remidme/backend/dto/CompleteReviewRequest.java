package com.remidme.backend.dto;

import jakarta.validation.constraints.Size;

public class CompleteReviewRequest {

    @Size(max = 2000, message = "study note length must be less than or equal to 2000")
    private String studyNote;

    public String getStudyNote() {
        return studyNote;
    }

    public void setStudyNote(String studyNote) {
        this.studyNote = studyNote;
    }
}
