const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../dbConnection"); // 引入資料庫連接
const path = require("path"); // 引入 path 模組

const saltRounds = 10; // 雜湊的複雜度

// 處理註冊請求 (此路由掛載在 /api/register)
router.post("/", async (req, res) => {
    const { userName, password, confirmPassword } = req.body;

    if (!userName || !password || !confirmPassword) {
        return res.status(400).json({ message: "所有欄位皆為必填" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "密碼與確認密碼不相符" });
    }

    // 檢查使用者名稱是否已存在
    db.get(
        "SELECT userName FROM users WHERE userName = ?",
        [userName],
        async (err, row) => {
            if (err) {
                console.error("查詢使用者時發生錯誤:", err.message);
                return res
                    .status(500)
                    .json({ message: "伺服器錯誤，請稍後再試" });
            }
            if (row) {
                return res
                    .status(409)
                    .json({ message: "此使用者名稱已被註冊" });
            }

            // 雜湊密碼
            try {
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                // 將新使用者插入資料庫
                db.run(
                    "INSERT INTO users (userName, password, role) VALUES (?, ?, ?)",
                    [userName, hashedPassword, "user"],
                    function (err) {
                        if (err) {
                            console.error(
                                "插入新使用者時發生錯誤:",
                                err.message
                            );
                            return res
                                .status(500)
                                .json({ message: "註冊失敗，請稍後再試" });
                        }
                        res.status(201).json({
                            message: "註冊成功",
                            userId: this.lastID,
                        });
                    }
                );
            } catch (hashError) {
                console.error("密碼雜湊時發生錯誤:", hashError);
                return res
                    .status(500)
                    .json({ message: "註冊過程中發生錯誤，請稍後再試" });
            }
        }
    );
});

module.exports = router;
