<template>
    <div class="product-card card">
        <router-link :to="`/product/${product.id}`" class="product-link">
            <img
                :src="product.imageUrl"
                :alt="product.name"
                class="product-image"
            />
        </router-link>

        <div class="card-body">
            <span class="badge badge-primary">{{ product.category.name }}</span>

            <router-link
                :to="`/product/${product.id}`"
                class="product-title-link"
            >
                <h3 class="product-name">{{ product.name }}</h3>
            </router-link>

            <p class="product-description">
                {{ truncateText(product.description, 80) }}
            </p>

            <div class="product-footer">
                <div class="price-info">
                    <span class="product-price"
                        >{{ formatPrice(product.price) }} ₽</span
                    >
                    <span v-if="product.stock > 0" class="stock-info"
                        >В наличии: {{ product.stock }}</span
                    >
                    <span v-else class="stock-info out-of-stock"
                        >Нет в наличии</span
                    >
                </div>

                <button
                    class="btn btn-primary btn-sm"
                    :disabled="product.stock === 0 || loading"
                    @click="handleAddToCart"
                >
                    <svg
                        v-if="!loading"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"
                        />
                    </svg>
                    <span
                        v-if="loading"
                        class="spinner"
                        style="width: 16px; height: 16px; border-width: 2px"
                    ></span>
                    <span>{{ loading ? "Добавление..." : "В корзину" }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
});

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const loading = ref(false);

const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
};

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

const handleAddToCart = async () => {
    loading.value = true;

    try {
        const result = await cartStore.addToCart(props.product.id, 1);

        if (result.success) {
            // Можно показать уведомление об успехе
        }
    } catch (error) {
        console.error("Add to cart error:", error);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.product-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: var(--transition);
}

.product-link {
    display: block;
    overflow: hidden;
}

.product-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    transition: var(--transition);
}

.product-card:hover .product-image {
    transform: scale(1.05);
}

.card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.badge {
    align-self: flex-start;
    margin-bottom: var(--spacing-sm);
}

.product-title-link {
    text-decoration: none;
    color: inherit;
}

.product-name {
    font-size: 1.125rem;
    margin: 0 0 var(--spacing-sm) 0;
    font-weight: 600;
    line-height: 1.4;
    transition: var(--transition);
    min-height: 2.8em;
}

.product-title-link:hover .product-name {
    color: var(--primary);
}

.product-description {
    color: var(--text-secondary);
    font-size: 0.875rem;
    flex: 1;
    margin-bottom: var(--spacing-md);
    line-height: 1.5;
}

.product-footer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: auto;
}

.price-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.product-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
}

.stock-info {
    font-size: 0.75rem;
    color: var(--success);
    font-weight: 500;
}

.stock-info.out-of-stock {
    color: var(--error);
}

.btn {
    width: 100%;
}

@media (max-width: 1199px) {
    .product-image {
        height: 180px;
    }
}
</style>
