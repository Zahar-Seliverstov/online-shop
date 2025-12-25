<template>
    <div class="home-page">
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">Добро пожаловать в наш магазин</h1>
                    <p class="hero-subtitle">Лучшие товары по выгодным ценам</p>
                    <div class="hero-actions">
                        <router-link
                            to="/catalog"
                            class="btn btn-primary btn-lg"
                        >
                            Перейти в каталог
                        </router-link>
                    </div>
                </div>
            </div>
        </section>

        <section class="featured-section">
            <div class="container">
                <h2 class="section-title">Популярные товары</h2>

                <div v-if="loading" class="loading-container">
                    <div class="spinner"></div>
                    <p>Загрузка товаров...</p>
                </div>

                <div v-else-if="error" class="alert alert-error">
                    {{ error }}
                </div>

                <div v-else class="grid grid-cols-4">
                    <ProductCard
                        v-for="product in products"
                        :key="product.id"
                        :product="product"
                    />
                </div>

                <div
                    v-if="!loading && products.length > 0"
                    class="text-center mt-xl"
                >
                    <router-link to="/catalog" class="btn btn-outline">
                        Смотреть все товары
                    </router-link>
                </div>
            </div>
        </section>

        <section class="categories-section">
            <div class="container">
                <h2 class="section-title">Категории</h2>

                <div v-if="categoriesLoading" class="loading-container">
                    <div class="spinner"></div>
                </div>

                <div v-else class="categories-grid">
                    <router-link
                        v-for="category in categories"
                        :key="category.id"
                        :to="`/catalog?categoryId=${category.id}`"
                        class="category-card card"
                    >
                        <h3>{{ category.name }}</h3>
                        <p>{{ category._count.products }} товаров</p>
                    </router-link>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";
import ProductCard from "../components/ProductCard.vue";

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const categoriesLoading = ref(true);
const error = ref(null);

const fetchProducts = async () => {
    try {
        loading.value = true;
        error.value = null;
        const data = await api.getFeaturedProducts();
        products.value = data;
    } catch (err) {
        console.error("Fetch products error:", err);
        error.value = "Ошибка загрузки товаров";
    } finally {
        loading.value = false;
    }
};

const fetchCategories = async () => {
    try {
        categoriesLoading.value = true;
        const data = await api.getCategories();
        categories.value = data;
    } catch (err) {
        console.error("Fetch categories error:", err);
    } finally {
        categoriesLoading.value = false;
    }
};

onMounted(() => {
    fetchProducts();
    fetchCategories();
});
</script>

<style scoped>
.home-page {
    min-height: calc(100vh - 80px);
}

.hero {
    background: linear-gradient(
        135deg,
        var(--primary) 0%,
        var(--primary-dark) 100%
    );
    color: white;
    padding: var(--spacing-xl) 0;
    margin-bottom: var(--spacing-xl);
}

.hero-content {
    text-align: center;
    padding: var(--spacing-xl) 0;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    font-weight: 700;
    color: white;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-xl);
    opacity: 0.95;
}

.hero-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.featured-section,
.categories-section {
    padding: var(--spacing-xl) 0;
}

.section-title {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    font-size: 2rem;
    font-weight: 600;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    gap: var(--spacing-md);
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-lg);
}

.category-card {
    padding: var(--spacing-xl);
    text-align: center;
    text-decoration: none;
    color: var(--text-primary);
    transition: var(--transition);
}

.category-card:hover {
    transform: translateY(-4px);
}

.category-card h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary);
}

.category-card p {
    color: var(--text-secondary);
    margin: 0;
}

@media (max-width: 1199px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-subtitle {
        font-size: 1rem;
    }

    .categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .hero {
        padding: var(--spacing-lg) 0;
    }

    .hero-content {
        padding: var(--spacing-lg) 0;
    }

    .hero-title {
        font-size: 1.75rem;
    }

    .categories-grid {
        grid-template-columns: 1fr;
    }
}
</style>
