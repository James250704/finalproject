const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../dbConnection");

// POST /api/login - 用戶登入
router.post("/", async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        return res.status(400).json({ message: "請輸入使用者名稱和密碼" });
    }

    db.get(
        "SELECT * FROM users WHERE userName = ?",
        [userName],
        async (err, user) => {
            if (err) {
                console.error("查詢使用者時發生錯誤:", err.message);
                return res
                    .status(500)
                    .json({ message: "伺服器錯誤，請稍後再試" });
            }
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "使用者名稱或密碼錯誤" });
            }

            try {
                // 比較雜湊後的密碼
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res
                        .status(401)
                        .json({ message: "使用者名稱或密碼錯誤" });
                }

                // 登入成功，設定 session
                req.session.user = {
                    id: user.id,
                    userName: user.userName,
                    role: user.role, // 假設有角色資訊
                };

                // 明確儲存 session 並處理潛在錯誤
                req.session.save((saveErr) => {
                    if (saveErr) {
                        console.error("Session 儲存失敗:", saveErr);
                        return res.status(500).json({
                            message: "登入時發生伺服器內部錯誤，請稍後再試",
                        });
                    }
                    // Session 儲存成功
                    res.status(200).json({
                        message: "登入成功",
                        user: {
                            id: user.id,
                            userName: user.userName,
                            role: user.role,
                        },
                    });
                });
            } catch (processError) {
                console.error(
                    "密碼比較或 Session 處理時發生錯誤:",
                    processError
                );
                return res
                    .status(500)
                    .json({ message: "登入過程中發生內部錯誤" });
            }
        }
    );
});

module.exports = router;
