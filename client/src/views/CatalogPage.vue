<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const router = useRouter();

// Константы
const ITEMS_PER_PAGE = 12;

// Состояние данных
const products = ref([]);
const categories = ref([]);
const pagination = ref(null);
const loading = ref(true);
const error = ref(null);

// Контроль запросов (для предотвращения race condition)
let lastRequestId = 0;

// Состояние фильтров (вычисляемое на основе URL или локальное)
const isMobile = ref(false);
const updateMobileStatus = () => {
    isMobile.value = window.innerWidth < 1200;
};

// Извлекаем параметры из URL для синхронности
const filterParams = computed(() => ({
    categoryId: route.query.categoryId ? Number(route.query.categoryId) : null,
    sortBy: route.query.sortBy || "createdAt-desc",
    search: route.query.search || "",
    page: route.query.page ? Number(route.query.page) : 1,
}));

// Вспомогательные методы
const fetchCategories = async () => {
    try {
        categories.value = await api.getCategories();
    } catch (err) {
        console.error("Failed to load categories:", err);
    }
};

const fetchProducts = async () => {
    const requestId = ++lastRequestId; // Идентификатор текущего запроса

    try {
        loading.value = true;
        error.value = null;

        const [sortField, sortOrder] = filterParams.value.sortBy.split("-");

        const params = {
            page: filterParams.value.page,
            limit: ITEMS_PER_PAGE,
            sortBy: sortField,
            order: sortOrder,
        };

        if (filterParams.value.categoryId)
            params.categoryId = filterParams.value.categoryId;
        if (filterParams.value.search)
            params.search = filterParams.value.search;

        const data = await api.getProducts(params);

        // Если пришел ответ от старого запроса — игнорируем его
        if (requestId !== lastRequestId) return;

        products.value = data.products;
        pagination.value = data.pagination;
    } catch (err) {
        if (requestId !== lastRequestId) return;
        console.error("Fetch products error:", err);
        error.value =
            "Не удалось загрузить товары. Пожалуйста, попробуйте позже.";
    } finally {
        if (requestId === lastRequestId) {
            loading.value = false;
        }
    }
};

// Навигация (обновляем только URL, остальное сделает watcher)
const updateRoute = (newParams) => {
    const query = { ...route.query, ...newParams };

    // Очистка пустых параметров для чистого URL
    Object.keys(query).forEach((key) => {
        if (
            query[key] === null ||
            query[key] === undefined ||
            query[key] === ""
        ) {
            delete query[key];
        }
    });

    router.push({ query });
};

const selectCategory = (categoryId) => {
    updateRoute({ categoryId, page: 1 });
};

const changePage = (page) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    updateRoute({ page });
};

const resetFilters = () => {
    router.push({ query: {} });
};

const clearSearch = () => {
    updateRoute({ search: null, page: 1 });
};

// Следим за изменением URL и вызываем загрузку
watch(
    () => route.query,
    () => {
        fetchProducts();
    },
    { deep: true }
);

onMounted(() => {
    updateMobileStatus();
    window.addEventListener("resize", updateMobileStatus);
    fetchCategories();
    fetchProducts();
});

onUnmounted(() => {
    window.removeEventListener("resize", updateMobileStatus);
});
</script>

<template>
    <div class="catalog-page">
        <div class="container">
            <h1 class="page-title">Каталог товаров</h1>

            <div class="catalog-layout">
                <aside v-if="!isMobile" class="sidebar">
                    <div class="card">
                        <div class="card-header">
                            <h3>Фильтры</h3>
                        </div>
                        <div class="card-body">
                            <div class="filter-group">
                                <label class="filter-label">Категория</label>
                                <div class="category-filters">
                                    <button
                                        class="filter-btn"
                                        :class="{
                                            active: !filterParams.categoryId,
                                        }"
                                        @click="selectCategory(null)"
                                    >
                                        Все категории
                                    </button>
                                    <button
                                        v-for="category in categories"
                                        :key="category.id"
                                        class="filter-btn"
                                        :class="{
                                            active:
                                                filterParams.categoryId ===
                                                category.id,
                                        }"
                                        @click="selectCategory(category.id)"
                                    >
                                        {{ category.name }} ({{
                                            category._count?.products || 0
                                        }})
                                    </button>
                                </div>
                            </div>

                            <div class="divider"></div>

                            <div class="filter-group">
                                <label class="filter-label">Сортировка</label>
                                <select
                                    :value="filterParams.sortBy"
                                    class="form-control"
                                    @change="
                                        (e) =>
                                            updateRoute({
                                                sortBy: e.target.value,
                                                page: 1,
                                            })
                                    "
                                >
                                    <option value="createdAt-desc">
                                        Новые первые
                                    </option>
                                    <option value="createdAt-asc">
                                        Старые первые
                                    </option>
                                    <option value="price-asc">
                                        Цена: по возрастанию
                                    </option>
                                    <option value="price-desc">
                                        Цена: по убыванию
                                    </option>
                                    <option value="name-asc">
                                        Название: А-Я
                                    </option>
                                    <option value="name-desc">
                                        Название: Я-А
                                    </option>
                                </select>
                            </div>

                            <button
                                v-if="
                                    filterParams.categoryId ||
                                    filterParams.sortBy !== 'createdAt-desc'
                                "
                                class="btn btn-text"
                                @click="resetFilters"
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    </div>
                </aside>

                <div v-if="isMobile" class="mobile-filters">
                    <select
                        :value="filterParams.categoryId"
                        class="form-control"
                        @change="
                            (e) =>
                                selectCategory(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
                                )
                        "
                    >
                        <option :value="null">Все категории</option>
                        <option
                            v-for="category in categories"
                            :key="category.id"
                            :value="category.id"
                        >
                            {{ category.name }} ({{
                                category._count?.products || 0
                            }})
                        </option>
                    </select>

                    <select
                        :value="filterParams.sortBy"
                        class="form-control"
                        @change="
                            (e) =>
                                updateRoute({ sortBy: e.target.value, page: 1 })
                        "
                    >
                        <option value="createdAt-desc">Новые первые</option>
                        <option value="price-asc">Дешевле</option>
                        <option value="price-desc">Дороже</option>
                    </select>
                </div>

                <div class="products-container">
                    <div v-if="filterParams.search" class="search-info">
                        Результаты поиска: "{{ filterParams.search }}"
                        <button
                            class="btn btn-text btn-sm"
                            @click="clearSearch"
                        >
                            Очистить
                        </button>
                    </div>

                    <div v-if="loading" class="loading-container">
                        <div class="spinner"></div>
                        <p>Загрузка товаров...</p>
                    </div>

                    <div v-else-if="error" class="alert alert-error">
                        {{ error }}
                    </div>

                    <div v-else-if="products.length === 0" class="empty-state">
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
                        <h3>Товары не найдены</h3>
                        <p>
                            Попробуйте изменить фильтры или поискать что-то
                            другое
                        </p>
                    </div>

                    <template v-else>
                        <div class="products-grid grid grid-cols-4 fade-in">
                            <ProductCard
                                v-for="product in products"
                                :key="product.id"
                                :product="product"
                            />
                        </div>

                        <div
                            v-if="pagination && pagination.totalPages > 1"
                            class="pagination"
                        >
                            <button
                                class="btn btn-outline btn-sm"
                                :disabled="filterParams.page === 1"
                                @click="changePage(filterParams.page - 1)"
                            >
                                Предыдущая
                            </button>

                            <div class="pagination-info">
                                Страница {{ filterParams.page }} из
                                {{ pagination.totalPages }}
                            </div>

                            <button
                                class="btn btn-outline btn-sm"
                                :disabled="
                                    filterParams.page === pagination.totalPages
                                "
                                @click="changePage(filterParams.page + 1)"
                            >
                                Следующая
                            </button>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.catalog-page {
    padding: var(--spacing-xl) 0;
    min-height: calc(100vh - 80px);
}

.page-title {
    margin-bottom: var(--spacing-xl);
}

.catalog-layout {
    display: flex;
    gap: var(--spacing-xl);
}

.sidebar {
    width: 280px;
    flex-shrink: 0;
}

.sidebar .card {
    position: sticky;
    top: 80px;
}

.filter-group {
    margin-bottom: var(--spacing-lg);
}

.filter-label {
    display: block;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-secondary);
}

.category-filters {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.filter-btn {
    width: 100%;
    text-align: left;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--divider);
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);
    font-size: 0.875rem;
}

.filter-btn:hover {
    background: var(--background);
    border-color: var(--primary);
}

.filter-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.mobile-filters {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.mobile-filters .form-control {
    flex: 1;
}

.products-container {
    flex: 1;
    min-width: 0;
}

.search-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: var(--background);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-lg);
    font-weight: 500;
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
    color: var(--text-secondary);
}

.empty-state svg {
    margin: 0 auto var(--spacing-lg);
    opacity: 0.3;
}

.empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
}

.products-grid {
    margin-bottom: var(--spacing-xl);
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
}

.pagination-info {
    font-weight: 500;
    color: var(--text-secondary);
}

@media (max-width: 1199px) {
    .catalog-layout {
        flex-direction: column;
    }

    .sidebar {
        display: none;
    }
}
</style>
