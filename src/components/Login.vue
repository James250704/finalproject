<template>
    <div class="d-flex align-items-center py-4 vh-100">
        <main class="form-signin w-100 m-auto" style="max-width: 330px">
            <form @submit.prevent="handleLogin">
                <div class="text-center">
                    <img class="mb-4" src="@/assets/title.png" alt="Logo" height="57" />
                </div>
                <h1 class="h3 mb-3 fw-normal text-center">請登入</h1>

                <div class="form-floating mb-2">
                    <input v-model="userName" type="text" class="form-control" id="userName" placeholder="使用者名稱" required />
                    <label for="userName">使用者名稱</label>
                </div>
                <div class="form-floating mb-3">
                    <input v-model="password" type="password" class="form-control" id="password" placeholder="密碼" required />
                    <label for="password">密碼</label>
                </div>

                <button class="btn btn-primary w-100 py-2" type="submit">登入</button>
                <p class="mt-3 mb-1 text-center">
                    還沒有帳號嗎？
                    <router-link to="/register">註冊</router-link>
                </p>
                <p v-if="message" :class="['mt-3', 'text-center', messageType]" style="min-height: 1.5em">
                    {{ message }}
                </p>
            </form>
        </main>
    </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
    name: "LoginPage",
    setup() {
        const userName = ref("");
        const password = ref("");
        const message = ref("");
        const messageType = ref("");
        const router = useRouter();

        const handleLogin = async () => {
            message.value = "";
            messageType.value = "";
            try {
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userName: userName.value,
                        password: password.value,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    message.value = data.message + "，將跳轉至後台...";
                    messageType.value = "text-success";
                    // 存儲使用者資訊
                    localStorage.setItem("user", JSON.stringify(data.user));
                    // 觸發自訂事件通知 Header 更新
                    window.dispatchEvent(new Event("user-logged-in"));
                    // 稍作延遲後跳轉
                    setTimeout(() => {
                        router.push("/backend");
                    }, 1000);
                } else {
                    message.value = data.message || "登入失敗";
                    messageType.value = "text-danger";
                }
            } catch (error) {
                console.error("登入請求失敗:", error);
                message.value = "登入請求失敗，請檢查網路連線。";
                messageType.value = "text-danger";
            }
        };

        return {
            userName,
            password,
            message,
            messageType,
            handleLogin,
        };
    },
};
</script>

<style scoped>
/* 如需自訂樣式可在此添加 */
</style>
