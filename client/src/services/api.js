import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обработка ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default {
    // Auth
    async register(data) {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    async login(data) {
        const response = await api.post("/auth/login", data);
        return response.data;
    },

    async getMe() {
        const response = await api.get("/auth/me");
        return response.data;
    },

    async logout() {
        const response = await api.post("/auth/logout");
        return response.data;
    },

    // Products
    async getProducts(params = {}) {
        const response = await api.get("/products", { params });
        return response.data;
    },

    async getProduct(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async getFeaturedProducts() {
        const response = await api.get("/products/featured/popular");
        return response.data;
    },

    // Categories
    async getCategories() {
        const response = await api.get("/categories");
        return response.data;
    },

    async getCategory(id) {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    // Cart
    async getCart() {
        const response = await api.get("/cart");
        return response.data;
    },

    async addToCart(productId, quantity = 1) {
        const response = await api.post("/cart/add", { productId, quantity });
        return response.data;
    },

    async updateCartItem(id, quantity) {
        const response = await api.put(`/cart/${id}`, { quantity });
        return response.data;
    },

    async removeFromCart(id) {
        const response = await api.delete(`/cart/${id}`);
        return response.data;
    },

    async clearCart() {
        const response = await api.delete("/cart");
        return response.data;
    },

    // Orders
    async getOrders() {
        const response = await api.get("/orders");
        return response.data;
    },

    async getOrder(id) {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    async createOrder() {
        const response = await api.post("/orders");
        return response.data;
    },

    // Admin
    async getAdminStats() {
        const response = await api.get("/admin/stats");
        return response.data;
    },

    async getAdminProducts() {
        const response = await api.get("/admin/products");
        return response.data;
    },

    async createProduct(data) {
        const response = await api.post("/admin/products", data);
        return response.data;
    },

    async updateProduct(id, data) {
        const response = await api.put(`/admin/products/${id}`, data);
        return response.data;
    },

    async deleteProduct(id) {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
    },

    async getAdminOrders() {
        const response = await api.get("/admin/orders");
        return response.data;
    },

    async updateOrderStatus(id, status) {
        const response = await api.patch(`/admin/orders/${id}/status`, {
            status,
        });
        return response.data;
    },
};
