package com.remidme.backend.service;

import com.remidme.backend.dto.SaveTagRequest;
import com.remidme.backend.dto.TagSummary;
import com.remidme.backend.entity.Tag;
import com.remidme.backend.mapper.TagMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    private final TagMapper tagMapper;

    public TagService(TagMapper tagMapper) {
        this.tagMapper = tagMapper;
    }

    public List<TagSummary> getTags() {
        return tagMapper.findAllSummaries();
    }

    @Transactional
    public Tag createTag(SaveTagRequest request) {
        String normalizedName = normalizeName(request.getName());
        Tag existingTag = tagMapper.findByName(normalizedName);
        if (existingTag != null) {
            return existingTag;
        }

        Tag tag = new Tag();
        tag.setName(normalizedName);
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
        Tag duplicateTag = tagMapper.findByName(normalizedName);
        if (duplicateTag != null && !duplicateTag.getId().equals(id)) {
            tagMapper.moveLinks(id, duplicateTag.getId());
            tagMapper.deleteLinksByTagId(id);
            tagMapper.deleteById(id);
            return duplicateTag;
        }

        existingTag.setName(normalizedName);
        tagMapper.updateById(existingTag);
        return tagMapper.findById(id);
    }

    @Transactional
    public boolean deleteTag(Long id) {
        Tag existingTag = tagMapper.findById(id);
        if (existingTag == null) {
            return false;
        }

        tagMapper.deleteLinksByTagId(id);
        return tagMapper.deleteById(id) > 0;
    }

    private String normalizeName(String name) {
        return name == null ? "" : name.trim();
    }
}
