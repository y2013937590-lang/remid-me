package com.remidme.backend.service;

import com.remidme.backend.dto.KnowledgeItemPageResponse;
import com.remidme.backend.dto.KnowledgeItemSummary;
import com.remidme.backend.dto.ItemTagLink;
import com.remidme.backend.dto.ReviewPlanDetail;
import com.remidme.backend.dto.SaveKnowledgeItemRequest;
import com.remidme.backend.entity.KnowledgeItem;
import com.remidme.backend.entity.ReviewPlan;
import com.remidme.backend.entity.Tag;
import com.remidme.backend.mapper.KnowledgeItemMapper;
import com.remidme.backend.mapper.ReviewPlanMapper;
import com.remidme.backend.mapper.TagMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class KnowledgeItemService {

    private static final int[] REVIEW_OFFSETS = {0, 1, 2, 4, 7, 15, 21};

    private final KnowledgeItemMapper knowledgeItemMapper;
    private final ReviewPlanMapper reviewPlanMapper;
    private final TagMapper tagMapper;

    public KnowledgeItemService(KnowledgeItemMapper knowledgeItemMapper, ReviewPlanMapper reviewPlanMapper, TagMapper tagMapper) {
        this.knowledgeItemMapper = knowledgeItemMapper;
        this.reviewPlanMapper = reviewPlanMapper;
        this.tagMapper = tagMapper;
    }

    @Transactional
    public KnowledgeItem createItem(SaveKnowledgeItemRequest request) {
        KnowledgeItem item = new KnowledgeItem();
        item.setTitle(request.getTitle());
        item.setContent(request.getContent());
        knowledgeItemMapper.insert(item);
        syncItemTags(item.getId(), normalizeTagIds(request.getTagIds()));

        List<ReviewPlan> plans = buildReviewPlans(item.getId(), LocalDate.now());
        reviewPlanMapper.batchInsert(plans);

        return getItem(item.getId());
    }

    public KnowledgeItemPageResponse getItemSummaries(String keyword, int page, int pageSize) {
        String normalizedKeyword = normalizeKeyword(keyword);
        int safePageSize = Math.max(pageSize, 1);
        long total = knowledgeItemMapper.countSummaries(normalizedKeyword);
        int totalPages = total == 0 ? 1 : (int) Math.ceil((double) total / safePageSize);
        int safePage = Math.min(Math.max(page, 1), totalPages);
        int offset = (safePage - 1) * safePageSize;

        KnowledgeItemPageResponse response = new KnowledgeItemPageResponse();
        response.setItems(knowledgeItemMapper.findPagedSummaries(normalizedKeyword, safePageSize, offset));
        response.setPage(safePage);
        response.setPageSize(safePageSize);
        response.setTotal(total);
        response.setTotalPages(totalPages);
        return response;
    }

    public KnowledgeItem getItem(Long id) {
        KnowledgeItem item = knowledgeItemMapper.findById(id);
        if (item == null) {
            return null;
        }
        item.setTagIds(tagMapper.findTagIdsByItemId(id));
        return item;
    }

    public List<ReviewPlanDetail> getItemReviewDetails(Long id) {
        return reviewPlanMapper.findDetailsByItemId(id);
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
        syncItemTags(id, normalizeTagIds(request.getTagIds()));
        return getItem(id);
    }

    @Transactional
    public boolean deleteItem(Long id) {
        KnowledgeItem existingItem = knowledgeItemMapper.findById(id);
        if (existingItem == null) {
            return false;
        }

        reviewPlanMapper.deleteByItemId(id);
        tagMapper.deleteLinksByItemId(id);
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

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }

        String trimmed = keyword.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<Long> normalizeTagIds(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return List.of();
        }

        Set<Long> uniqueIds = new LinkedHashSet<>();
        for (Long tagId : tagIds) {
            if (tagId != null && tagId > 0) {
                uniqueIds.add(tagId);
            }
        }
        if (uniqueIds.isEmpty()) {
            return List.of();
        }

        List<Tag> existingTags = tagMapper.findByIds(new ArrayList<>(uniqueIds));
        Set<Long> existingIds = existingTags.stream().map(Tag::getId).collect(Collectors.toSet());
        return uniqueIds.stream().filter(existingIds::contains).toList();
    }

    private void syncItemTags(Long itemId, List<Long> tagIds) {
        tagMapper.deleteLinksByItemId(itemId);
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }

        List<ItemTagLink> links = new ArrayList<>();
        for (Long tagId : tagIds) {
            ItemTagLink link = new ItemTagLink();
            link.setItemId(itemId);
            link.setTagId(tagId);
            links.add(link);
        }
        tagMapper.batchInsertLinks(links);
    }
}
