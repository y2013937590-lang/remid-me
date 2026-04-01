package com.remidme.backend.dto;

import java.util.List;

public class KnowledgeItemPageResponse {

    private List<KnowledgeItemSummary> items;
    private int page;
    private int pageSize;
    private long total;
    private int totalPages;

    public List<KnowledgeItemSummary> getItems() {
        return items;
    }

    public void setItems(List<KnowledgeItemSummary> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
