package com.remidme.backend.controller;

import com.remidme.backend.dto.AddKnowledgeItemRequest;
import com.remidme.backend.entity.KnowledgeItem;
import com.remidme.backend.service.KnowledgeItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
public class KnowledgeItemController {

    private final KnowledgeItemService knowledgeItemService;

    public KnowledgeItemController(KnowledgeItemService knowledgeItemService) {
        this.knowledgeItemService = knowledgeItemService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KnowledgeItem createItem(@Valid @RequestBody AddKnowledgeItemRequest request) {
        return knowledgeItemService.createItem(request);
    }
}
