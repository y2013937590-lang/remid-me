package com.remidme.backend.mapper;

import com.remidme.backend.dto.ItemTagLink;
import com.remidme.backend.dto.TagSummary;
import com.remidme.backend.entity.Tag;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface TagMapper {

    @Select({
            "SELECT",
            "t.id,",
            "t.name,",
            "t.category_id,",
            "t.sort_order,",
            "tc.name AS category_name,",
            "COUNT(DISTINCT kit.item_id) AS item_count",
            "FROM tag t",
            "LEFT JOIN tag_category tc ON tc.id = t.category_id",
            "LEFT JOIN knowledge_item_tag kit ON kit.tag_id = t.id",
            "GROUP BY t.id, t.name, t.category_id, t.sort_order, tc.name",
            "ORDER BY t.category_id IS NULL ASC, tc.sort_order ASC, tc.name ASC, t.sort_order ASC, t.name ASC"
    })
    List<TagSummary> findAllSummaries();

    @Select({
            "SELECT t.id, t.name, t.category_id, t.sort_order, tc.name AS category_name",
            "FROM tag t",
            "LEFT JOIN tag_category tc ON tc.id = t.category_id",
            "WHERE t.id = #{id}"
    })
    Tag findById(@Param("id") Long id);

    @Select({
            "SELECT t.id, t.name, t.category_id, t.sort_order, tc.name AS category_name",
            "FROM tag t",
            "LEFT JOIN tag_category tc ON tc.id = t.category_id",
            "WHERE t.name = #{name}"
    })
    Tag findByName(@Param("name") String name);

    @Select({
            "<script>",
            "SELECT t.id, t.name, t.category_id, t.sort_order, tc.name AS category_name",
            "FROM tag t",
            "LEFT JOIN tag_category tc ON tc.id = t.category_id",
            "WHERE t.id IN",
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
            "#{id}",
            "</foreach>",
            "</script>"
    })
    List<Tag> findByIds(@Param("ids") List<Long> ids);

    @Select({
            "<script>",
            "SELECT t.id, t.name, t.category_id, t.sort_order, tc.name AS category_name",
            "FROM tag t",
            "LEFT JOIN tag_category tc ON tc.id = t.category_id",
            "<choose>",
            "  <when test='categoryId == null'>",
            "    WHERE t.category_id IS NULL",
            "  </when>",
            "  <otherwise>",
            "    WHERE t.category_id = #{categoryId}",
            "  </otherwise>",
            "</choose>",
            "ORDER BY t.sort_order ASC, t.name ASC",
            "</script>"
    })
    List<Tag> findByCategoryId(@Param("categoryId") Long categoryId);

    @Select({
            "<script>",
            "SELECT COALESCE(MAX(t.sort_order), 0)",
            "FROM tag t",
            "<choose>",
            "  <when test='categoryId == null'>",
            "    WHERE t.category_id IS NULL",
            "  </when>",
            "  <otherwise>",
            "    WHERE t.category_id = #{categoryId}",
            "  </otherwise>",
            "</choose>",
            "</script>"
    })
    int findMaxSortOrderByCategoryId(@Param("categoryId") Long categoryId);

    @Select({
            "SELECT tag_id",
            "FROM knowledge_item_tag",
            "WHERE item_id = #{itemId}",
            "ORDER BY tag_id ASC"
    })
    List<Long> findTagIdsByItemId(@Param("itemId") Long itemId);

    @Insert({
            "INSERT INTO tag (name, category_id, sort_order)",
            "VALUES (#{name}, #{categoryId}, #{sortOrder})"
    })
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Tag tag);

    @Update({
            "UPDATE tag",
            "SET name = #{name}, category_id = #{categoryId}, sort_order = #{sortOrder}",
            "WHERE id = #{id}"
    })
    int updateById(Tag tag);

    @Update({
            "UPDATE tag",
            "SET category_id = #{categoryId}, sort_order = #{sortOrder}",
            "WHERE id = #{id}"
    })
    int updatePosition(
            @Param("id") Long id,
            @Param("categoryId") Long categoryId,
            @Param("sortOrder") int sortOrder
    );

    @Update({
            "UPDATE tag",
            "SET category_id = #{targetCategoryId}",
            "WHERE category_id = #{sourceCategoryId}"
    })
    int moveCategory(
            @Param("sourceCategoryId") Long sourceCategoryId,
            @Param("targetCategoryId") Long targetCategoryId
    );

    @Update({
            "UPDATE tag",
            "SET category_id = NULL",
            "WHERE category_id = #{categoryId}"
    })
    int clearCategory(@Param("categoryId") Long categoryId);

    @Delete({
            "DELETE FROM knowledge_item_tag",
            "WHERE item_id = #{itemId}"
    })
    int deleteLinksByItemId(@Param("itemId") Long itemId);

    @Delete({
            "DELETE FROM knowledge_item_tag",
            "WHERE tag_id = #{tagId}"
    })
    int deleteLinksByTagId(@Param("tagId") Long tagId);

    @Insert({
            "<script>",
            "INSERT IGNORE INTO knowledge_item_tag (item_id, tag_id) VALUES",
            "<foreach collection='links' item='link' separator=','>",
            "(#{link.itemId}, #{link.tagId})",
            "</foreach>",
            "</script>"
    })
    int batchInsertLinks(@Param("links") List<ItemTagLink> links);

    @Insert({
            "INSERT IGNORE INTO knowledge_item_tag (item_id, tag_id)",
            "SELECT item_id, #{targetTagId}",
            "FROM knowledge_item_tag",
            "WHERE tag_id = #{sourceTagId}"
    })
    int moveLinks(
            @Param("sourceTagId") Long sourceTagId,
            @Param("targetTagId") Long targetTagId
    );

    @Delete({
            "DELETE FROM tag",
            "WHERE id = #{id}"
    })
    int deleteById(@Param("id") Long id);
}
