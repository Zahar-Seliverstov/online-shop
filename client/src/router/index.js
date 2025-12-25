import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../views/HomePage.vue"),
    },
    {
        path: "/catalog",
        name: "Catalog",
        component: () => import("../views/CatalogPage.vue"),
    },
    {
        path: "/product/:id",
        name: "Product",
        component: () => import("../views/ProductPage.vue"),
    },
    {
        path: "/cart",
        name: "Cart",
        component: () => import("../views/CartPage.vue"),
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("../views/LoginPage.vue"),
        meta: { guest: true },
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("../views/RegisterPage.vue"),
        meta: { guest: true },
    },
    {
        path: "/profile",
        name: "Profile",
        component: () => import("../views/ProfilePage.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/admin",
        name: "Admin",
        component: () => import("../views/AdminPage.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    },
});

// Navigation guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Проверка для маршрутов, требующих авторизации
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: "Login", query: { redirect: to.fullPath } });
        return;
    }

    // Проверка для маршрутов администратора
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next({ name: "Home" });
        return;
    }

    // Перенаправление авторизованных пользователей с гостевых страниц
    if (to.meta.guest && authStore.isAuthenticated) {
        next({ name: "Home" });
        return;
    }

    next();
});

export default router;
