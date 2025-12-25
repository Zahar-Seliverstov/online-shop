<template>
    <div class="profile-page">
        <div class="container">
            <h1 class="page-title">Личный кабинет</h1>

            <div class="profile-content">
                <div class="profile-sidebar">
                    <div class="card">
                        <div class="card-body">
                            <div class="user-avatar-large">
                                {{ userInitials }}
                            </div>
                            <h2 class="user-name">{{ authStore.userName }}</h2>
                            <p class="user-email">
                                {{ authStore.user?.email }}
                            </p>

                            <div class="user-role">
                                <span
                                    class="badge"
                                    :class="
                                        authStore.isAdmin
                                            ? 'badge-primary'
                                            : 'badge-success'
                                    "
                                >
                                    {{
                                        authStore.isAdmin
                                            ? "Администратор"
                                            : "Пользователь"
                                    }}
                                </span>
                            </div>

                            <div class="divider"></div>

                            <router-link
                                v-if="authStore.isAdmin"
                                to="/admin"
                                class="btn btn-outline"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                    />
                                </svg>
                                Админ-панель
                            </router-link>

                            <button
                                class="btn btn-text text-error"
                                @click="handleLogout"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                                    />
                                </svg>
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>

                <div class="orders-section">
                    <h2 class="section-title">История заказов</h2>

                    <div v-if="loadingOrders" class="loading-container">
                        <div class="spinner"></div>
                        <p>Загрузка заказов...</p>
                    </div>

                    <div v-else-if="orders.length === 0" class="empty-state">
                        <svg
                            width="120"
                            height="120"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1"
                        >
                            <path
                                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                            ></path>
                            <polyline
                                points="3.27 6.96 12 12.01 20.73 6.96"
                            ></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        <h3>Заказов пока нет</h3>
                        <p>Оформите первый заказ в нашем магазине</p>
                        <router-link to="/catalog" class="btn btn-primary">
                            Перейти в каталог
                        </router-link>
                    </div>

                    <div v-else class="orders-list">
                        <div
                            v-for="order in orders"
                            :key="order.id"
                            class="order-card card"
                        >
                            <div class="order-header">
                                <div class="order-info">
                                    <h3 class="order-id">
                                        Заказ #{{ order.id.slice(0, 8) }}
                                    </h3>
                                    <p class="order-date">
                                        {{ formatDate(order.createdAt) }}
                                    </p>
                                </div>
                                <span
                                    class="badge"
                                    :class="getStatusClass(order.status)"
                                >
                                    {{ getStatusText(order.status) }}
                                </span>
                            </div>

                            <div class="order-items">
                                <div
                                    v-for="item in order.orderItems"
                                    :key="item.id"
                                    class="order-item"
                                >
                                    <img
                                        :src="item.product.imageUrl"
                                        :alt="item.product.name"
                                        class="item-image"
                                    />
                                    <div class="item-details">
                                        <p class="item-name">
                                            {{ item.product.name }}
                                        </p>
                                        <p class="item-quantity">
                                            {{ item.quantity }} шт. ×
                                            {{ formatPrice(item.price) }} ₽
                                        </p>
                                    </div>
                                    <p class="item-total">
                                        {{
                                            formatPrice(
                                                item.price * item.quantity
                                            )
                                        }}
                                        ₽
                                    </p>
                                </div>
                            </div>

                            <div class="order-footer">
                                <span class="order-total-label">Итого:</span>
                                <span class="order-total"
                                    >{{ formatPrice(order.totalPrice) }} ₽</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";

const router = useRouter();
const authStore = useAuthStore();

const orders = ref([]);
const loadingOrders = ref(true);

const userInitials = computed(() => {
    if (!authStore.user?.name)
        return authStore.user?.email?.charAt(0).toUpperCase() || "U";
    const names = authStore.user.name.split(" ");
    return names
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
});

const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const getStatusText = (status) => {
    const statusMap = {
        PENDING: "Ожидает обработки",
        PROCESSING: "В обработке",
        COMPLETED: "Завершен",
        CANCELLED: "Отменен",
    };
    return statusMap[status] || status;
};

const getStatusClass = (status) => {
    const classMap = {
        PENDING: "badge-warning",
        PROCESSING: "badge-primary",
        COMPLETED: "badge-success",
        CANCELLED: "badge-error",
    };
    return classMap[status] || "badge-primary";
};

const fetchOrders = async () => {
    try {
        loadingOrders.value = true;
        const data = await api.getOrders();
        orders.value = data;
    } catch (error) {
        console.error("Fetch orders error:", error);
    } finally {
        loadingOrders.value = false;
    }
};

const handleLogout = async () => {
    await authStore.logout();
    router.push("/");
};

onMounted(() => {
    fetchOrders();
});
</script>

<style scoped>
.profile-page {
    padding: var(--spacing-xl) 0;
    min-height: calc(100vh - 80px);
}

.page-title {
    margin-bottom: var(--spacing-xl);
}

.profile-content {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: var(--spacing-xl);
    align-items: start;
}

.profile-sidebar .card {
    position: sticky;
    top: 100px;
}

.user-avatar-large {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 2.5rem;
    margin: 0 auto var(--spacing-lg);
}

.user-name {
    text-align: center;
    margin-bottom: var(--spacing-xs);
    font-size: 1.5rem;
}

.user-email {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
}

.user-role {
    display: flex;
    justify-content: center;
    margin-bottom: var(--spacing-lg);
}

.profile-sidebar .btn {
    width: 100%;
    margin-top: var(--spacing-sm);
}

.section-title {
    font-size: 1.75rem;
    margin-bottom: var(--spacing-lg);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    gap: var(--spacing-md);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-xl);
}

.empty-state svg {
    margin: 0 auto var(--spacing-lg);
    opacity: 0.3;
    color: var(--text-secondary);
}

.empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.order-card {
    overflow: hidden;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--background);
}

.order-info {
    flex: 1;
}

.order-id {
    font-size: 1.125rem;
    margin: 0 0 var(--spacing-xs) 0;
}

.order-date {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
}

.order-items {
    padding: var(--spacing-lg);
}

.order-item {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: var(--spacing-md);
    align-items: center;
    padding: var(--spacing-md) 0;
}

.order-item:not(:last-child) {
    border-bottom: 1px solid var(--divider);
}

.item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.item-details {
    flex: 1;
}

.item-name {
    font-weight: 500;
    margin: 0 0 var(--spacing-xs) 0;
}

.item-quantity {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
}

.item-total {
    font-weight: 600;
    color: var(--primary);
    margin: 0;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--background);
    border-top: 2px solid var(--divider);
}

.order-total-label {
    font-weight: 600;
    font-size: 1.125rem;
}

.order-total {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
}

@media (max-width: 1199px) {
    .profile-content {
        grid-template-columns: 1fr;
    }

    .profile-sidebar .card {
        position: static;
    }
}
</style>
