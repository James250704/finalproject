const express = require("express");
const router = express.Router();

// GET or POST /api/logout - 用戶登出
router.post("/", (req, res) => {
    // 檢查是否有 session
    if (req.session) {
        // 銷毀 session
        req.session.destroy((err) => {
            if (err) {
                console.error("登出時銷毀 session 發生錯誤:", err);
                return res
                    .status(500)
                    .json({ message: "登出時發生伺服器錯誤，請稍後再試" });
            }
            // 清除 cookie（如果有設定名稱為 connect.sid，可選擇性清除）
            res.clearCookie("connect.sid");
            return res.status(200).json({ message: "已成功登出" });
        });
    } else {
        // 如果沒有 session，直接回傳成功
        return res.status(200).json({ message: "已成功登出" });
    }
});

module.exports = router;
