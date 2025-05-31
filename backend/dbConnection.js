const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 資料庫檔案的路徑，假設它在專案根目錄下的 db 資料夾中
const dbPath = path.resolve(__dirname, "db/sqlite.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("無法連接到資料庫:", err.message);
    } else {
        console.log("已成功連接到 SQLite 資料庫 sqlite.db");
        // 創建 gold_prices 資料表 (如果它不存在)
        db.run(
            `CREATE TABLE IF NOT EXISTS gold_prices (
            date TEXT PRIMARY KEY,
            price REAL NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error("無法創建 gold_prices 資料表:", err.message);
                } else {
                    console.log("gold_prices 資料表已準備就緒。");
                }
            }
        );
        db.run(
            `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userName TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user' -- 預設角色為 'user'
            )`,
            (err) => {
                if (err) {
                    console.error("無法創建 users 資料表:", err.message);
                } else {
                    console.log("users 資料表已準備就緒。");
                }
            }
        );
    }
});

module.exports = db;
