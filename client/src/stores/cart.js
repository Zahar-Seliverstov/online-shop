import { defineStore } from "pinia";
import api from "../services/api";

export const useCartStore = defineStore("cart", {
    state: () => ({
        items: [],
        totalPrice: 0,
        totalItems: 0,
        loading: false,
    }),

    actions: {
        async fetchCart() {
            try {
                this.loading = true;
                const response = await api.getCart();
                this.items = response.items;
                this.totalPrice = response.totalPrice;
                this.totalItems = response.totalItems;
            } catch (error) {
                console.error("Fetch cart error:", error);
            } finally {
                this.loading = false;
            }
        },

        async addToCart(productId, quantity = 1) {
            try {
                await api.addToCart(productId, quantity);
                await this.fetchCart();
                return { success: true };
            } catch (error) {
                console.error("Add to cart error:", error);
                return {
                    success: false,
                    error:
                        error.response?.data?.error ||
                        "Ошибка при добавлении в корзину",
                };
            }
        },

        async updateQuantity(itemId, quantity) {
            try {
                await api.updateCartItem(itemId, quantity);
                await this.fetchCart();
                return { success: true };
            } catch (error) {
                console.error("Update cart error:", error);
                return {
                    success: false,
                    error:
                        error.response?.data?.error ||
                        "Ошибка при обновлении корзины",
                };
            }
        },

        async removeItem(itemId) {
            try {
                await api.removeFromCart(itemId);
                await this.fetchCart();
                return { success: true };
            } catch (error) {
                console.error("Remove from cart error:", error);
                return {
                    success: false,
                    error:
                        error.response?.data?.error ||
                        "Ошибка при удалении из корзины",
                };
            }
        },

        async clearCart() {
            try {
                await api.clearCart();
                this.items = [];
                this.totalPrice = 0;
                this.totalItems = 0;
                return { success: true };
            } catch (error) {
                console.error("Clear cart error:", error);
                return {
                    success: false,
                    error:
                        error.response?.data?.error ||
                        "Ошибка при очистке корзины",
                };
            }
        },
    },
});
