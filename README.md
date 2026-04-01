# remid-me

一个极简的个人 21 天复习计划系统示例，技术栈为 Spring Boot 3.x + MyBatis + MySQL + React。

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
            └── TodayReviewList.jsx
```
