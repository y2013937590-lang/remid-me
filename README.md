# remid-me

一个个人使用的 21 天复习计划系统，技术栈为 Spring Boot 3.x + MyBatis + MySQL + React。

## 当前功能

- 新增知识点后自动生成 7 条复习计划，日期偏移为 `0/1/2/4/7/15/21` 天
- 首页显示今天及逾期未完成的复习内容
- 可以将单条复习记录标记为完成，并顺手记录学习笔记
- 可以查看全部知识点及其复习进度
- 支持编辑知识点内容
- 支持删除知识点及其全部复习计划
- 知识点总览会显示最近一次学习笔记
- 如果某次复习逾期才完成，后续未完成计划会按实际完成日期自动顺延

## 接口

- `POST /api/items` 新增知识点
- `GET /api/items` 获取全部知识点及进度统计
- `PUT /api/items/{id}` 编辑知识点
- `DELETE /api/items/{id}` 删除知识点及其复习计划
- `GET /api/reviews/today` 获取今天及逾期未完成的复习项
- `PUT /api/reviews/{id}/complete` 将某条复习记录标记为已完成，并可附带 `studyNote`

## 数据库升级

如果你之前已经创建过 `review_plan` 表，需要补这一条：

```sql
ALTER TABLE review_plan ADD COLUMN study_note TEXT NULL;
```

## 目录结构

```text
remid-me/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/remidme/backend/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── mapper/
│       │   ├── service/
│       │   └── RemidMeApplication.java
│       └── resources/
│           ├── application.yml
│           └── schema.sql
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── components/
            ├── AddItemForm.jsx
            ├── KnowledgeItemList.jsx
            └── TodayReviewList.jsx
```
