package com.remidme.backend.mapper;

import com.remidme.backend.dto.StatsCountPoint;
import com.remidme.backend.dto.StatsDatePoint;
import com.remidme.backend.dto.StatsMonthPoint;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface StatsMapper {

    @Select({
            "SELECT COUNT(*)",
            "FROM knowledge_item"
    })
    long countItems();

    @Select({
            "SELECT COUNT(*)",
            "FROM tag"
    })
    long countTags();

    @Select({
            "SELECT COUNT(*)",
            "FROM review_plan"
    })
    long countPlans();

    @Select({
            "SELECT COUNT(*)",
            "FROM review_plan",
            "WHERE status = 'pending'"
    })
    long countPendingPlans();

    @Select({
            "SELECT COUNT(*)",
            "FROM review_plan",
            "WHERE status = 'completed'"
    })
    long countCompletedPlans();

    @Select({
            "SELECT COUNT(*)",
            "FROM review_plan",
            "WHERE status = 'pending'",
            "AND scheduled_date = #{date}"
    })
    long countDueToday(@Param("date") LocalDate date);

    @Select({
            "SELECT COUNT(*)",
            "FROM review_plan",
            "WHERE status = 'pending'",
            "AND scheduled_date < #{date}"
    })
    long countOverduePlans(@Param("date") LocalDate date);

    @Select({
            "SELECT '待处理' AS label, COUNT(*) AS value",
            "FROM review_plan",
            "WHERE status = 'pending'",
            "UNION ALL",
            "SELECT '已完成' AS label, COUNT(*) AS value",
            "FROM review_plan",
            "WHERE status = 'completed'"
    })
    List<StatsCountPoint> getStatusBreakdown();

    @Select({
            "SELECT",
            "t.name AS label,",
            "COUNT(DISTINCT kit.item_id) AS value",
            "FROM tag t",
            "LEFT JOIN knowledge_item_tag kit ON kit.tag_id = t.id",
            "GROUP BY t.id, t.name",
            "ORDER BY value DESC, t.name ASC",
            "LIMIT #{limit}"
    })
    List<StatsCountPoint> getTopTags(@Param("limit") int limit);

    @Select({
            "SELECT",
            "DATE_FORMAT(completed_at, '%Y-%m-%d') AS date,",
            "COUNT(*) AS value",
            "FROM review_plan",
            "WHERE status = 'completed'",
            "AND completed_at >= #{startInclusive}",
            "AND completed_at < #{endExclusive}",
            "GROUP BY DATE_FORMAT(completed_at, '%Y-%m-%d')",
            "ORDER BY date ASC"
    })
    List<StatsDatePoint> getCompletionTrend(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );

    @Select({
            "SELECT",
            "DATE_FORMAT(scheduled_date, '%Y-%m-%d') AS date,",
            "COUNT(*) AS value",
            "FROM review_plan",
            "WHERE status = 'pending'",
            "AND scheduled_date >= #{startInclusive}",
            "AND scheduled_date <= #{endInclusive}",
            "GROUP BY DATE_FORMAT(scheduled_date, '%Y-%m-%d')",
            "ORDER BY date ASC"
    })
    List<StatsDatePoint> getUpcomingPlanTrend(
            @Param("startInclusive") LocalDate startInclusive,
            @Param("endInclusive") LocalDate endInclusive
    );

    @Select({
            "SELECT",
            "DATE_FORMAT(created_at, '%Y-%m') AS month,",
            "COUNT(*) AS value",
            "FROM knowledge_item",
            "WHERE created_at >= #{startInclusive}",
            "AND created_at < #{endExclusive}",
            "GROUP BY DATE_FORMAT(created_at, '%Y-%m')",
            "ORDER BY month ASC"
    })
    List<StatsMonthPoint> getItemGrowthTrend(
            @Param("startInclusive") LocalDateTime startInclusive,
            @Param("endExclusive") LocalDateTime endExclusive
    );
}
