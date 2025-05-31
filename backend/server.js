// backend/server.js

const express = require("express");
const cors = require("cors");
const session = require("express-session");

// 匯入您剛剛寫好的金價路由
// 請確保 routesP.js 已經存在，並且路徑正確
const goldPricesRouter = require("./routes/goldPrices");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");
const app = express();
const PORT = 3000; // 您可依需求將 3000 改成其他埠號

app.use(cors());
app.use(express.json());
app.use(
    session({
        secret: "12341234", // 請換成一個安全的字串
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // 若在 HTTPS 環境下，設為 true
    })
);

// 將所有 /apiP 開頭的請求，轉送到 goldPricesRouter 處理
app.use("/api/goldPrices", goldPricesRouter);
app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/logout", logoutRouter);

// ===========================
// 3. 啟動伺服器
// ===========================
app.listen(PORT, () => {
    console.log(`Server 已啟動，監聽埠號 ${PORT}`);
});
