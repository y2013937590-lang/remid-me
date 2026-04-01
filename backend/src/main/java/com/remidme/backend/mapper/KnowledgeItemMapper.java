package com.remidme.backend.mapper;

import com.remidme.backend.entity.KnowledgeItem;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

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
}
