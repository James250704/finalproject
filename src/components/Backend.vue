<template>
    <div class="container mt-5 pt-4">
        <h1 class="mb-4">後台管理頁面</h1>

        <!-- 新增/編輯表單 -->
        <div class="card mb-4">
            <div class="card-header">
                <h5>{{ isEditing ? "編輯黃金價格" : "新增黃金價格" }}</h5>
            </div>
            <div class="card-body">
                <form @submit.prevent="handleSave">
                    <input type="hidden" v-model="editDate" />
                    <div class="mb-3">
                        <label for="date" class="form-label"
                            >日期 (YYYY-MM-DD)</label
                        >
                        <input
                            type="date"
                            class="form-control"
                            id="date"
                            v-model="date"
                            :readonly="isEditing"
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <label for="price" class="form-label"
                            >價格 (美元)</label
                        >
                        <input
                            type="number"
                            step="0.01"
                            class="form-control"
                            id="price"
                            v-model.number="price"
                            placeholder="例如：1850.55"
                            required
                        />
                    </div>
                    <button type="submit" class="btn btn-primary">
                        {{ isEditing ? "更新" : "儲存" }}
                    </button>
                    <button
                        type="button"
                        class="btn btn-secondary ms-2"
                        v-if="isEditing"
                        @click="cancelEdit"
                    >
                        取消編輯
                    </button>
                </form>
            </div>
        </div>

        <!-- 資料表格 -->
        <div class="row mb-3">
            <div class="col-md-6">
                <h2>現有價格資料</h2>
            </div>
            <div class="col-md-6">
                <div class="input-group">
                    <input
                        type="text"
                        class="form-control"
                        v-model="searchTerm"
                        placeholder="以日期或價格模糊搜尋..."
                        @keyup.enter="applyFilter"
                    />
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="applyFilter"
                    >
                        搜尋
                    </button>
                    <button
                        class="btn btn-outline-danger"
                        type="button"
                        @click="resetFilter"
                    >
                        重置
                    </button>
                </div>
            </div>
        </div>
        <div class="table-responsive mb-5">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>價格 (美元)</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredPrices" :key="item.date">
                        <td>{{ item.date }}</td>
                        <td>{{ formatCurrency(item.price) }}</td>
                        <td>
                            <button
                                class="btn btn-sm btn-warning me-2"
                                @click="populateFormForEdit(item)"
                            >
                                編輯
                            </button>
                            <button
                                class="btn btn-sm btn-danger"
                                @click="confirmDelete(item.date)"
                            >
                                刪除
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredPrices.length === 0">
                        <td colspan="3" class="text-center">
                            沒有符合條件的資料
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 刪除確認 Modal -->
        <div
            class="modal fade"
            id="deleteConfirmModal"
            tabindex="-1"
            aria-labelledby="deleteConfirmModalLabel"
            aria-hidden="true"
            ref="deleteModal"
        >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteConfirmModalLabel">
                            確認刪除
                        </h5>
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div class="modal-body">
                        確定要刪除日期
                        <strong>{{ dateToDelete }}</strong> 的價格資料嗎？
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            class="btn btn-danger"
                            @click="deletePrice"
                        >
                            確定刪除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 通用資訊提示 Modal -->
        <div
            class="modal fade"
            id="infoModal"
            tabindex="-1"
            aria-labelledby="infoModalLabel"
            aria-hidden="true"
            ref="infoModal"
        >
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="infoModalLabel">通知</h5>
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div class="modal-body">{{ infoMessage }}</div>
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
import { ref, onMounted, computed } from "vue";
import * as bootstrap from "bootstrap";

export default {
    name: "BackendPage",
    setup() {
        const date = ref("");
        const price = ref(null);
        const editDate = ref("");
        const isEditing = ref(false);

        const allPricesData = ref([]);
        const searchTerm = ref("");
        const dateToDelete = ref("");
        const infoMessage = ref("");

        const deleteModal = ref(null);
        const infoModal = ref(null);

        // 格式化金額
        const formatCurrency = (value) => {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(value);
        };

        // 取得所有價格資料
        const loadPrices = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/goldPrices"
                );
                if (!response.ok) {
                    throw new Error(`HTTP 錯誤！狀態：${response.status}`);
                }
                const result = await response.json();
                allPricesData.value = result.data || [];
                allPricesData.value.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
            } catch (error) {
                console.error("無法載入價格資料:", error);
                showInfo(`載入資料失敗：${error.message}`);
            }
        };

        // 新增或更新價格
        const handleSave = async () => {
            if (!date.value || price.value === null) {
                showInfo("請填寫所有欄位並確保價格是有效的數字。");
                return;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
                showInfo("請輸入有效的日期格式 (YYYY-MM-DD)");
                return;
            }

            let url = "http://localhost:3000/api/goldPrices";
            let method = "POST";
            let payload = { date: date.value, price: price.value };

            if (isEditing.value) {
                url = `http://localhost:3000/api/goldPrices/${editDate.value}`;
                method = "PUT";
                payload = { price: price.value };
            }
            try {
                const response = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(
                        err.error || `HTTP 錯誤！狀態：${response.status}`
                    );
                }
                const result = await response.json();
                showInfo(
                    result.message ||
                        (isEditing.value ? "更新成功" : "新增成功")
                );
                resetForm();
                loadPrices();
            } catch (error) {
                console.error("操作失敗:", error);
                showInfo(`操作失敗：${error.message}`);
            }
        };

        // 填充表單進行編輯
        const populateFormForEdit = (item) => {
            isEditing.value = true;
            editDate.value = item.date;
            date.value = item.date;
            price.value = item.price;
        };

        // 取消編輯
        const cancelEdit = () => {
            resetForm();
        };

        // 重置表單
        const resetForm = () => {
            isEditing.value = false;
            editDate.value = "";
            date.value = "";
            price.value = null;
        };

        // 顯示通用資訊 Modal
        const showInfo = (message) => {
            infoMessage.value = message;
            infoModal.value.show();
        };

        // 確認刪除
        const confirmDelete = (selectedDate) => {
            dateToDelete.value = selectedDate;
            deleteModal.value.show();
        };

        // 刪除價格
        const deletePrice = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/goldPrices/${dateToDelete.value}`,
                    { method: "DELETE" }
                );
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(
                        err.error || `HTTP 錯誤！狀態：${response.status}`
                    );
                }
                const result = await response.json();
                showInfo(result.message || "刪除成功");
                loadPrices();
            } catch (error) {
                console.error("刪除失敗:", error);
                showInfo(`刪除失敗：${error.message}`);
            } finally {
                deleteModal.value.hide();
            }
        };

        // 表格搜尋過濾
        const applyFilter = () => {
            // 搜尋過程由 computed filteredPrices 處理
        };

        const resetFilter = () => {
            searchTerm.value = "";
        };

        const filteredPrices = computed(() => {
            if (!searchTerm.value.trim()) {
                return allPricesData.value;
            }
            const term = searchTerm.value.toLowerCase().trim();
            return allPricesData.value.filter((item) => {
                const dateMatch = item.date.toLowerCase().includes(term);
                const priceMatch = item.price
                    .toString()
                    .toLowerCase()
                    .includes(term);
                return dateMatch || priceMatch;
            });
        });

        onMounted(() => {
            loadPrices();
            // 初始化 Bootstrap modals
            // eslint-disable-next-line no-undef
            deleteModal.value = new bootstrap.Modal(
                document.getElementById("deleteConfirmModal")
            );
            // eslint-disable-next-line no-undef
            infoModal.value = new bootstrap.Modal(
                document.getElementById("infoModal")
            );
        });

        return {
            date,
            price,
            editDate,
            isEditing,
            allPricesData,
            searchTerm,
            dateToDelete,
            infoMessage,
            filteredPrices,
            handleSave,
            populateFormForEdit,
            cancelEdit,
            confirmDelete,
            deletePrice,
            applyFilter,
            resetFilter,
            formatCurrency,
        };
    },
};
</script>

<style scoped>
/* 如需自訂樣式，可在此添加 */
</style>
