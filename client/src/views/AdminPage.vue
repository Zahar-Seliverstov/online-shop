<template>
    <div class="admin-page">
        <div class="container-fluid">
            <h1 class="page-title">Панель администратора</h1>

            <!-- Statistics -->
            <div v-if="stats" class="stats-grid">
                <div class="stat-card card">
                    <div
                        class="stat-icon"
                        style="
                            background: rgba(25, 118, 210, 0.1);
                            color: var(--primary);
                        "
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                            />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Товаров</p>
                        <p class="stat-value">{{ stats.totalProducts }}</p>
                    </div>
                </div>

                <div class="stat-card card">
                    <div
                        class="stat-icon"
                        style="
                            background: rgba(76, 175, 80, 0.1);
                            color: var(--success);
                        "
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                            />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Заказов</p>
                        <p class="stat-value">{{ stats.totalOrders }}</p>
                    </div>
                </div>

                <div class="stat-card card">
                    <div
                        class="stat-icon"
                        style="
                            background: rgba(245, 0, 87, 0.1);
                            color: var(--secondary);
                        "
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                            />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Пользователей</p>
                        <p class="stat-value">{{ stats.totalUsers }}</p>
                    </div>
                </div>

                <div class="stat-card card">
                    <div
                        class="stat-icon"
                        style="
                            background: rgba(255, 152, 0, 0.1);
                            color: var(--warning);
                        "
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
                            />
                        </svg>
                    </div>
                    <div class="stat-info">
                        <p class="stat-label">Выручка</p>
                        <p class="stat-value">
                            {{ formatPrice(stats.totalRevenue) }} ₽
                        </p>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="tabs">
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'products' }"
                    @click="activeTab = 'products'"
                >
                    Товары
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'orders' }"
                    @click="activeTab = 'orders'"
                >
                    Заказы
                </button>
            </div>

            <!-- Products Tab -->
            <div v-if="activeTab === 'products'" class="tab-content">
                <div class="section-header">
                    <h2>Управление товарами</h2>
                    <button class="btn btn-primary" @click="openProductModal()">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                        Добавить товар
                    </button>
                </div>

                <div v-if="loadingProducts" class="loading-container">
                    <div class="spinner"></div>
                </div>

                <div v-else class="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Изображение</th>
                                <th>Название</th>
                                <th>Категория</th>
                                <th>Цена</th>
                                <th>Остаток</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in products" :key="product.id">
                                <td>{{ product.id }}</td>
                                <td>
                                    <img
                                        :src="product.imageUrl"
                                        :alt="product.name"
                                        class="product-thumb"
                                    />
                                </td>
                                <td class="font-semibold">
                                    {{ product.name }}
                                </td>
                                <td>{{ product.category.name }}</td>
                                <td class="text-primary font-semibold">
                                    {{ formatPrice(product.price) }} ₽
                                </td>
                                <td>
                                    <span
                                        class="badge"
                                        :class="
                                            product.stock > 0
                                                ? 'badge-success'
                                                : 'badge-error'
                                        "
                                    >
                                        {{ product.stock }} шт.
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button
                                            class="btn btn-icon btn-sm"
                                            title="Редактировать"
                                            @click="openProductModal(product)"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path
                                                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            class="btn btn-icon btn-sm text-error"
                                            title="Удалить"
                                            @click="deleteProduct(product)"
                                        >
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path
                                                    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Orders Tab -->
            <div v-if="activeTab === 'orders'" class="tab-content">
                <h2>Заказы</h2>

                <div v-if="loadingOrders" class="loading-container">
                    <div class="spinner"></div>
                </div>

                <div v-else class="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Дата</th>
                                <th>Пользователь</th>
                                <th>Сумма</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="order in orders" :key="order.id">
                                <tr>
                                    <td class="font-semibold">
                                        #{{ order.id.slice(0, 8) }}
                                    </td>
                                    <td>{{ formatDate(order.createdAt) }}</td>
                                    <td>{{ order.user.email }}</td>
                                    <td class="text-primary font-semibold">
                                        {{ formatPrice(order.totalPrice) }} ₽
                                    </td>
                                    <td>
                                        <select
                                            v-model="order.status"
                                            class="status-select"
                                            :class="
                                                getStatusClass(order.status)
                                            "
                                            @change="updateOrderStatus(order)"
                                        >
                                            <option value="PENDING">
                                                Ожидает
                                            </option>
                                            <option value="PROCESSING">
                                                В обработке
                                            </option>
                                            <option value="COMPLETED">
                                                Завершен
                                            </option>
                                            <option value="CANCELLED">
                                                Отменен
                                            </option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-text btn-sm"
                                            @click="
                                                toggleOrderDetails(order.id)
                                            "
                                        >
                                            {{
                                                expandedOrders.includes(
                                                    order.id
                                                )
                                                    ? "Скрыть"
                                                    : "Детали"
                                            }}
                                        </button>
                                    </td>
                                </tr>

                                <tr v-if="expandedOrders.includes(order.id)">
                                    <td colspan="6" class="order-details-cell">
                                        <div class="order-details">
                                            <h4>Товары в заказе:</h4>
                                            <div class="order-items">
                                                <div
                                                    v-for="item in order.orderItems"
                                                    :key="item.id"
                                                    class="order-item"
                                                >
                                                    <img
                                                        :src="
                                                            item.product
                                                                .imageUrl
                                                        "
                                                        :alt="item.product.name"
                                                        class="item-thumb"
                                                    />
                                                    <span>{{
                                                        item.product.name
                                                    }}</span>
                                                    <span
                                                        >{{ item.quantity }} шт.
                                                        ×
                                                        {{
                                                            formatPrice(
                                                                item.price
                                                            )
                                                        }}
                                                        ₽</span
                                                    >
                                                    <span class="font-semibold"
                                                        >=
                                                        {{
                                                            formatPrice(
                                                                item.price *
                                                                    item.quantity
                                                            )
                                                        }}
                                                        ₽</span
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Product Modal -->
        <div
            v-if="showProductModal"
            class="modal-overlay"
            @click="closeProductModal"
        >
            <div class="modal-content card" @click.stop>
                <div class="modal-header">
                    <h2>
                        {{
                            editingProduct
                                ? "Редактировать товар"
                                : "Добавить товар"
                        }}
                    </h2>
                    <button class="btn btn-icon" @click="closeProductModal">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                            />
                        </svg>
                    </button>
                </div>

                <form @submit.prevent="saveProduct" class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Название *</label>
                        <input
                            v-model="productForm.name"
                            type="text"
                            class="form-control"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Описание *</label>
                        <textarea
                            v-model="productForm.description"
                            class="form-control"
                            rows="3"
                            required
                        ></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Цена *</label>
                            <input
                                v-model.number="productForm.price"
                                type="number"
                                min="0"
                                step="0.01"
                                class="form-control"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Остаток *</label>
                            <input
                                v-model.number="productForm.stock"
                                type="number"
                                min="0"
                                class="form-control"
                                required
                            />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Категория *</label>
                        <select
                            v-model.number="productForm.categoryId"
                            class="form-control"
                            required
                        >
                            <option :value="null" disabled>
                                Выберите категорию
                            </option>
                            <option
                                v-for="category in categories"
                                :key="category.id"
                                :value="category.id"
                            >
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">URL изображения *</label>
                        <input
                            v-model="productForm.imageUrl"
                            type="url"
                            class="form-control"
                            required
                        />
                    </div>

                    <div v-if="productForm.imageUrl" class="image-preview">
                        <img :src="productForm.imageUrl" alt="Preview" />
                    </div>

                    <div class="modal-actions">
                        <button
                            type="button"
                            class="btn btn-outline"
                            @click="closeProductModal"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            class="btn btn-primary"
                            :disabled="savingProduct"
                        >
                            <span
                                v-if="savingProduct"
                                class="spinner"
                                style="
                                    width: 16px;
                                    height: 16px;
                                    border-width: 2px;
                                "
                            ></span>
                            {{ savingProduct ? "Сохранение..." : "Сохранить" }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import api from "../services/api";

const activeTab = ref("products");
const stats = ref(null);
const products = ref([]);
const orders = ref([]);
const categories = ref([]);
const loadingProducts = ref(true);
const loadingOrders = ref(true);
const expandedOrders = ref([]);

const showProductModal = ref(false);
const editingProduct = ref(null);
const savingProduct = ref(false);

const productForm = reactive({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: null,
    imageUrl: "",
});

const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const getStatusClass = (status) => {
    const classMap = {
        PENDING: "status-pending",
        PROCESSING: "status-processing",
        COMPLETED: "status-completed",
        CANCELLED: "status-cancelled",
    };
    return classMap[status] || "";
};

const fetchStats = async () => {
    try {
        const data = await api.getAdminStats();
        stats.value = data.stats;
    } catch (error) {
        console.error("Fetch stats error:", error);
    }
};

const fetchProducts = async () => {
    try {
        loadingProducts.value = true;
        const data = await api.getAdminProducts();
        products.value = data;
    } catch (error) {
        console.error("Fetch products error:", error);
    } finally {
        loadingProducts.value = false;
    }
};

const fetchOrders = async () => {
    try {
        loadingOrders.value = true;
        const data = await api.getAdminOrders();
        orders.value = data;
    } catch (error) {
        console.error("Fetch orders error:", error);
    } finally {
        loadingOrders.value = false;
    }
};

const fetchCategories = async () => {
    try {
        const data = await api.getCategories();
        categories.value = data;
    } catch (error) {
        console.error("Fetch categories error:", error);
    }
};

const openProductModal = (product = null) => {
    editingProduct.value = product;

    if (product) {
        productForm.name = product.name;
        productForm.description = product.description;
        productForm.price = product.price;
        productForm.stock = product.stock;
        productForm.categoryId = product.categoryId;
        productForm.imageUrl = product.imageUrl;
    } else {
        productForm.name = "";
        productForm.description = "";
        productForm.price = 0;
        productForm.stock = 0;
        productForm.categoryId = null;
        productForm.imageUrl = "";
    }

    showProductModal.value = true;
};

const closeProductModal = () => {
    showProductModal.value = false;
    editingProduct.value = null;
};

const saveProduct = async () => {
    // Проверка на заполненность категории (защита от null)
    if (!productForm.categoryId) {
        alert("Пожалуйста, выберите категорию");
        return;
    }

    savingProduct.value = true;

    try {
        // Создаем копию данных с явным приведением типов
        // Это гарантирует, что express-validator на бэкенде увидит числа, а не строки
        const payload = {
            name: productForm.name.trim(),
            description: productForm.description.trim(),
            price: Number(productForm.price),
            stock: Number(productForm.stock),
            categoryId: Number(productForm.categoryId),
            imageUrl: productForm.imageUrl.trim(),
        };

        if (editingProduct.value) {
            await api.updateProduct(editingProduct.value.id, payload);
        } else {
            await api.createProduct(payload);
        }

        closeProductModal();
        await Promise.all([fetchProducts(), fetchStats()]);
    } catch (error) {
        console.error("Save product error:", error);

        // Попробуем вывести конкретную ошибку от сервера (например, "ID категории обязателен")
        const serverMessage =
            error.response?.data?.errors?.[0]?.msg ||
            error.response?.data?.error ||
            "Ошибка при сохранении товара";

        alert(serverMessage);
    } finally {
        savingProduct.value = false;
    }
};

const deleteProduct = async (product) => {
    if (!confirm(`Удалить товар "${product.name}"?`)) return;

    try {
        await api.deleteProduct(product.id);
        fetchProducts();
        fetchStats();
    } catch (error) {
        console.error("Delete product error:", error);
        alert("Ошибка при удалении товара");
    }
};

const updateOrderStatus = async (order) => {
    try {
        await api.updateOrderStatus(order.id, order.status);
    } catch (error) {
        console.error("Update order status error:", error);
        alert("Ошибка при обновлении статуса");
    }
};

const toggleOrderDetails = (orderId) => {
    const index = expandedOrders.value.indexOf(orderId);
    if (index > -1) {
        expandedOrders.value.splice(index, 1);
    } else {
        expandedOrders.value.push(orderId);
    }
};

onMounted(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchCategories();
});
</script>

<style scoped>
.admin-page {
    padding: var(--spacing-xl) 0;
    min-height: calc(100vh - 80px);
}

.container-fluid {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

.page-title {
    margin-bottom: var(--spacing-xl);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.stat-card {
    padding: var(--spacing-lg);
    display: flex;
    gap: var(--spacing-lg);
    align-items: center;
}

.stat-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-info {
    flex: 1;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0 0 var(--spacing-xs) 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
}

.tabs {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    border-bottom: 2px solid var(--divider);
}

.tab-btn {
    padding: var(--spacing-md) var(--spacing-lg);
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    margin-bottom: -2px;
}

.tab-btn:hover {
    color: var(--primary);
}

.tab-btn.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}

.tab-content {
    animation: fadeIn 0.3s ease-out;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.section-header h2 {
    margin: 0;
}

.loading-container {
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl);
}

.products-table,
.orders-table {
    background: var(--surface);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: 0 2px 8px var(--shadow);
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: var(--background);
}

th {
    padding: var(--spacing-md) var(--spacing-lg);
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}

td {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--divider);
}

.product-thumb,
.item-thumb {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.action-buttons {
    display: flex;
    gap: var(--spacing-xs);
}

.status-select {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 2px solid;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
}

.status-pending {
    border-color: var(--warning);
    color: var(--warning);
    background: rgba(255, 152, 0, 0.1);
}

.status-processing {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(25, 118, 210, 0.1);
}

.status-completed {
    border-color: var(--success);
    color: var(--success);
    background: rgba(76, 175, 80, 0.1);
}

.status-cancelled {
    border-color: var(--error);
    color: var(--error);
    background: rgba(244, 67, 54, 0.1);
}

.order-details-cell {
    background: var(--background);
    padding: var(--spacing-lg);
}

.order-details h4 {
    margin-bottom: var(--spacing-md);
}

.order-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.order-item {
    display: grid;
    grid-template-columns: 50px 1fr auto auto;
    gap: var(--spacing-md);
    align-items: center;
    padding: var(--spacing-sm);
    background: var(--surface);
    border-radius: var(--radius-sm);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);
}

.modal-content {
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    animation: fadeIn 0.2s ease-out;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--divider);
}

.modal-header h2 {
    margin: 0;
}

.modal-body {
    padding: var(--spacing-lg);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
}

.image-preview {
    margin-top: var(--spacing-md);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.image-preview img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
}

.modal-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    margin-top: var(--spacing-lg);
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
    }

    .section-header .btn {
        width: 100%;
    }

    .products-table,
    .orders-table {
        overflow-x: auto;
    }

    table {
        min-width: 800px;
    }
}
</style>
