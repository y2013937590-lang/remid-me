package com.remidme.backend.service;

import com.remidme.backend.dto.StatsCountPoint;
import com.remidme.backend.dto.StatsDatePoint;
import com.remidme.backend.dto.StatsMonthPoint;
import com.remidme.backend.dto.StatsOverviewResponse;
import com.remidme.backend.mapper.StatsMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final StatsMapper statsMapper;

    public StatsService(StatsMapper statsMapper) {
        this.statsMapper = statsMapper;
    }

    public StatsOverviewResponse getOverview() {
        LocalDate today = LocalDate.now();

        StatsOverviewResponse response = new StatsOverviewResponse();
        long totalItems = statsMapper.countItems();
        long totalTags = statsMapper.countTags();
        long totalPlans = statsMapper.countPlans();
        long pendingPlans = statsMapper.countPendingPlans();
        long completedPlans = statsMapper.countCompletedPlans();

        response.setTotalItems(totalItems);
        response.setTotalTags(totalTags);
        response.setTotalPlans(totalPlans);
        response.setPendingPlans(pendingPlans);
        response.setCompletedPlans(completedPlans);
        response.setDueToday(statsMapper.countDueToday(today));
        response.setOverduePlans(statsMapper.countOverduePlans(today));
        response.setCompletionRate(totalPlans == 0 ? 0 : Math.round((double) completedPlans * 100 / totalPlans));
        response.setStatusBreakdown(statsMapper.getStatusBreakdown());
        response.setTopTags(statsMapper.getTopTags(8));
        response.setRecentCompletionTrend(fillDatePoints(
                statsMapper.getCompletionTrend(today.minusDays(13).atStartOfDay(), today.plusDays(1).atStartOfDay()),
                today.minusDays(13),
                today
        ));
        response.setUpcomingPlanTrend(fillDatePoints(
                statsMapper.getUpcomingPlanTrend(today, today.plusDays(13)),
                today,
                today.plusDays(13)
        ));
        response.setItemGrowthTrend(fillMonthPoints(
                statsMapper.getItemGrowthTrend(
                        YearMonth.from(today).minusMonths(5).atDay(1).atStartOfDay(),
                        YearMonth.from(today).plusMonths(1).atDay(1).atStartOfDay()
                ),
                YearMonth.from(today).minusMonths(5),
                YearMonth.from(today)
        ));
        return response;
    }

    private List<StatsDatePoint> fillDatePoints(List<StatsDatePoint> rawPoints, LocalDate startDate, LocalDate endDate) {
        Map<String, Long> valueMap = new LinkedHashMap<>();
        for (StatsDatePoint rawPoint : rawPoints) {
            valueMap.put(rawPoint.getDate(), rawPoint.getValue());
        }

        List<StatsDatePoint> result = new java.util.ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            StatsDatePoint point = new StatsDatePoint();
            point.setDate(current.format(DATE_FORMATTER));
            point.setValue(valueMap.getOrDefault(point.getDate(), 0L));
            result.add(point);
            current = current.plusDays(1);
        }
        return result;
    }

    private List<StatsMonthPoint> fillMonthPoints(List<StatsMonthPoint> rawPoints, YearMonth startMonth, YearMonth endMonth) {
        Map<String, Long> valueMap = new LinkedHashMap<>();
        for (StatsMonthPoint rawPoint : rawPoints) {
            valueMap.put(rawPoint.getMonth(), rawPoint.getValue());
        }

        List<StatsMonthPoint> result = new java.util.ArrayList<>();
        YearMonth current = startMonth;
        while (!current.isAfter(endMonth)) {
            StatsMonthPoint point = new StatsMonthPoint();
            point.setMonth(current.format(MONTH_FORMATTER));
            point.setValue(valueMap.getOrDefault(point.getMonth(), 0L));
            result.add(point);
            current = current.plusMonths(1);
        }
        return result;
    }
}
