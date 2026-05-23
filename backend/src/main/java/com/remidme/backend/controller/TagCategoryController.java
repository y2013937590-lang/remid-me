package com.remidme.backend.controller;

import com.remidme.backend.dto.ReorderTagCategoryRequest;
import com.remidme.backend.dto.SaveTagCategoryRequest;
import com.remidme.backend.dto.TagCategorySummary;
import com.remidme.backend.entity.TagCategory;
import com.remidme.backend.service.TagCategoryService;
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
@RequestMapping("/api/tag-categories")
public class TagCategoryController {

    private final TagCategoryService tagCategoryService;

    public TagCategoryController(TagCategoryService tagCategoryService) {
        this.tagCategoryService = tagCategoryService;
    }

    @GetMapping
    public List<TagCategorySummary> getCategories() {
        return tagCategoryService.getCategories();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagCategory createCategory(@Valid @RequestBody SaveTagCategoryRequest request) {
        return tagCategoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public TagCategory updateCategory(@PathVariable Long id, @Valid @RequestBody SaveTagCategoryRequest request) {
        return doUpdateCategory(id, request);
    }

    @PostMapping("/{id}/update")
    public TagCategory updateCategoryByPost(@PathVariable Long id, @Valid @RequestBody SaveTagCategoryRequest request) {
        return doUpdateCategory(id, request);
    }

    @PutMapping("/{id}/reorder")
    public TagCategory reorderCategory(@PathVariable Long id, @RequestBody ReorderTagCategoryRequest request) {
        return doReorderCategory(id, request);
    }

    @PostMapping("/{id}/reorder")
    public TagCategory reorderCategoryByPost(@PathVariable Long id, @RequestBody ReorderTagCategoryRequest request) {
        return doReorderCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteCategory(@PathVariable Long id) {
        return doDeleteCategory(id);
    }

    @PostMapping("/{id}/delete")
    public Map<String, Object> deleteCategoryByPost(@PathVariable Long id) {
        return doDeleteCategory(id);
    }

    private TagCategory doUpdateCategory(Long id, SaveTagCategoryRequest request) {
        TagCategory category = tagCategoryService.updateCategory(id, request);
        if (category == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tag category not found");
        }
        return category;
    }

    private TagCategory doReorderCategory(Long id, ReorderTagCategoryRequest request) {
        TagCategory category = tagCategoryService.reorderCategory(id, request);
        if (category == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tag category not found");
        }
        return category;
    }

    private Map<String, Object> doDeleteCategory(Long id) {
        boolean deleted = tagCategoryService.deleteCategory(id);
        if (!deleted) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tag category not found");
        }
        return Map.of("success", true, "categoryId", id);
    }
}
