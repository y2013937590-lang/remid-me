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
            "COUNT(DISTINCT kit.item_id) AS item_count",
            "FROM tag t",
            "LEFT JOIN knowledge_item_tag kit ON kit.tag_id = t.id",
            "GROUP BY t.id, t.name",
            "ORDER BY item_count DESC, t.name ASC"
    })
    List<TagSummary> findAllSummaries();

    @Select({
            "SELECT id, name",
            "FROM tag",
            "WHERE id = #{id}"
    })
    Tag findById(@Param("id") Long id);

    @Select({
            "SELECT id, name",
            "FROM tag",
            "WHERE name = #{name}"
    })
    Tag findByName(@Param("name") String name);

    @Select({
            "<script>",
            "SELECT id, name",
            "FROM tag",
            "WHERE id IN",
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
            "#{id}",
            "</foreach>",
            "</script>"
    })
    List<Tag> findByIds(@Param("ids") List<Long> ids);

    @Select({
            "SELECT tag_id",
            "FROM knowledge_item_tag",
            "WHERE item_id = #{itemId}",
            "ORDER BY tag_id ASC"
    })
    List<Long> findTagIdsByItemId(@Param("itemId") Long itemId);

    @Insert({
            "INSERT INTO tag (name)",
            "VALUES (#{name})"
    })
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Tag tag);

    @Update({
            "UPDATE tag",
            "SET name = #{name}",
            "WHERE id = #{id}"
    })
    int updateById(Tag tag);

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
