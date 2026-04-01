package com.remidme.backend.dto;

import java.util.List;

public class StatsOverviewResponse {

    private long totalItems;
    private long totalTags;
    private long totalPlans;
    private long pendingPlans;
    private long completedPlans;
    private long dueToday;
    private long overduePlans;
    private long completionRate;
    private List<StatsCountPoint> statusBreakdown;
    private List<StatsCountPoint> topTags;
    private List<StatsDatePoint> recentCompletionTrend;
    private List<StatsDatePoint> upcomingPlanTrend;
    private List<StatsMonthPoint> itemGrowthTrend;

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public long getTotalTags() {
        return totalTags;
    }

    public void setTotalTags(long totalTags) {
        this.totalTags = totalTags;
    }

    public long getTotalPlans() {
        return totalPlans;
    }

    public void setTotalPlans(long totalPlans) {
        this.totalPlans = totalPlans;
    }

    public long getPendingPlans() {
        return pendingPlans;
    }

    public void setPendingPlans(long pendingPlans) {
        this.pendingPlans = pendingPlans;
    }

    public long getCompletedPlans() {
        return completedPlans;
    }

    public void setCompletedPlans(long completedPlans) {
        this.completedPlans = completedPlans;
    }

    public long getDueToday() {
        return dueToday;
    }

    public void setDueToday(long dueToday) {
        this.dueToday = dueToday;
    }

    public long getOverduePlans() {
        return overduePlans;
    }

    public void setOverduePlans(long overduePlans) {
        this.overduePlans = overduePlans;
    }

    public long getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(long completionRate) {
        this.completionRate = completionRate;
    }

    public List<StatsCountPoint> getStatusBreakdown() {
        return statusBreakdown;
    }

    public void setStatusBreakdown(List<StatsCountPoint> statusBreakdown) {
        this.statusBreakdown = statusBreakdown;
    }

    public List<StatsCountPoint> getTopTags() {
        return topTags;
    }

    public void setTopTags(List<StatsCountPoint> topTags) {
        this.topTags = topTags;
    }

    public List<StatsDatePoint> getRecentCompletionTrend() {
        return recentCompletionTrend;
    }

    public void setRecentCompletionTrend(List<StatsDatePoint> recentCompletionTrend) {
        this.recentCompletionTrend = recentCompletionTrend;
    }

    public List<StatsDatePoint> getUpcomingPlanTrend() {
        return upcomingPlanTrend;
    }

    public void setUpcomingPlanTrend(List<StatsDatePoint> upcomingPlanTrend) {
        this.upcomingPlanTrend = upcomingPlanTrend;
    }

    public List<StatsMonthPoint> getItemGrowthTrend() {
        return itemGrowthTrend;
    }

    public void setItemGrowthTrend(List<StatsMonthPoint> itemGrowthTrend) {
        this.itemGrowthTrend = itemGrowthTrend;
    }
}
