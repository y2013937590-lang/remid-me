package com.remidme.backend.service;

import com.remidme.backend.dto.ReorderTagRequest;
import com.remidme.backend.dto.SaveTagRequest;
import com.remidme.backend.dto.TagSummary;
import com.remidme.backend.entity.Tag;
import com.remidme.backend.entity.TagCategory;
import com.remidme.backend.mapper.TagCategoryMapper;
import com.remidme.backend.mapper.TagMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;

@Service
public class TagService {

    private final TagMapper tagMapper;
    private final TagCategoryMapper tagCategoryMapper;

    public TagService(TagMapper tagMapper, TagCategoryMapper tagCategoryMapper) {
        this.tagMapper = tagMapper;
        this.tagCategoryMapper = tagCategoryMapper;
    }

    public List<TagSummary> getTags() {
        return tagMapper.findAllSummaries();
    }

    @Transactional
    public Tag createTag(SaveTagRequest request) {
        String normalizedName = normalizeName(request.getName());
        Long categoryId = normalizeCategoryId(request.getCategoryId());
        Tag existingTag = tagMapper.findByName(normalizedName);
        if (existingTag != null) {
            if (!Objects.equals(existingTag.getCategoryId(), categoryId)) {
                moveTag(existingTag, categoryId, Integer.MAX_VALUE);
            }
            return tagMapper.findById(existingTag.getId());
        }

        Tag tag = new Tag();
        tag.setName(normalizedName);
        tag.setCategoryId(categoryId);
        tag.setSortOrder(nextSortOrder(categoryId));
        tagMapper.insert(tag);
        return tagMapper.findById(tag.getId());
    }

    @Transactional
    public Tag updateTag(Long id, SaveTagRequest request) {
        Tag existingTag = tagMapper.findById(id);
        if (existingTag == null) {
            return null;
        }

        String normalizedName = normalizeName(request.getName());
        Long categoryId = normalizeCategoryId(request.getCategoryId());
        Long sourceCategoryId = existingTag.getCategoryId();
        Tag duplicateTag = tagMapper.findByName(normalizedName);
        if (duplicateTag != null && !duplicateTag.getId().equals(id)) {
            if (!Objects.equals(duplicateTag.getCategoryId(), categoryId)) {
                moveTag(duplicateTag, categoryId, Integer.MAX_VALUE);
            }
            tagMapper.moveLinks(id, duplicateTag.getId());
            tagMapper.deleteLinksByTagId(id);
            tagMapper.deleteById(id);
            normalizeTagOrder(sourceCategoryId);
            return tagMapper.findById(duplicateTag.getId());
        }

        existingTag.setName(normalizedName);
        if (!Objects.equals(sourceCategoryId, categoryId)) {
            moveTag(existingTag, categoryId, Integer.MAX_VALUE);
            existingTag = tagMapper.findById(id);
            if (existingTag == null) {
                return null;
            }
            existingTag.setName(normalizedName);
        }
        tagMapper.updateById(existingTag);
        return tagMapper.findById(id);
    }

    @Transactional
    public Tag reorderTag(Long id, ReorderTagRequest request) {
        Tag existingTag = tagMapper.findById(id);
        if (existingTag == null) {
            return null;
        }

        Long categoryId = normalizeCategoryId(request.getCategoryId());
        int targetIndex = request.getTargetIndex() == null ? Integer.MAX_VALUE : request.getTargetIndex();
        moveTag(existingTag, categoryId, targetIndex);
        return tagMapper.findById(id);
    }

    @Transactional
    public boolean deleteTag(Long id) {
        Tag existingTag = tagMapper.findById(id);
        if (existingTag == null) {
            return false;
        }

        tagMapper.deleteLinksByTagId(id);
        boolean deleted = tagMapper.deleteById(id) > 0;
        if (deleted) {
            normalizeTagOrder(existingTag.getCategoryId());
        }
        return deleted;
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim();
    }

    private Long normalizeCategoryId(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            return null;
        }

        TagCategory category = tagCategoryMapper.findById(categoryId);
        return category == null ? null : category.getId();
    }

    private int nextSortOrder(Long categoryId) {
        return tagMapper.findMaxSortOrderByCategoryId(categoryId) + 1;
    }

    private void moveTag(Tag tag, Long targetCategoryId, int targetIndex) {
        Long sourceCategoryId = tag.getCategoryId();
        List<Tag> targetTags = new ArrayList<>(tagMapper.findByCategoryId(targetCategoryId));
        if (Objects.equals(sourceCategoryId, targetCategoryId)) {
            int currentIndex = findTagIndex(targetTags, tag.getId());
            targetTags.removeIf((item) -> item.getId().equals(tag.getId()));
            int adjustedIndex = targetIndex;
            if (currentIndex >= 0 && targetIndex > currentIndex) {
                adjustedIndex -= 1;
            }
            int safeIndex = Math.max(0, Math.min(adjustedIndex, targetTags.size()));
            targetTags.add(safeIndex, tag);
            writeTagOrder(targetTags, targetCategoryId);
            return;
        }

        List<Tag> sourceTags = new ArrayList<>(tagMapper.findByCategoryId(sourceCategoryId));
        sourceTags.removeIf((item) -> item.getId().equals(tag.getId()));
        int safeIndex = Math.max(0, Math.min(targetIndex, targetTags.size()));
        tag.setCategoryId(targetCategoryId);
        targetTags.add(safeIndex, tag);
        writeTagOrder(sourceTags, sourceCategoryId);
        writeTagOrder(targetTags, targetCategoryId);
    }

    private void normalizeTagOrder(Long categoryId) {
        writeTagOrder(new ArrayList<>(tagMapper.findByCategoryId(categoryId)), categoryId);
    }

    private void writeTagOrder(List<Tag> tags, Long categoryId) {
        for (int index = 0; index < tags.size(); index += 1) {
            Tag tag = tags.get(index);
            tagMapper.updatePosition(tag.getId(), categoryId, index + 1);
        }
    }

    private int findTagIndex(List<Tag> tags, Long tagId) {
        for (int index = 0; index < tags.size(); index += 1) {
            if (tags.get(index).getId().equals(tagId)) {
                return index;
            }
        }
        return -1;
    }
}
