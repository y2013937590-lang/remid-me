package com.remidme.backend.mapper;

import com.remidme.backend.dto.ReviewPlanDetail;
import com.remidme.backend.dto.TodayReviewItem;
import com.remidme.backend.dto.UpcomingReviewItem;
import com.remidme.backend.entity.ReviewPlan;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.ResultMap;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ReviewPlanMapper {

    @Insert({
            "<script>",
            "INSERT INTO review_plan (item_id, scheduled_date, status, completed_at, study_note)",
            "VALUES",
            "<foreach collection='plans' item='plan' separator=','>",
            "(#{plan.itemId}, #{plan.scheduledDate}, #{plan.status}, #{plan.completedAt}, #{plan.studyNote})",
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
            "GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS tags,",
            "rp.scheduled_date,",
            "rp.status",
            "FROM review_plan rp",
            "JOIN knowledge_item ki ON rp.item_id = ki.id",
            "LEFT JOIN knowledge_item_tag kit ON kit.item_id = ki.id",
            "LEFT JOIN tag t ON t.id = kit.tag_id",
            "WHERE rp.scheduled_date <= #{date}",
            "AND rp.status = 'pending'",
            "GROUP BY rp.id, ki.id, ki.title, ki.content, rp.scheduled_date, rp.status",
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
            "completed_at = NOW(),",
            "study_note = #{studyNote}",
            "WHERE id = #{id}",
            "AND status = 'pending'"
    })
    int markCompleted(@Param("id") Long id, @Param("studyNote") String studyNote);

    @Select({
            "SELECT id, item_id, scheduled_date, status, completed_at, study_note",
            "FROM review_plan",
            "WHERE id = #{id}"
    })
    @Results(id = "reviewPlanResult", value = {
            @Result(property = "itemId", column = "item_id"),
            @Result(property = "scheduledDate", column = "scheduled_date"),
            @Result(property = "completedAt", column = "completed_at"),
            @Result(property = "studyNote", column = "study_note")
    })
    ReviewPlan findById(@Param("id") Long id);

    @Select({
            "SELECT id, item_id, scheduled_date, status, completed_at, study_note",
            "FROM review_plan",
            "WHERE item_id = #{itemId}",
            "ORDER BY scheduled_date ASC, id ASC"
    })
    @ResultMap("reviewPlanResult")
    List<ReviewPlan> findByItemIdOrderBySchedule(@Param("itemId") Long itemId);

    @Update({
            "UPDATE review_plan",
            "SET scheduled_date = #{scheduledDate}",
            "WHERE id = #{id}",
            "AND status = 'pending'"
    })
    int updateScheduledDate(@Param("id") Long id, @Param("scheduledDate") LocalDate scheduledDate);

    @Delete({
            "DELETE FROM review_plan",
            "WHERE item_id = #{itemId}"
    })
    int deleteByItemId(@Param("itemId") Long itemId);

    @Select({
            "SELECT id, scheduled_date, status, completed_at, study_note",
            "FROM review_plan",
            "WHERE item_id = #{itemId}",
            "ORDER BY scheduled_date ASC, id ASC"
    })
    @Results(id = "reviewPlanDetailResult", value = {
            @Result(property = "scheduledDate", column = "scheduled_date"),
            @Result(property = "completedAt", column = "completed_at"),
            @Result(property = "studyNote", column = "study_note")
    })
    List<ReviewPlanDetail> findDetailsByItemId(@Param("itemId") Long itemId);

    @Select({
            "SELECT",
            "rp.id AS review_id,",
            "ki.id AS item_id,",
            "ki.title,",
            "GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS tags,",
            "rp.scheduled_date",
            "FROM review_plan rp",
            "JOIN knowledge_item ki ON rp.item_id = ki.id",
            "LEFT JOIN knowledge_item_tag kit ON kit.item_id = ki.id",
            "LEFT JOIN tag t ON t.id = kit.tag_id",
            "WHERE rp.scheduled_date > #{startDate}",
            "AND rp.status = 'pending'",
            "GROUP BY rp.id, ki.id, ki.title, rp.scheduled_date",
            "ORDER BY rp.scheduled_date ASC, rp.id ASC"
    })
    @Results(id = "upcomingReviewItemResult", value = {
            @Result(property = "reviewId", column = "review_id"),
            @Result(property = "itemId", column = "item_id"),
            @Result(property = "scheduledDate", column = "scheduled_date")
    })
    List<UpcomingReviewItem> findUpcomingPendingAfter(@Param("startDate") LocalDate startDate);
}
