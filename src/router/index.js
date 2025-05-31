import { createRouter, createWebHistory } from "vue-router";
import Home from "@/components/Home.vue";
import Backend from "@/components/Backend.vue";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";

const routes = [
    { path: "/", component: Home },
    { path: "/backend", component: Backend },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 全域導航守衛：只有 role 是 'admin' 的使用者才能進入 /backend
router.beforeEach((to, from, next) => {
    if (to.path === "/backend") {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) {
            // 未登入
            window.dispatchEvent(
                new CustomEvent("auth-error", {
                    detail: "請先登入。",
                })
            );
            return next({ path: "/" });
        }
        if (user.role !== "admin") {
            // 非管理員
            window.dispatchEvent(
                new CustomEvent("auth-error", {
                    detail: "您不是管理員，無法進入此頁面。",
                })
            );
            return next({ path: "/" });
        }
    }
    next();
});

export default router;
