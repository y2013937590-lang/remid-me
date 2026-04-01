package com.remidme.backend.controller;

import com.remidme.backend.dto.SaveTagRequest;
import com.remidme.backend.dto.TagSummary;
import com.remidme.backend.entity.Tag;
import com.remidme.backend.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagSummary> getTags() {
        return tagService.getTags();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Tag createTag(@Valid @RequestBody SaveTagRequest request) {
        return tagService.createTag(request);
    }

    @PutMapping("/{id}")
    public Tag updateTag(@PathVariable Long id, @Valid @RequestBody SaveTagRequest request) {
        Tag tag = tagService.updateTag(id, request);
        if (tag == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tag not found");
        }
        return tag;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteTag(@PathVariable Long id) {
        boolean deleted = tagService.deleteTag(id);
        if (!deleted) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tag not found");
        }
        return Map.of("success", true, "tagId", id);
    }
}
