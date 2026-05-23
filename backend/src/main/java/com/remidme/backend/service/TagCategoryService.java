package com.remidme.backend.service;

import com.remidme.backend.dto.ReorderTagCategoryRequest;
import com.remidme.backend.dto.SaveTagCategoryRequest;
import com.remidme.backend.dto.TagCategorySummary;
import com.remidme.backend.entity.TagCategory;
import com.remidme.backend.mapper.TagCategoryMapper;
import com.remidme.backend.mapper.TagMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TagCategoryService {

    private final TagCategoryMapper tagCategoryMapper;
    private final TagMapper tagMapper;

    public TagCategoryService(TagCategoryMapper tagCategoryMapper, TagMapper tagMapper) {
        this.tagCategoryMapper = tagCategoryMapper;
        this.tagMapper = tagMapper;
    }

    public List<TagCategorySummary> getCategories() {
        return tagCategoryMapper.findAllSummaries();
    }

    @Transactional
    public TagCategory createCategory(SaveTagCategoryRequest request) {
        String normalizedName = normalizeName(request.getName());
        TagCategory existingCategory = tagCategoryMapper.findByName(normalizedName);
        if (existingCategory != null) {
            return existingCategory;
        }

        TagCategory category = new TagCategory();
        category.setName(normalizedName);
        category.setSortOrder(tagCategoryMapper.findMaxSortOrder() + 1);
        tagCategoryMapper.insert(category);
        if (request.getSortOrder() != null) {
          reorderCategory(category.getId(), buildReorderRequest(request.getSortOrder()));
        }
        return tagCategoryMapper.findById(category.getId());
    }

    @Transactional
    public TagCategory updateCategory(Long id, SaveTagCategoryRequest request) {
        TagCategory existingCategory = tagCategoryMapper.findById(id);
        if (existingCategory == null) {
            return null;
        }

        String normalizedName = normalizeName(request.getName());
        TagCategory duplicateCategory = tagCategoryMapper.findByName(normalizedName);
        if (duplicateCategory != null && !duplicateCategory.getId().equals(id)) {
            tagMapper.moveCategory(id, duplicateCategory.getId());
            tagCategoryMapper.deleteById(id);
            normalizeTagOrder(duplicateCategory.getId());
            normalizeCategoryOrder();
            return tagCategoryMapper.findById(duplicateCategory.getId());
        }

        existingCategory.setName(normalizedName);
        tagCategoryMapper.updateById(existingCategory);
        if (request.getSortOrder() != null) {
            reorderCategory(id, buildReorderRequest(request.getSortOrder()));
        }
        return tagCategoryMapper.findById(id);
    }

    @Transactional
    public boolean deleteCategory(Long id) {
        TagCategory existingCategory = tagCategoryMapper.findById(id);
        if (existingCategory == null) {
            return false;
        }

        tagMapper.clearCategory(id);
        boolean deleted = tagCategoryMapper.deleteById(id) > 0;
        if (deleted) {
            normalizeTagOrder(null);
            normalizeCategoryOrder();
        }
        return deleted;
    }

    @Transactional
    public TagCategory reorderCategory(Long id, ReorderTagCategoryRequest request) {
        TagCategory existingCategory = tagCategoryMapper.findById(id);
        if (existingCategory == null) {
            return null;
        }

        List<TagCategory> categories = new ArrayList<>(tagCategoryMapper.findAllOrdered());
        int currentIndex = findCategoryIndex(categories, id);
        if (currentIndex < 0) {
            return null;
        }

        TagCategory movingCategory = categories.remove(currentIndex);
        int targetIndex = request.getTargetIndex() == null ? categories.size() : request.getTargetIndex();
        int safeIndex = Math.max(0, Math.min(targetIndex, categories.size()));
        categories.add(safeIndex, movingCategory);
        writeCategoryOrder(categories);
        return tagCategoryMapper.findById(id);
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim();
    }

    private ReorderTagCategoryRequest buildReorderRequest(Integer sortOrder) {
        ReorderTagCategoryRequest request = new ReorderTagCategoryRequest();
        int targetIndex = sortOrder == null ? 0 : Math.max(sortOrder - 1, 0);
        request.setTargetIndex(targetIndex);
        return request;
    }

    private void normalizeTagOrder(Long categoryId) {
        List<com.remidme.backend.entity.Tag> tags = tagMapper.findByCategoryId(categoryId);
        for (int index = 0; index < tags.size(); index += 1) {
            tagMapper.updatePosition(tags.get(index).getId(), categoryId, index + 1);
        }
    }

    private void normalizeCategoryOrder() {
        writeCategoryOrder(new ArrayList<>(tagCategoryMapper.findAllOrdered()));
    }

    private void writeCategoryOrder(List<TagCategory> categories) {
        for (int index = 0; index < categories.size(); index += 1) {
            tagCategoryMapper.updatePosition(categories.get(index).getId(), index + 1);
        }
    }

    private int findCategoryIndex(List<TagCategory> categories, Long categoryId) {
        for (int index = 0; index < categories.size(); index += 1) {
            if (categories.get(index).getId().equals(categoryId)) {
                return index;
            }
        }
        return -1;
    }
}
