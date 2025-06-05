# 專案結構

```
├── .gitignore
├── README.md
├── babel.config.js
├── backend/
│   ├── db/
│   │   └── sqlite.db
│   ├── dbConnection.js
│   ├── package-lock.json
│   ├── package.json
│   ├── routes/
│   │   ├── goldPrices.js
│   │   ├── login.js
│   │   ├── logout.js
│   │   ├── register.js
│   │   └── user.js
│   └── server.js
├── jsconfig.json
├── package-lock.json
├── package.json
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── App.vue
│   ├── assets/
│   │   ├── logo.png
│   │   └── title.png
│   ├── components/
│   │   ├── Backend.vue
│   │   ├── Headernav.vue
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── main.js
│   └── router/
│       └── index.js
└── vue.config.js
```

## 說明

-   Frontend: Vue.js 項目 (src 目錄)
-   Backend: Node.js/Express 項目 (backend 目錄)
-   資料庫: SQLite (backend/db/sqlite.db)
-   路由設定: backend/routes 目錄
