const express = require("express");
const router = express.Router();
const db = require("../dbConnection");

// GET /api/users - 獲取所有使用者 (id, userName, role)
router.get("/", (req, res) => {
    const sql = "SELECT id, userName, role FROM users ORDER BY userName ASC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching users:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// PUT /api/users/:id - 更新使用者角色
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ error: "角色 (role) 欄位為必填" });
    }

    const validRoles = ["user", "admin"];
    if (!validRoles.includes(role)) {
        return res
            .status(400)
            .json({ error: "請提供有效的角色: user 或 admin" });
    }

    const sqlUpdate = "UPDATE users SET role = ? WHERE id = ?";
    db.run(sqlUpdate, [role, id], function (err) {
        if (err) {
            console.error("Error updating user role:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes > 0) {
            res.json({ message: `成功更新使用者 ${id} 的角色為 ${role}` });
        } else {
            res.status(404).json({ error: "找不到指定 ID 的使用者" });
        }
    });
});

module.exports = router;
