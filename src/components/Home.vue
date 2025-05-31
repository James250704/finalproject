<template>
    <div class="container mt-5 pt-4">
        <h1 class="mb-4">黃金價格趨勢圖</h1>
        <div class="row mb-3">
            <div class="col-md-4">
                <label for="searchDate" class="form-label"
                    >搜尋特定日期 (YYYY-MM-DD):</label
                >
                <input
                    type="date"
                    v-model="searchDate"
                    class="form-control"
                    id="searchDate"
                    ref="searchDateInputEl"
                    @click="handleDateInputClick"
                />
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button @click="handleSearch" class="btn btn-primary w-100">
                    搜尋
                </button>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button @click="handleReset" class="btn btn-secondary w-100">
                    重置
                </button>
            </div>
        </div>
        <div
            v-html="searchResult"
            class="mt-2 mb-3"
            style="min-height: 2em"
        ></div>
        <div>
            <canvas ref="chartCanvas"></canvas>
        </div>
    </div>
</template>

<script>
import { onMounted, ref } from "vue";
import Chart from "chart.js/auto";

export default {
    name: "HomePage",
    setup() {
        const searchDate = ref("");
        const searchResult = ref("");
        const chartInstance = ref(null);
        const chartCanvas = ref(null);
        const searchDateInputEl = ref(null); // Added

        const fetchAllDataAndRenderChart = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/goldPrices"
                );
                if (!response.ok) {
                    throw new Error(`HTTP 錯誤！狀態：${response.status}`);
                }
                const result = await response.json();
                let prices = Array.isArray(result.data) ? result.data : [];
                prices.sort((a, b) => new Date(a.date) - new Date(b.date));
                const labels = prices.map((item) => item.date);
                const dataPoints = prices.map((item) => item.price);

                if (chartInstance.value) {
                    chartInstance.value.destroy();
                }

                chartInstance.value = new Chart(
                    chartCanvas.value.getContext("2d"),
                    {
                        type: "line",
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: "黃金價格 (美元/盎司)",
                                    data: dataPoints,
                                    borderColor: "rgb(255, 205, 86)",
                                    backgroundColor: "rgba(255, 205, 86, 0.2)",
                                    tension: 0.1,
                                    fill: true,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    title: {
                                        display: true,
                                        text: "價格 (美元)",
                                    },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: "日期",
                                    },
                                },
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label(context) {
                                            let label =
                                                context.dataset.label || "";
                                            if (label) {
                                                label += ": ";
                                            }
                                            if (context.parsed.y !== null) {
                                                label += new Intl.NumberFormat(
                                                    "en-US",
                                                    {
                                                        style: "currency",
                                                        currency: "USD",
                                                    }
                                                ).format(context.parsed.y);
                                            }
                                            return label;
                                        },
                                    },
                                },
                            },
                        },
                    }
                );

                if (prices.length === 0) {
                    const ctx = chartCanvas.value.getContext("2d");
                    ctx.font = "20px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(
                        "目前沒有黃金價格資料可顯示",
                        ctx.canvas.width / 2,
                        ctx.canvas.height / 2
                    );
                }
            } catch (error) {
                console.error("無法獲取或渲染黃金價格圖表:", error);
                searchResult.value =
                    '<p class="text-danger">無法載入圖表資料，請稍後再試。</p>';
            }
        };

        const fetchAndDisplaySingleDatePrice = async (date) => {
            searchResult.value = "";
            try {
                const response = await fetch(
                    `http://localhost:3000/api/goldPrices/${date}`
                );
                if (!response.ok) {
                    if (response.status === 404) {
                        searchResult.value = `<p class="text-warning">找不到日期 ${date} 的黃金價格資料。</p>`;
                    } else {
                        throw new Error(`HTTP 錯誤！狀態：${response.status}`);
                    }
                    return;
                }
                const result = await response.json();
                if (result.data && result.data.price !== undefined) {
                    const formattedPrice = new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(result.data.price);
                    searchResult.value = `<p class="text-success">日期 ${date} 的黃金價格為：<strong>${formattedPrice}</strong></p>`;
                } else {
                    searchResult.value = `<p class="text-warning">找不到日期 ${date} 的黃金價格資料。</p>`;
                }
            } catch (error) {
                console.error(`無法獲取日期 ${date} 的價格:`, error);
                searchResult.value = `<p class="text-danger">查詢日期 ${date} 的價格時發生錯誤。</p>`;
            }
        };
        const handleDateInputClick = () => {
            // Added
            if (searchDateInputEl.value) {
                if (typeof searchDateInputEl.value.showPicker === "function") {
                    try {
                        searchDateInputEl.value.showPicker();
                    } catch (e) {
                        console.error("Error trying to show date picker:", e);
                        searchDateInputEl.value.focus(); // Fallback to focus
                    }
                } else {
                    searchDateInputEl.value.focus(); // Fallback for browsers that don't support showPicker
                }
            }
        };
        const handleSearch = () => {
            if (searchDate.value) {
                if (/^\d{4}-\d{2}-\d{2}$/.test(searchDate.value)) {
                    fetchAndDisplaySingleDatePrice(searchDate.value);
                } else {
                    searchResult.value =
                        '<p class="text-danger">請輸入有效的日期格式 (YYYY-MM-DD)。</p>';
                }
            } else {
                searchResult.value =
                    '<p class="text-warning">請輸入要搜尋的日期。</p>';
            }
        };

        const handleReset = () => {
            searchDate.value = "";
            searchResult.value = "";
            fetchAllDataAndRenderChart();
        };

        onMounted(() => {
            fetchAllDataAndRenderChart();
        });

        return {
            searchDate,
            searchResult,
            chartCanvas,
            handleSearch,
            handleReset,
            searchDateInputEl, // Added
            handleDateInputClick, // Added
        };
    },
};
</script>

<style scoped>
/* 如需自訂樣式，可在此添加 */
</style>
