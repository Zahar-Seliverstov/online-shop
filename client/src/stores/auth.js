import { defineStore } from "pinia";
import api from "../services/api";
// Импортируем стор корзины
import { useCartStore } from "./cart";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: null,
        isAuthenticated: false,
    }),

    getters: {
        isAdmin: (state) => state.user?.role === "ADMIN",
        userName: (state) => state.user?.name || state.user?.email,
    },

    actions: {
        async initialize() {
            const token = localStorage.getItem("token");
            const user = localStorage.getItem("user");

            if (token && user) {
                this.token = token;
                this.user = JSON.parse(user);
                this.isAuthenticated = true;

                try {
                    const response = await api.getMe();
                    this.user = response.user;
                    localStorage.setItem("user", JSON.stringify(response.user));

                    // Обновляем корзину при инициализации (если вкладка была перезагружена)
                    const cartStore = useCartStore();
                    await cartStore.fetchCart();
                } catch (error) {
                    console.error("Token validation failed:", error);
                    this.logout();
                }
            }
        },

        async login(credentials) {
            try {
                const response = await api.login(credentials);
                this.token = response.token;
                this.user = response.user;
                this.isAuthenticated = true;

                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));

                // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
                // Как только получили токен, просим корзину загрузить актуальные данные с сервера
                const cartStore = useCartStore();
                await cartStore.fetchCart();
                // -----------------------------

                return { success: true };
            } catch (error) {
                console.error("Login error:", error);
                return {
                    success: false,
                    error: error.response?.data?.error || "Ошибка при входе",
                };
            }
        },

        async register(userData) {
            try {
                const response = await api.register(userData);
                this.token = response.token;
                this.user = response.user;
                this.isAuthenticated = true;

                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));

                // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
                const cartStore = useCartStore();
                await cartStore.fetchCart();
                // -----------------------------

                return { success: true };
            } catch (error) {
                console.error("Register error:", error);
                return {
                    success: false,
                    error:
                        error.response?.data?.error || "Ошибка при регистрации",
                };
            }
        },

        async logout() {
            const cartStore = useCartStore();
            try {
                await api.logout();
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                this.user = null;
                this.token = null;
                this.isAuthenticated = false;

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Очищаем корзину в сторе после выхода
                cartStore.clearCart();
            }
        },
    },
});
