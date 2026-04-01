package com.remidme.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AddKnowledgeItemRequest {

    @NotBlank(message = "title cannot be blank")
    private String title;
    private String content;

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
}
