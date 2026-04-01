# remid-me

一个个人使用的 21 天复习计划系统，技术栈为 Spring Boot 3.x + MyBatis + MySQL + React。

## 当前功能

- 新增知识点后自动生成 7 条复习计划，日期偏移为 `0/1/2/4/7/15/21` 天
- 首页显示今天及逾期未完成的复习内容
- 可以将单条复习记录标记为完成
- 可以查看全部知识点及其复习进度
- 支持编辑知识点内容
- 支持删除知识点及其全部复习计划

## 接口

- `POST /api/items` 新增知识点
- `GET /api/items` 获取全部知识点及进度统计
- `PUT /api/items/{id}` 编辑知识点
- `DELETE /api/items/{id}` 删除知识点及其复习计划
- `GET /api/reviews/today` 获取今天及逾期未完成的复习项
- `PUT /api/reviews/{id}/complete` 将某条复习记录标记为已完成

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
