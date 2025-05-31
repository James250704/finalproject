<template>
    <div class="d-flex align-items-center py-4 vh-100">
        <main class="form-signin w-100 m-auto" style="max-width: 330px">
            <form @submit.prevent="handleRegister">
                <div class="text-center">
                    <img class="mb-4" src="@/assets/title.png" alt="網站Logo" height="57" />
                </div>
                <h1 class="h3 mb-3 fw-normal text-center">註冊新帳號</h1>

                <div class="form-floating mb-2">
                    <input v-model="userName" type="text" class="form-control" id="userName" placeholder="使用者名稱" required />
                    <label for="userName">使用者名稱</label>
                </div>
                <div class="form-floating mb-3">
                    <input v-model="password" type="password" class="form-control" id="password" placeholder="密碼" required />
                    <label for="password">密碼</label>
                </div>
                <div class="form-floating mb-3">
                    <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword" placeholder="確認密碼" required />
                    <label for="confirmPassword">確認密碼</label>
                </div>

                <button class="btn btn-primary w-100 py-2" type="submit">註冊</button>
                <p class="mt-3 mb-1 text-center">
                    已經有帳號了？
                    <router-link to="/login">登入</router-link>
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
    name: "RegisterPage",
    setup() {
        const userName = ref("");
        const password = ref("");
        const confirmPassword = ref("");
        const message = ref("");
        const messageType = ref("");
        const router = useRouter();

        const handleRegister = async () => {
            message.value = "";
            messageType.value = "";

            // 1. 確認必填欄位
            if (!userName.value || !password.value || !confirmPassword.value) {
                message.value = "所有欄位皆為必填";
                messageType.value = "text-danger";
                return;
            }

            // 2. 確認密碼與確認密碼一致
            if (password.value !== confirmPassword.value) {
                message.value = "密碼與確認密碼不相符";
                messageType.value = "text-danger";
                return;
            }

            try {
                const response = await fetch("http://localhost:3000/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userName: userName.value,
                        password: password.value,
                        confirmPassword: confirmPassword.value,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    message.value = data.message + "，請前往登入。";
                    messageType.value = "text-success";

                    // 註冊成功後，等待兩秒再導向 /login
                    setTimeout(() => {
                        router.push("/login");
                    }, 2000);
                } else {
                    // 如果伺服器回傳錯誤訊息（4xx/5xx），顯示該訊息
                    message.value = data.message || "註冊失敗";
                    messageType.value = "text-danger";
                }
            } catch (error) {
                console.error("註冊請求失敗:", error);
                message.value = "註冊請求失敗，請檢查網路連線。";
                messageType.value = "text-danger";
            }
        };

        return {
            userName,
            password,
            confirmPassword,
            message,
            messageType,
            handleRegister,
        };
    },
};
</script>

<style scoped>
/* 如需額外自訂樣式，可在此添加 */
</style>
