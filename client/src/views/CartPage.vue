<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// Локальные состояния для UI
const creatingOrder = ref(false);
const pendingIds = ref(new Set()); // Храним ID товаров, которые в процессе обновления

const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(price);
};

// Проверка, занят ли конкретный товар
const isItemPending = (itemId) => pendingIds.value.has(itemId);

const updateQuantity = async (itemId, newQuantity) => {
    // Валидация на фронте
    if (newQuantity < 1 || isItemPending(itemId)) return;

    const item = cartStore.items.find((i) => i.id === itemId);
    if (item && newQuantity > item.product.stock) return;

    try {
        pendingIds.value.add(itemId);
        await cartStore.updateQuantity(itemId, newQuantity);
    } catch (err) {
        console.error("Update quantity failed:", err);
        // Здесь можно добавить Toast уведомление
    } finally {
        pendingIds.value.delete(itemId);
    }
};

const removeItem = async (itemId) => {
    if (isItemPending(itemId)) return;

    // Используем более мягкое подтверждение или кастомное модальное окно
    if (!confirm("Удалить товар из корзины?")) return;

    try {
        pendingIds.value.add(itemId);
        await cartStore.removeItem(itemId);
    } catch (err) {
        console.error("Remove item failed:", err);
    } finally {
        pendingIds.value.delete(itemId);
    }
};

const clearCart = async () => {
    if (cartStore.items.length === 0) return;
    if (!confirm("Очистить всю корзину?")) return;

    try {
        await cartStore.clearCart();
    } catch (err) {
        console.error("Clear cart failed:", err);
    }
};

const createOrder = async () => {
    if (creatingOrder.value || cartStore.items.length === 0) return;

    creatingOrder.value = true;
    try {
        const response = await api.createOrder();

        if (response?.order) {
            // Очищаем корзину в сторе после успешного заказа, если бэкенд этого не сделал сам
            await cartStore.fetchCart();
            router.push({ name: "Profile", query: { orderSuccess: "true" } });
        }
    } catch (error) {
        const message =
            error.response?.data?.message || "Ошибка при оформлении заказа";
        alert(message);
        console.error("Create order error:", error);
    } finally {
        creatingOrder.value = false;
    }
};
</script>

<template>
    <div class="cart-page">
        <div class="container">
            <h1 class="page-title">Корзина</h1>

            <div
                v-if="cartStore.loading && !cartStore.items.length"
                class="loading-container"
            >
                <div class="spinner"></div>
                <p>Загрузка корзины...</p>
            </div>

            <div v-else-if="cartStore.items.length === 0" class="empty-cart">
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1"
                >
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path
                        d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                    ></path>
                </svg>
                <h2>Корзина пуста</h2>
                <p>Добавьте товары из каталога, чтобы начать покупки</p>
                <router-link to="/catalog" class="btn btn-primary btn-lg">
                    Перейти в каталог
                </router-link>
            </div>

            <div v-else class="cart-content fade-in">
                <div class="cart-items">
                    <div
                        v-for="item in cartStore.items"
                        :key="item.id"
                        class="cart-item card"
                        :class="{
                            'opacity-50 pointer-events-none': isItemPending(
                                item.id
                            ),
                        }"
                    >
                        <router-link
                            :to="`/product/${item.product.id}`"
                            class="item-image-link"
                        >
                            <img
                                :src="item.product.imageUrl"
                                :alt="item.product.name"
                                class="item-image"
                                loading="lazy"
                            />
                        </router-link>

                        <div class="item-info">
                            <router-link
                                :to="`/product/${item.product.id}`"
                                class="item-name-link"
                            >
                                <h3 class="item-name">
                                    {{ item.product.name }}
                                </h3>
                            </router-link>
                            <p class="item-category">
                                {{ item.product.category?.name }}
                            </p>
                            <p class="item-price">
                                {{ formatPrice(item.product.price) }}
                            </p>
                        </div>

                        <div class="item-actions">
                            <div class="quantity-controls">
                                <button
                                    class="btn btn-icon btn-sm"
                                    :disabled="
                                        item.quantity <= 1 ||
                                        isItemPending(item.id)
                                    "
                                    @click="
                                        updateQuantity(
                                            item.id,
                                            item.quantity - 1
                                        )
                                    "
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M19 13H5v-2h14v2z" />
                                    </svg>
                                </button>

                                <span class="quantity">{{
                                    item.quantity
                                }}</span>

                                <button
                                    class="btn btn-icon btn-sm"
                                    :disabled="
                                        item.quantity >= item.product.stock ||
                                        isItemPending(item.id)
                                    "
                                    @click="
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1
                                        )
                                    "
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path
                                            d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div class="item-total">
                                <span class="label">Итого:</span>
                                <span class="price">
                                    {{
                                        formatPrice(
                                            item.product.price * item.quantity
                                        )
                                    }}
                                </span>
                            </div>

                            <button
                                class="btn btn-text text-error"
                                :disabled="isItemPending(item.id)"
                                @click="removeItem(item.id)"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                                    />
                                </svg>
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>

                <aside class="cart-summary card">
                    <h2 class="summary-title">Итого</h2>

                    <div class="summary-row">
                        <span>Товаров:</span>
                        <span class="font-semibold"
                            >{{ cartStore.totalItems }} шт.</span
                        >
                    </div>

                    <div class="divider"></div>

                    <div class="summary-row total">
                        <span class="font-bold">Сумма:</span>
                        <span class="total-price">{{
                            formatPrice(cartStore.totalPrice)
                        }}</span>
                    </div>

                    <template v-if="authStore.isAuthenticated">
                        <button
                            class="btn btn-primary btn-lg"
                            :disabled="
                                creatingOrder || cartStore.items.length === 0
                            "
                            @click="createOrder"
                        >
                            <span
                                v-if="creatingOrder"
                                class="spinner-sm"
                            ></span>
                            {{
                                creatingOrder
                                    ? "Оформление..."
                                    : "Оформить заказ"
                            }}
                        </button>
                    </template>

                    <div v-else class="auth-prompt">
                        <p>Для оформления заказа необходимо войти в аккаунт</p>
                        <router-link
                            :to="{
                                name: 'Login',
                                query: { redirect: '/cart' },
                            }"
                            class="btn btn-primary btn-lg"
                        >
                            Войти
                        </router-link>
                    </div>

                    <button
                        class="btn btn-outline"
                        :disabled="creatingOrder"
                        @click="clearCart"
                    >
                        Очистить корзину
                    </button>
                </aside>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cart-page {
    padding: var(--spacing-xl) 0;
    min-height: calc(100vh - 80px);
}

.page-title {
    margin-bottom: var(--spacing-xl);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    gap: var(--spacing-md);
}

.empty-cart {
    text-align: center;
    padding: var(--spacing-xl);
}

.empty-cart svg {
    margin: 0 auto var(--spacing-lg);
    opacity: 0.3;
    color: var(--text-secondary);
}

.empty-cart h2 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
}

.empty-cart p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
}

.cart-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--spacing-xl);
    align-items: start;
}

.cart-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.cart-item {
    display: grid;
    grid-template-columns: 120px 1fr auto;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
}

.item-image-link {
    display: block;
}

.item-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.item-name-link {
    text-decoration: none;
    color: inherit;
}

.item-name {
    font-size: 1.25rem;
    margin: 0;
    transition: var(--transition);
}

.item-name-link:hover .item-name {
    color: var(--primary);
}

.item-category {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
}

.item-price {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--primary);
    margin: 0;
}

.item-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-end;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.quantity {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
    font-size: 1.125rem;
}

.item-total {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--spacing-xs);
}

.item-total .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
}

.item-total .price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
}

.cart-summary {
    position: sticky;
    top: 100px;
    padding: var(--spacing-xl);
}

.summary-title {
    margin-bottom: var(--spacing-lg);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-sm) 0;
    font-size: 1rem;
}

.summary-row.total {
    font-size: 1.25rem;
    padding: var(--spacing-md) 0;
}

.total-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
}

.cart-summary .btn {
    width: 100%;
    margin-top: var(--spacing-lg);
}

.auth-prompt {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--background);
    border-radius: var(--radius-sm);
    text-align: center;
}

.auth-prompt p {
    margin: 0;
    color: var(--text-secondary);
}

@media (max-width: 1199px) {
    .cart-content {
        grid-template-columns: 1fr;
    }

    .cart-summary {
        position: static;
    }

    .cart-item {
        grid-template-columns: 80px 1fr;
        gap: var(--spacing-md);
    }

    .item-image {
        width: 80px;
        height: 80px;
    }

    .item-actions {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .item-total {
        flex-direction: row;
        gap: var(--spacing-sm);
    }

    .item-total .label {
        display: none;
    }
}
</style>
