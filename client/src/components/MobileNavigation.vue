<template>
    <nav class="mobile-nav">
        <router-link to="/" class="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Главная</span>
        </router-link>

        <router-link to="/catalog" class="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
            <span>Каталог</span>
        </router-link>

        <router-link to="/cart" class="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
                />
            </svg>
            <span>Корзина</span>
            <span v-if="cartStore.totalItems > 0" class="cart-badge">
                {{ cartStore.totalItems }}
            </span>
        </router-link>

        <router-link to="/profile" class="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
            </svg>
            <span>Профиль</span>
        </router-link>
    </nav>
</template>

<script setup>
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();
</script>

<style scoped>
.mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    box-shadow: 0 -2px 8px var(--shadow);
    display: flex;
    justify-content: space-around;
    padding: var(--spacing-sm) 0;
    z-index: 100;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.75rem;
    position: relative;
    min-width: 60px;
    padding: var(--spacing-xs);
    transition: var(--transition);
}

.nav-item:active {
    background: var(--background);
    border-radius: var(--radius-sm);
}

.nav-item.router-link-active {
    color: var(--primary);
}

.cart-badge {
    position: absolute;
    top: 0;
    right: 10px;
    background: var(--secondary);
    color: white;
    font-size: 0.625rem;
    font-weight: 600;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
}

@media (min-width: 1200px) {
    .mobile-nav {
        display: none;
    }
}
</style>
