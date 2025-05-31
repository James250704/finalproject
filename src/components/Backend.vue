<template>
    <div class="mt-5 pt-4">
        <ul class="nav nav-tabs mb-4" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="price-tab" data-bs-toggle="tab" data-bs-target="#price-management" type="button" role="tab" aria-controls="price-management" aria-selected="true">
                    價格管理
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="user-tab" data-bs-toggle="tab" data-bs-target="#user-management" type="button" role="tab" aria-controls="user-management" aria-selected="false">
                    使用者管理
                </button>
            </li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane fade show active" id="price-management" role="tabpanel" aria-labelledby="price-tab">
                <div class="container">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">{{ isEditing ? "編輯" : "新增" }}黃金價格</h5>
                            <form @submit.prevent="handleSave">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="dateInput" class="form-label">日期 (YYYY-MM-DD):</label>
                                        <input type="date" class="form-control" id="dateInput" v-model="date" :disabled="isEditing" required />
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="priceInput" class="form-label">價格:</label>
                                        <input type="number" class="form-control" id="priceInput" v-model.number="price" step="0.01" required />
                                    </div>
                                    <div class="col-md-4 d-flex align-items-end mb-3">
                                        <button type="submit" class="btn btn-primary me-2">
                                            {{ isEditing ? "更新" : "儲存" }}
                                        </button>
                                        <button v-if="isEditing" @click="cancelEdit" type="button" class="btn btn-secondary">取消</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- 資料表格 -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <input type="text" class="form-control" placeholder="依日期或價格搜尋..." v-model="searchTerm" @input="applyFilter" />
                        </div>
                        <div class="col-md-6">
                            <button @click="resetFilter" class="btn btn-outline-secondary">重設搜尋</button>
                        </div>
                    </div>
                    <div class="table-responsive mb-5">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>日期</th>
                                    <th>價格</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in filteredPrices" :key="item.date">
                                    <td>{{ item.date }}</td>
                                    <td>{{ formatCurrency(item.price) }}</td>
                                    <td>
                                        <button @click="populateFormForEdit(item)" class="btn btn-sm btn-outline-primary me-2">編輯</button>
                                        <button @click="confirmDelete(item.date)" class="btn btn-sm btn-outline-danger">刪除</button>
                                    </td>
                                </tr>
                                <tr v-if="filteredPrices.length === 0">
                                    <td colspan="3" class="text-center">沒有符合條件的資料</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 刪除確認 Modal -->
                    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true" ref="deleteModal">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="deleteConfirmModalLabel">確認刪除</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    確定要刪除日期
                                    {{ dateToDelete }} 的價格資料嗎？
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                                    <button type="button" class="btn btn-danger" @click="deletePrice">確認刪除</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="user-management" role="tabpanel" aria-labelledby="user-tab">
                <div class="container">
                    <h5 class="mb-3">使用者列表</h5>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>使用者名稱</th>
                                    <th>角色</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in usersList" :key="user.id">
                                    <td>{{ user.userName }}</td>
                                    <td>
                                        <select v-model="user.role" class="form-select form-select-sm">
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button @click="updateUserRole(user)" class="btn btn-sm btn-primary">儲存</button>
                                    </td>
                                </tr>
                                <tr v-if="usersList.length === 0">
                                    <td colspan="3" class="text-center">目前沒有使用者</td>
                                </tr>
                            </tbody>
                        </table>
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

        const deleteModal = ref(null); // This ref is linked to the template <div ref="deleteModal">
        const bsDeleteModalInstance = ref(null); // This will store the Bootstrap modal instance

        const usersList = ref([]);

        // 格式化金額
        const formatCurrency = (value) => {
            if (typeof value !== "number") {
                return value; // 或返回一個預設值，如 'N/A'
            }
            return new Intl.NumberFormat("en-US", {
                // style: "currency", // 如果需要貨幣符號
                currency: "USD",
            }).format(value);
        };

        // 顯示通用資訊 Modal
        const showAppMessage = (message) => {
            const event = new CustomEvent("show-message", { detail: message });
            window.dispatchEvent(event);
        };

        // 取得所有價格資料
        const loadPrices = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/goldPrices");
                if (!response.ok) throw new Error("無法獲取價格資料");
                const result = await response.json();
                allPricesData.value = result.data || [];
            } catch (error) {
                console.error("載入價格時出錯:", error);
                showAppMessage(`載入價格失敗：${error.message}`);
            }
        };

        // 取得所有使用者資料
        const loadUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/users", {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
                    },
                });
                if (!response.ok) {
                    if (response.status === 403) {
                        showAppMessage("您沒有權限查看使用者列表。");
                        return;
                    }
                    throw new Error("無法獲取使用者資料");
                }
                const result = await response.json();
                usersList.value = result.data || [];
            } catch (error) {
                console.error("載入使用者時出錯:", error);
                showAppMessage(`載入使用者失敗：${error.message}`);
            }
        };

        // 更新使用者角色
        const updateUserRole = async (user) => {
            try {
                const response = await fetch(`http://localhost:3000/api/users/${user.id}/role`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
                    },
                    body: JSON.stringify({ role: user.role }),
                });
                if (!response.ok) throw new Error("更新角色失敗");
                showAppMessage("使用者角色已更新");
                loadUsers(); // 重新載入使用者列表
            } catch (error) {
                console.error("更新角色時出錯:", error);
                showAppMessage(`更新角色失敗：${error.message}`);
            }
        };

        // 新增或更新價格
        const handleSave = async () => {
            if (!date.value || price.value === null) {
                showAppMessage("日期和價格為必填項。");
                return;
            }
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
                showAppMessage("日期格式不正確，應為 YYYY-MM-DD。");
                return;
            }

            let url = "http://localhost:3000/api/goldPrices";
            let method = "POST";
            let payload = { date: date.value, price: parseFloat(price.value) }; // 確保價格是數字

            if (isEditing.value) {
                url = `http://localhost:3000/api/goldPrices/${editDate.value}`;
                method = "PUT";
                payload = { price: parseFloat(price.value) }; // PUT請求通常只需要更新的欄位
            }

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "操作失敗");
                }
                const result = await response.json();
                showAppMessage(result.message || (isEditing.value ? "更新成功" : "新增成功"));
                resetForm();
                loadPrices(); // 重新載入價格列表
            } catch (error) {
                console.error("儲存價格時出錯:", error);
                showAppMessage(`儲存失敗：${error.message}`);
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

        // 確認刪除
        const confirmDelete = (selectedDate) => {
            dateToDelete.value = selectedDate;
            if (bsDeleteModalInstance.value) {
                bsDeleteModalInstance.value.show();
            } else {
                console.error("Bootstrap delete modal instance is not available.");
                showAppMessage("無法開啟刪除確認視窗，請稍後再試。");
            }
        };

        // 刪除價格
        const deletePrice = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/goldPrices/${dateToDelete.value}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "刪除失敗");
                }
                const result = await response.json();
                showAppMessage(result.message || "刪除成功");
                loadPrices(); // 重新載入價格列表
            } catch (error) {
                console.error("刪除價格時出錯:", error);
                showAppMessage(`刪除失敗：${error.message}`);
            } finally {
                if (bsDeleteModalInstance.value) {
                    bsDeleteModalInstance.value.hide();
                }
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
                const priceMatch = item.price !== null && item.price.toString().toLowerCase().includes(term);
                return dateMatch || priceMatch;
            });
        });

        onMounted(() => {
            loadPrices();
            loadUsers();
            // 初始化 Bootstrap modals
            // deleteModal.value will be the DOM element due to ref="deleteModal" in template
            if (deleteModal.value) {
                try {
                    bsDeleteModalInstance.value = new bootstrap.Modal(deleteModal.value);
                } catch (error) {
                    console.error("Failed to initialize Bootstrap delete modal:", error);
                    showAppMessage("刪除確認視窗初始化失敗。");
                }
            } else {
                console.error("Delete modal DOM element (ref='deleteModal') not found in onMounted.");
                showAppMessage("找不到刪除確認視窗的 DOM 元素。");
            }
        });

        return {
            date,
            price,
            editDate,
            isEditing,
            allPricesData,
            searchTerm,
            dateToDelete,
            deleteModal, // Keep this in return if other parts of your setup/template might rely on it (though direct usage is now via bsDeleteModalInstance for control)
            // bsDeleteModalInstance is not explicitly returned as it's used internally by confirmDelete/deletePrice
            usersList,
            formatCurrency,
            loadPrices,
            loadUsers,
            updateUserRole,
            handleSave,
            populateFormForEdit,
            cancelEdit,
            resetForm,
            confirmDelete,
            deletePrice,
            applyFilter,
            resetFilter,
            filteredPrices,
            showAppMessage, // 確保返回
        };
    },
};
</script>

<style scoped>
/* 如需自訂樣式，可在此添加 */
</style>
