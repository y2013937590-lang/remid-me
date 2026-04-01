package com.remidme.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SaveTagRequest {

    @NotBlank(message = "name cannot be blank")
    @Size(max = 100, message = "name length must be less than or equal to 100")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
