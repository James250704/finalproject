<template>
    <div id="app">
        <Headernav />
        <router-view class="container"></router-view>

        <!-- 通用訊息提示 Modal -->
        <div
            class="modal fade"
            id="messageModal"
            tabindex="-1"
            aria-labelledby="messageModalLabel"
            aria-hidden="true"
            ref="messageModalRef"
        >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="messageModalLabel">
                            通知
                        </h5>
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div class="modal-body">{{ messageText }}</div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-primary"
                            data-bs-dismiss="modal"
                        >
                            關閉
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Headernav from "@/components/Headernav.vue";
import * as bootstrap from "bootstrap"; // 引入 Bootstrap 的 JavaScript

export default {
    name: "App",
    components: {
        Headernav,
    },
    data() {
        return {
            messageText: "",
            messageModalInstance: null,
            messageHandler: null,
        };
    },
    mounted() {
        // 初始化 Bootstrap Modal
        if (this.$refs.messageModalRef) {
            this.messageModalInstance = new bootstrap.Modal(
                this.$refs.messageModalRef
            );
        }

        // 監聽自訂事件
        this.messageHandler = (e) => {
            this.messageText = e.detail;
            if (this.messageModalInstance) {
                this.messageModalInstance.show();
            }
        };
        window.addEventListener("show-message", this.messageHandler); // Corrected event name
    },
    beforeUnmount() {
        window.removeEventListener("show-message", this.messageHandler); // Corrected event name
        if (this.messageModalInstance) {
            this.messageModalInstance.dispose();
        }
    },
};
</script>

<style>
/* 如需自訂樣式，可在此添加 */
</style>
