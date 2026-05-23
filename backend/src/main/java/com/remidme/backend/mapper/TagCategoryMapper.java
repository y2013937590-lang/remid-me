package com.remidme.backend.mapper;

import com.remidme.backend.dto.TagCategorySummary;
import com.remidme.backend.entity.TagCategory;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface TagCategoryMapper {

    @Select({
            "SELECT",
            "tc.id,",
            "tc.name,",
            "tc.sort_order,",
            "COUNT(t.id) AS tag_count",
            "FROM tag_category tc",
            "LEFT JOIN tag t ON t.category_id = tc.id",
            "GROUP BY tc.id, tc.name, tc.sort_order",
            "ORDER BY tc.sort_order ASC, tc.name ASC"
    })
    List<TagCategorySummary> findAllSummaries();

    @Select({
            "SELECT id, name, sort_order",
            "FROM tag_category",
            "ORDER BY sort_order ASC, name ASC"
    })
    List<TagCategory> findAllOrdered();

    @Select({
            "SELECT id, name, sort_order",
            "FROM tag_category",
            "WHERE id = #{id}"
    })
    TagCategory findById(@Param("id") Long id);

    @Select({
            "SELECT id, name, sort_order",
            "FROM tag_category",
            "WHERE name = #{name}"
    })
    TagCategory findByName(@Param("name") String name);

    @Insert({
            "INSERT INTO tag_category (name, sort_order)",
            "VALUES (#{name}, #{sortOrder})"
    })
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(TagCategory category);

    @Update({
            "UPDATE tag_category",
            "SET name = #{name}, sort_order = #{sortOrder}",
            "WHERE id = #{id}"
    })
    int updateById(TagCategory category);

    @Select({
            "SELECT COALESCE(MAX(sort_order), 0)",
            "FROM tag_category"
    })
    int findMaxSortOrder();

    @Update({
            "UPDATE tag_category",
            "SET sort_order = #{sortOrder}",
            "WHERE id = #{id}"
    })
    int updatePosition(@Param("id") Long id, @Param("sortOrder") int sortOrder);

    @Delete({
            "DELETE FROM tag_category",
            "WHERE id = #{id}"
    })
    int deleteById(@Param("id") Long id);
}
