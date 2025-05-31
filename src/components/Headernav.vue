<template>
    <header class="fixed-top bg-white m-0 border-bottom border-2">
        <nav class="container position-relative">
            <!-- 電腦版導航 (lg 以上) -->
            <div class="d-none d-lg-flex flex-wrap align-items-center justify-content-between py-2 m-0">
                <router-link to="/" class="d-flex align-items-center mb-0 text-dark text-decoration-none">
                    <img src="@/assets/title.png" style="max-height: 100px" alt="網站Logo" height="49" />
                </router-link>

                <!-- 中間選單 -->
                <ul class="nav justify-content-center mb-lg-0 gap-2">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link text-black" style="font-size: large">首頁</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/backend" class="nav-link text-black" style="font-size: large">後台管理</router-link>
                    </li>
                </ul>

                <!-- 右側登入/登出按鈕 -->
                <div class="text-center gap-2 d-flex flex-row flex-nowrap">
                    <button v-if="!isLoggedIn" @click="goToLogin" class="btn btn-primary w-100" id="headerLoginButton">登入</button>
                    <button v-else @click="logout" class="btn btn-danger w-100" id="headerLogoutButton">登出</button>
                </div>
            </div>

            <!-- 移動版導航 (lg 以下) -->
            <div class="d-flex d-lg-none flex-wrap align-items-center justify-content-between py-2 m-0">
                <router-link to="/" class="d-flex align-items-center mb-0 text-dark text-decoration-none">
                    <img src="@/assets/title.png" style="max-height: 100px" alt="網站Logo" height="49" />
                </router-link>
                <button class="btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNavHeader" aria-controls="collapseNavHeader" aria-expanded="false">
                    <span class="navbar-toggler-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                            <path
                                fill-rule="evenodd"
                                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                            />
                        </svg>
                    </span>
                </button>
            </div>
            <div class="collapse bg-white border-top" id="collapseNavHeader">
                <div class="container p-2 m-0">
                    <ul class="navbar-nav nav-pills flex-column mb-auto">
                        <li class="nav-item">
                            <router-link to="/" class="nav-link text-black">首頁</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/backend" class="nav-link text-black">後台管理</router-link>
                        </li>
                        <hr />
                        <li class="nav-item">
                            <button v-if="!isLoggedIn" @click="goToLogin" class="btn btn-primary w-100 mb-2" id="mobileHeaderLoginButton">登入</button>
                            <button v-else @click="logout" class="btn btn-danger w-100" id="mobileHeaderLogoutButton">登出</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<script>
export default {
    name: "HeaderNav",
    data() {
        return {
            isLoggedIn: Boolean(localStorage.getItem("user")),
        };
    },
    created() {
        // 同步登入狀態
        this.isLoggedIn = Boolean(localStorage.getItem("user"));
        // 監聽自訂事件
        window.addEventListener("user-logged-in", this.onUserLoggedIn);
        window.addEventListener("user-logged-out", this.onUserLoggedOut);
    },
    beforeUnmount() {
        window.removeEventListener("user-logged-in", this.onUserLoggedIn);
        window.removeEventListener("user-logged-out", this.onUserLoggedOut);
    },
    watch: {
        // 當路由改變時，重新同步登入狀態
        $route() {
            this.isLoggedIn = Boolean(localStorage.getItem("user"));
        },
    },
    methods: {
        onUserLoggedIn() {
            this.isLoggedIn = true;
        },
        onUserLoggedOut() {
            this.isLoggedIn = false;
        },
        goToLogin() {
            this.$router.push("/login");
        },
        async logout() {
            try {
                await fetch("http://localhost:3000/api/logout", {
                    method: "POST",
                    credentials: "include",
                });
            } catch (error) {
                console.error("Logout request failed:", error);
            }
            localStorage.removeItem("user");
            this.isLoggedIn = false;
            // 觸發自訂事件以通知其他元件
            window.dispatchEvent(new Event("user-logged-out"));
            this.$router.push("/");
        },
    },
};
</script>

<style scoped>
.nav-link {
    color: #000;
}

.nav-link:hover {
    color: #efbf04;
}

.nav-pills .nav-link {
    color: #efbf04;
    background-color: white;
    transition: background-color 0.3s, color 0.3s;
}

/* Active 狀態 */
.nav-pills .nav-link.active {
    color: #fff;
    background-color: #efbf04;
}

.nav-pills .nav-link img {
    vertical-align: middle;
}
</style>
