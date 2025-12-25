<template>
    <header class="app-header">
        <div class="container">
            <div class="header-content">
                <router-link to="/" class="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect
                            width="32"
                            height="32"
                            rx="8"
                            fill="var(--primary)"
                        />
                        <path
                            d="M16 8L21 13H17V20H15V13H11L16 8Z"
                            fill="white"
                        />
                        <rect
                            x="10"
                            y="21"
                            width="12"
                            height="2"
                            fill="white"
                        />
                    </svg>
                    <span>Интернет-магазин</span>
                </router-link>

                <nav class="nav-links">
                    <router-link to="/" class="nav-link">Главная</router-link>
                    <router-link to="/catalog" class="nav-link"
                        >Каталог</router-link
                    >
                </nav>

                <div class="header-actions">
                    <div class="search-box">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Поиск товаров..."
                            class="search-input"
                            @keyup.enter="handleSearch"
                        />
                        <button class="search-btn" @click="handleSearch">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                />
                            </svg>
                        </button>
                    </div>

                    <router-link to="/cart" class="cart-btn">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                            />
                        </svg>
                        <span
                            v-if="cartStore.totalItems > 0"
                            class="cart-badge"
                        >
                            {{ cartStore.totalItems }}
                        </span>
                    </router-link>

                    <div v-if="authStore.isAuthenticated" class="user-menu">
                        <button class="user-btn" @click="toggleUserMenu">
                            <div class="user-avatar">
                                {{ userInitials }}
                            </div>
                            <span class="user-name">{{
                                authStore.userName
                            }}</span>
                        </button>

                        <div v-if="showUserMenu" class="user-dropdown">
                            <router-link
                                to="/profile"
                                class="dropdown-item"
                                @click="showUserMenu = false"
                            >
                                Профиль
                            </router-link>
                            <router-link
                                v-if="authStore.isAdmin"
                                to="/admin"
                                class="dropdown-item"
                                @click="showUserMenu = false"
                            >
                                Админ-панель
                            </router-link>
                            <button class="dropdown-item" @click="handleLogout">
                                Выйти
                            </button>
                        </div>
                    </div>

                    <div v-else class="auth-btns">
                        <router-link to="/login" class="btn btn-text"
                            >Войти</router-link
                        >
                        <router-link
                            to="/register"
                            class="btn btn-primary btn-sm"
                            >Регистрация</router-link
                        >
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useCartStore } from "../stores/cart";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const searchQuery = ref("");
const showUserMenu = ref(false);

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

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
};

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ name: "Catalog", query: { search: searchQuery.value } });
        searchQuery.value = "";
    }
};

const handleLogout = async () => {
    await authStore.logout();
    showUserMenu.value = false;
    router.push("/");
};
</script>

<style scoped>
.app-header {
    background: var(--surface);
    box-shadow: 0 2px 8px var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) 0;
}

.logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.25rem;
}

.nav-links {
    display: flex;
    gap: var(--spacing-lg);
    margin-left: var(--spacing-xl);
}

.nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    padding: var(--spacing-sm) 0;
    border-bottom: 2px solid transparent;
}

.nav-link:hover,
.nav-link.router-link-active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-left: auto;
}

.search-box {
    display: flex;
    align-items: center;
    background: var(--background);
    border-radius: 24px;
    padding: var(--spacing-xs) var(--spacing-md);
    min-width: 300px;
}

.search-input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.875rem;
    padding: var(--spacing-sm);
}

.search-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    display: flex;
    align-items: center;
    transition: var(--transition);
}

.search-btn:hover {
    color: var(--primary);
}

.cart-btn {
    position: relative;
    color: var(--text-primary);
    padding: var(--spacing-sm);
    display: flex;
    align-items: center;
    transition: var(--transition);
    border-radius: 50%;
}

.cart-btn:hover {
    background: var(--background);
    color: var(--primary);
}

.cart-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--secondary);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-menu {
    position: relative;
}

.user-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: 24px;
    transition: var(--transition);
}

.user-btn:hover {
    background: var(--background);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
}

.user-name {
    font-weight: 500;
    color: var(--text-primary);
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--spacing-sm);
    background: var(--surface);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 16px var(--shadow);
    min-width: 200px;
    overflow: hidden;
    animation: fadeIn 0.2s ease-out;
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    text-align: left;
    background: transparent;
    border: none;
    color: var(--text-primary);
    text-decoration: none;
    cursor: pointer;
    transition: var(--transition);
    font-size: 0.875rem;
}

.dropdown-item:hover {
    background: var(--background);
    color: var(--primary);
}

.auth-btns {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

@media (max-width: 1199px) {
    .app-header {
        display: none;
    }
}

@media (max-width: 768px) {
    .search-box {
        min-width: 200px;
    }

    .user-name {
        display: none;
    }
}
</style>
