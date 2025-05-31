const express = require("express");
const router = express.Router();
const db = require("../dbConnection"); // 確保 dbConnection.js 的路徑正確

// GET /api/gold_prices - 獲取所有金價資料
router.get("/", (req, res) => {
    db.all("SELECT * FROM gold_prices ORDER BY date DESC", [], (err, rows) => {
        if (err) {
            console.error("Error fetching gold prices:", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// POST /api/gold_prices - 新增金價資料
router.post("/", (req, res) => {
    const { date, price } = req.body;
    if (!date || price === undefined) {
        return res
            .status(400)
            .json({ error: "日期 (date) 和價格 (price) 為必填欄位" });
    }
    // 簡單的日期格式驗證 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "日期格式必須為 YYYY-MM-DD" });
    }
    if (isNaN(parseFloat(price)) || !isFinite(price)) {
        return res.status(400).json({ error: "價格必須是一個有效的數字" });
    }

    db.run(
        "INSERT INTO gold_prices (date, price) VALUES (?, ?)",
        [date, parseFloat(price)],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(409).json({
                        error: `日期 ${date} 的資料已存在，無法重複新增。`,
                    });
                }
                console.error("Error inserting gold price:", err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({
                message: "成功新增金價資料",
                date: date,
                price: parseFloat(price),
                id: this.lastID,
            });
        }
    );
});

// GET /api/gold_prices/:date - 根據日期獲取特定金價資料
router.get("/:date", (req, res) => {
    const { date } = req.params;
    // 簡單的日期格式驗證 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res
            .status(400)
            .json({ error: "請求的日期格式必須為 YYYY-MM-DD" });
    }

    db.get("SELECT * FROM gold_prices WHERE date = ?", [date], (err, row) => {
        if (err) {
            console.error("Error fetching gold price by date:", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json({ data: row });
        } else {
            res.status(404).json({ message: "找不到指定日期的金價資料" });
        }
    });
});

// PUT /api/gold_prices/:date - 根據日期更新金價資料
router.put("/:date", (req, res) => {
    const { date } = req.params; // 從 URL 路徑中獲取原始日期
    const { price } = req.body; // 從請求主體中獲取新的價格

    if (price === undefined) {
        return res.status(400).json({ error: "價格 (price) 為必填欄位" });
    }
    // 簡單的日期格式驗證 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res
            .status(400)
            .json({ error: "請求的日期格式必須為 YYYY-MM-DD" });
    }
    if (isNaN(parseFloat(price)) || !isFinite(price)) {
        return res.status(400).json({ error: "價格必須是一個有效的數字" });
    }

    db.run(
        "UPDATE gold_prices SET price = ? WHERE date = ?",
        [parseFloat(price), date],
        function (err) {
            if (err) {
                console.error("更新資料庫時出錯:", err.message);
                res.status(500).json({
                    error: "更新資料庫時出錯: " + err.message,
                });
                return;
            }
            if (this.changes > 0) {
                res.json({ message: `成功更新日期 ${date} 的金價資料` });
            } else {
                // 可能是日期不存在，或是價格未變動
                // 為了更明確，可以先查詢日期是否存在
                db.get(
                    "SELECT date FROM gold_prices WHERE date = ?",
                    [date],
                    (getErr, row) => {
                        if (getErr) {
                            res.status(500).json({
                                error:
                                    "檢查日期是否存在時出錯: " + getErr.message,
                            });
                        } else if (!row) {
                            res.status(404).json({
                                message: "找不到指定日期的金價資料進行更新",
                            });
                        } else {
                            // 日期存在，但價格可能未變動，或者其他原因導致 changes 為 0
                            // SQLite 在值未改變時，this.changes 可能為 0
                            res.json({
                                message: `日期 ${date} 的金價資料未發生變動或已是最新值`,
                            });
                        }
                    }
                );
            }
        }
    );
});

// DELETE /api/gold_prices/:date - 根據日期刪除金價資料
router.delete("/:date", (req, res) => {
    const { date } = req.params;
    // 簡單的日期格式驗證 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res
            .status(400)
            .json({ error: "請求的日期格式必須為 YYYY-MM-DD" });
    }

    db.run("DELETE FROM gold_prices WHERE date = ?", [date], function (err) {
        if (err) {
            console.error("Error deleting gold price:", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes > 0) {
            res.json({ message: `成功刪除日期 ${date} 的金價資料` });
        } else {
            res.status(404).json({
                message: "找不到指定日期的金價資料進行刪除",
            });
        }
    });
});

module.exports = router;
