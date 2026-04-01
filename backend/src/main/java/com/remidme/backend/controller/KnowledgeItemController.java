package com.remidme.backend.controller;

import com.remidme.backend.dto.KnowledgeItemSummary;
import com.remidme.backend.dto.SaveKnowledgeItemRequest;
import com.remidme.backend.entity.KnowledgeItem;
import com.remidme.backend.service.KnowledgeItemService;
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
@RequestMapping("/api/items")
public class KnowledgeItemController {

    private final KnowledgeItemService knowledgeItemService;

    public KnowledgeItemController(KnowledgeItemService knowledgeItemService) {
        this.knowledgeItemService = knowledgeItemService;
    }

    @GetMapping
    public List<KnowledgeItemSummary> getItems() {
        return knowledgeItemService.getAllItemSummaries();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KnowledgeItem createItem(@Valid @RequestBody SaveKnowledgeItemRequest request) {
        return knowledgeItemService.createItem(request);
    }

    @PutMapping("/{id}")
    public KnowledgeItem updateItem(@PathVariable Long id, @Valid @RequestBody SaveKnowledgeItemRequest request) {
        KnowledgeItem item = knowledgeItemService.updateItem(id, request);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "knowledge item not found");
        }
        return item;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteItem(@PathVariable Long id) {
        boolean deleted = knowledgeItemService.deleteItem(id);
        if (!deleted) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "knowledge item not found");
        }
        return Map.of("success", true, "itemId", id);
    }
}
