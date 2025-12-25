<template>
    <div class="product-page">
        <div class="container">
            <div v-if="loading" class="loading-container">
                <div class="spinner"></div>
                <p>Загрузка товара...</p>
            </div>

            <div v-else-if="error" class="alert alert-error">
                {{ error }}
                <router-link to="/catalog" class="btn btn-primary mt-md">
                    Вернуться в каталог
                </router-link>
            </div>

            <div v-else-if="product" class="product-content fade-in">
                <button class="back-btn btn btn-text" @click="$router.back()">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                        />
                    </svg>
                    Назад
                </button>

                <div class="product-layout">
                    <div class="product-image-section">
                        <img
                            :src="product.imageUrl"
                            :alt="product.name"
                            class="product-image"
                        />
                    </div>

                    <div class="product-info-section">
                        <span class="badge badge-primary">{{
                            product.category.name
                        }}</span>

                        <h1 class="product-title">{{ product.name }}</h1>

                        <div class="product-price-block">
                            <span class="product-price"
                                >{{ formatPrice(product.price) }} ₽</span
                            >
                            <span
                                v-if="product.stock > 0"
                                class="stock-status in-stock"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                    />
                                </svg>
                                В наличии: {{ product.stock }} шт.
                            </span>
                            <span v-else class="stock-status out-of-stock">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                                    />
                                </svg>
                                Нет в наличии
                            </span>
                        </div>

                        <div class="product-description">
                            <h3>Описание</h3>
                            <p>{{ product.description }}</p>
                        </div>

                        <div class="product-actions">
                            <div class="quantity-selector">
                                <label>Количество:</label>
                                <div class="quantity-controls">
                                    <button
                                        class="btn btn-icon btn-sm"
                                        :disabled="quantity <= 1"
                                        @click="quantity--"
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
                                    <input
                                        v-model.number="quantity"
                                        type="number"
                                        min="1"
                                        :max="product.stock"
                                        class="quantity-input"
                                    />
                                    <button
                                        class="btn btn-icon btn-sm"
                                        :disabled="quantity >= product.stock"
                                        @click="quantity++"
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
                            </div>

                            <button
                                class="btn btn-primary btn-lg"
                                :disabled="product.stock === 0 || addingToCart"
                                @click="handleAddToCart"
                            >
                                <svg
                                    v-if="!addingToCart"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"
                                    />
                                </svg>
                                <span
                                    v-if="addingToCart"
                                    class="spinner"
                                    style="
                                        width: 20px;
                                        height: 20px;
                                        border-width: 2px;
                                    "
                                ></span>
                                {{
                                    addingToCart
                                        ? "Добавление..."
                                        : "Добавить в корзину"
                                }}
                            </button>

                            <div
                                v-if="successMessage"
                                class="alert alert-success"
                            >
                                {{ successMessage }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";
import { useCartStore } from "../stores/cart";

const route = useRoute();
const cartStore = useCartStore();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const addingToCart = ref(false);
const successMessage = ref("");

const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
};

const fetchProduct = async () => {
    try {
        loading.value = true;
        error.value = null;
        const data = await api.getProduct(route.params.id);
        product.value = data;
    } catch (err) {
        console.error("Fetch product error:", err);
        error.value = "Товар не найден";
    } finally {
        loading.value = false;
    }
};

const handleAddToCart = async () => {
    addingToCart.value = true;
    successMessage.value = "";

    try {
        const result = await cartStore.addToCart(
            product.value.id,
            quantity.value
        );

        if (result.success) {
            successMessage.value = `Товар добавлен в корзину (${quantity.value} шт.)`;
            setTimeout(() => {
                successMessage.value = "";
            }, 3000);
        }
    } catch (err) {
        console.error("Add to cart error:", err);
    } finally {
        addingToCart.value = false;
    }
};

onMounted(() => {
    fetchProduct();
});
</script>

<style scoped>
.product-page {
    padding: var(--spacing-xl) 0;
    min-height: calc(100vh - 80px);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    gap: var(--spacing-md);
}

.back-btn {
    margin-bottom: var(--spacing-lg);
}

.product-content {
    animation: fadeIn 0.3s ease-out;
}

.product-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
}

.product-image-section {
    position: sticky;
    top: 100px;
    height: fit-content;
}

.product-image {
    width: 100%;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 16px var(--shadow);
}

.product-info-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.product-title {
    font-size: 2.5rem;
    margin: 0;
    line-height: 1.2;
}

.product-price-block {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    background: var(--background);
    border-radius: var(--radius-md);
}

.product-price {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
}

.stock-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-weight: 600;
    font-size: 0.875rem;
}

.stock-status.in-stock {
    color: var(--success);
}

.stock-status.out-of-stock {
    color: var(--error);
}

.product-description {
    padding: var(--spacing-lg);
    background: var(--surface);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px var(--shadow);
}

.product-description h3 {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-md);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.product-description p {
    line-height: 1.7;
    color: var(--text-primary);
    margin: 0;
}

.product-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background: var(--surface);
    border-radius: var(--radius-md);
    box-shadow: 0 2px 8px var(--shadow);
}

.quantity-selector {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.quantity-selector label {
    font-weight: 600;
    color: var(--text-secondary);
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.quantity-input {
    width: 80px;
    text-align: center;
    padding: var(--spacing-sm);
    border: 2px solid var(--divider);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-weight: 600;
}

.quantity-input:focus {
    outline: none;
    border-color: var(--primary);
}

/* Remove arrows from number input */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.quantity-input[type="number"] {
    -moz-appearance: textfield;
}

@media (max-width: 1199px) {
    .product-layout {
        grid-template-columns: 1fr;
    }

    .product-image-section {
        position: static;
    }

    .product-title {
        font-size: 1.75rem;
    }

    .product-price {
        font-size: 2rem;
    }
}
</style>
