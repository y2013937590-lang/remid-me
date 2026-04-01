package com.remidme.backend.service;

import com.remidme.backend.dto.KnowledgeItemSummary;
import com.remidme.backend.dto.SaveKnowledgeItemRequest;
import com.remidme.backend.entity.KnowledgeItem;
import com.remidme.backend.entity.ReviewPlan;
import com.remidme.backend.mapper.KnowledgeItemMapper;
import com.remidme.backend.mapper.ReviewPlanMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class KnowledgeItemService {

    private static final int[] REVIEW_OFFSETS = {0, 1, 2, 4, 7, 15, 21};

    private final KnowledgeItemMapper knowledgeItemMapper;
    private final ReviewPlanMapper reviewPlanMapper;

    public KnowledgeItemService(KnowledgeItemMapper knowledgeItemMapper, ReviewPlanMapper reviewPlanMapper) {
        this.knowledgeItemMapper = knowledgeItemMapper;
        this.reviewPlanMapper = reviewPlanMapper;
    }

    @Transactional
    public KnowledgeItem createItem(SaveKnowledgeItemRequest request) {
        KnowledgeItem item = new KnowledgeItem();
        item.setTitle(request.getTitle());
        item.setContent(request.getContent());
        knowledgeItemMapper.insert(item);

        List<ReviewPlan> plans = buildReviewPlans(item.getId(), LocalDate.now());
        reviewPlanMapper.batchInsert(plans);

        return knowledgeItemMapper.findById(item.getId());
    }

    public List<KnowledgeItemSummary> getAllItemSummaries() {
        return knowledgeItemMapper.findAllSummaries();
    }

    @Transactional
    public KnowledgeItem updateItem(Long id, SaveKnowledgeItemRequest request) {
        KnowledgeItem existingItem = knowledgeItemMapper.findById(id);
        if (existingItem == null) {
            return null;
        }

        existingItem.setTitle(request.getTitle());
        existingItem.setContent(request.getContent());
        knowledgeItemMapper.updateById(existingItem);
        return knowledgeItemMapper.findById(id);
    }

    @Transactional
    public boolean deleteItem(Long id) {
        KnowledgeItem existingItem = knowledgeItemMapper.findById(id);
        if (existingItem == null) {
            return false;
        }

        reviewPlanMapper.deleteByItemId(id);
        return knowledgeItemMapper.deleteById(id) > 0;
    }

    private List<ReviewPlan> buildReviewPlans(Long itemId, LocalDate baseDate) {
        List<ReviewPlan> plans = new ArrayList<>();
        for (int offset : REVIEW_OFFSETS) {
            ReviewPlan plan = new ReviewPlan();
            plan.setItemId(itemId);
            plan.setScheduledDate(baseDate.plusDays(offset));
            plan.setStatus("pending");
            plans.add(plan);
        }
        return plans;
    }
}
