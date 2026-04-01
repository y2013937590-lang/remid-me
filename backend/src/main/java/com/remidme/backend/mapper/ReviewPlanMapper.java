package com.remidme.backend.mapper;

import com.remidme.backend.dto.TodayReviewItem;
import com.remidme.backend.entity.ReviewPlan;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ReviewPlanMapper {

    @Insert({
            "<script>",
            "INSERT INTO review_plan (item_id, scheduled_date, status, completed_at)",
            "VALUES",
            "<foreach collection='plans' item='plan' separator=','>",
            "(#{plan.itemId}, #{plan.scheduledDate}, #{plan.status}, #{plan.completedAt})",
            "</foreach>",
            "</script>"
    })
    int batchInsert(@Param("plans") List<ReviewPlan> plans);

    @Select({
            "SELECT",
            "rp.id AS review_id,",
            "ki.id AS item_id,",
            "ki.title,",
            "ki.content,",
            "rp.scheduled_date,",
            "rp.status",
            "FROM review_plan rp",
            "JOIN knowledge_item ki ON rp.item_id = ki.id",
            "WHERE rp.scheduled_date <= #{date}",
            "AND rp.status = 'pending'",
            "ORDER BY rp.scheduled_date ASC, rp.id ASC"
    })
    @Results(id = "todayReviewItemResult", value = {
            @Result(property = "reviewId", column = "review_id"),
            @Result(property = "itemId", column = "item_id"),
            @Result(property = "scheduledDate", column = "scheduled_date")
    })
    List<TodayReviewItem> findPendingDueUntil(@Param("date") LocalDate date);

    @Update({
            "UPDATE review_plan",
            "SET status = 'completed',",
            "completed_at = NOW()",
            "WHERE id = #{id}",
            "AND status = 'pending'"
    })
    int markCompleted(@Param("id") Long id);

    @Delete({
            "DELETE FROM review_plan",
            "WHERE item_id = #{itemId}"
    })
    int deleteByItemId(@Param("itemId") Long itemId);
}
