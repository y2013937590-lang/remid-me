package com.remidme.backend.mapper;

import com.remidme.backend.dto.KnowledgeItemSummary;
import com.remidme.backend.entity.KnowledgeItem;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface KnowledgeItemMapper {

    @Insert({
            "INSERT INTO knowledge_item (title, content)",
            "VALUES (#{title}, #{content})"
    })
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(KnowledgeItem item);

    @Select({
            "SELECT id, title, content, created_at",
            "FROM knowledge_item",
            "WHERE id = #{id}"
    })
    @Results(id = "knowledgeItemResult", value = {
            @Result(property = "createdAt", column = "created_at")
    })
    KnowledgeItem findById(@Param("id") Long id);

    @Select({
            "<script>",
            "SELECT",
            "ki.id,",
            "ki.title,",
            "ki.content,",
            "ki.created_at,",
            "COUNT(rp.id) AS total_plans,",
            "COALESCE(SUM(CASE WHEN rp.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_plans,",
            "COALESCE(SUM(CASE WHEN rp.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_plans,",
            "MIN(CASE WHEN rp.status = 'pending' THEN rp.scheduled_date END) AS next_review_date,",
            "(SELECT rp2.study_note",
            " FROM review_plan rp2",
            " WHERE rp2.item_id = ki.id",
            "   AND rp2.study_note IS NOT NULL",
            "   AND rp2.study_note &lt;&gt; ''",
            " ORDER BY rp2.completed_at DESC, rp2.id DESC",
            " LIMIT 1) AS latest_study_note,",
            "(SELECT rp3.completed_at",
            " FROM review_plan rp3",
            " WHERE rp3.item_id = ki.id",
            "   AND rp3.study_note IS NOT NULL",
            "   AND rp3.study_note &lt;&gt; ''",
            " ORDER BY rp3.completed_at DESC, rp3.id DESC",
            " LIMIT 1) AS latest_study_note_at",
            "FROM knowledge_item ki",
            "LEFT JOIN review_plan rp ON rp.item_id = ki.id",
            "<if test='keyword != null and keyword != \"\"'>",
            "WHERE ki.title LIKE CONCAT('%', #{keyword}, '%')",
            "OR ki.content LIKE CONCAT('%', #{keyword}, '%')",
            "</if>",
            "GROUP BY ki.id, ki.title, ki.content, ki.created_at",
            "ORDER BY ki.created_at DESC, ki.id DESC",
            "</script>"
    })
    @Results(value = {
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "totalPlans", column = "total_plans"),
            @Result(property = "completedPlans", column = "completed_plans"),
            @Result(property = "pendingPlans", column = "pending_plans"),
            @Result(property = "nextReviewDate", column = "next_review_date"),
            @Result(property = "latestStudyNote", column = "latest_study_note"),
            @Result(property = "latestStudyNoteAt", column = "latest_study_note_at")
    })
    List<KnowledgeItemSummary> findAllSummaries(@Param("keyword") String keyword);

    @Update({
            "UPDATE knowledge_item",
            "SET title = #{title},",
            "content = #{content}",
            "WHERE id = #{id}"
    })
    int updateById(KnowledgeItem item);

    @Delete({
            "DELETE FROM knowledge_item",
            "WHERE id = #{id}"
    })
    int deleteById(@Param("id") Long id);
}
