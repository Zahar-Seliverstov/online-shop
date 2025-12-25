<template>
    <div class="login-page">
        <div class="container">
            <div class="auth-container">
                <div class="auth-card card">
                    <div class="card-body">
                        <h1 class="auth-title">Вход</h1>
                        <p class="auth-subtitle">Войдите в свой аккаунт</p>

                        <form @submit.prevent="handleLogin">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input
                                    v-model="form.email"
                                    type="email"
                                    class="form-control"
                                    placeholder="example@email.com"
                                    required
                                />
                                <div v-if="errors.email" class="form-error">
                                    {{ errors.email }}
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Пароль</label>
                                <input
                                    v-model="form.password"
                                    type="password"
                                    class="form-control"
                                    placeholder="Введите пароль"
                                    required
                                />
                                <div v-if="errors.password" class="form-error">
                                    {{ errors.password }}
                                </div>
                            </div>

                            <div
                                v-if="errors.general"
                                class="alert alert-error"
                            >
                                {{ errors.general }}
                            </div>

                            <button
                                type="submit"
                                class="btn btn-primary btn-lg"
                                :disabled="loading"
                            >
                                <span
                                    v-if="loading"
                                    class="spinner"
                                    style="
                                        width: 20px;
                                        height: 20px;
                                        border-width: 2px;
                                    "
                                ></span>
                                {{ loading ? "Вход..." : "Войти" }}
                            </button>
                        </form>

                        <div class="auth-footer">
                            <p>Нет аккаунта?</p>
                            <router-link to="/register" class="btn btn-text">
                                Зарегистрироваться
                            </router-link>
                        </div>

                        <div class="divider"></div>

                        <div class="test-credentials">
                            <p
                                class="text-secondary"
                                style="
                                    font-size: 0.875rem;
                                    margin-bottom: var(--spacing-sm);
                                "
                            >
                                Тестовые аккаунты:
                            </p>
                            <div class="credentials-grid">
                                <div class="credential-item">
                                    <strong>Админ:</strong>
                                    <code>admin@shop.com</code>
                                </div>
                                <div class="credential-item">
                                    <strong>Пользователь:</strong>
                                    <code>user@shop.com</code>
                                </div>
                            </div>
                            <p
                                class="text-secondary"
                                style="
                                    font-size: 0.75rem;
                                    margin-top: var(--spacing-xs);
                                "
                            >
                                Пароль для обоих: <code>password123</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
    email: "",
    password: "",
});

const errors = reactive({
    email: "",
    password: "",
    general: "",
});

const loading = ref(false);

const validateForm = () => {
    errors.email = "";
    errors.password = "";
    errors.general = "";

    let isValid = true;

    if (!form.email) {
        errors.email = "Email обязателен";
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = "Некорректный email";
        isValid = false;
    }

    if (!form.password) {
        errors.password = "Пароль обязателен";
        isValid = false;
    } else if (form.password.length < 6) {
        errors.password = "Пароль должен быть не менее 6 символов";
        isValid = false;
    }

    return isValid;
};

const handleLogin = async () => {
    if (!validateForm()) return;

    loading.value = true;
    errors.general = "";

    try {
        const result = await authStore.login({
            email: form.email,
            password: form.password,
        });

        if (result.success) {
            const redirect = route.query.redirect || "/";
            router.push(redirect);
        } else {
            errors.general = result.error || "Ошибка при входе";
        }
    } catch (error) {
        console.error("Login error:", error);
        errors.general = "Произошла ошибка. Попробуйте снова";
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-page {
    padding: var(--spacing-xl) 0;
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
}

.auth-container {
    max-width: 480px;
    margin: 0 auto;
}

.auth-card {
    box-shadow: 0 4px 16px var(--shadow);
}

.auth-title {
    text-align: center;
    margin-bottom: var(--spacing-sm);
}

.auth-subtitle {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
}

form .btn {
    width: 100%;
    margin-top: var(--spacing-md);
}

.auth-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-lg);
}

.auth-footer p {
    margin: 0;
    color: var(--text-secondary);
}

.test-credentials {
    padding: var(--spacing-md);
    background: var(--background);
    border-radius: var(--radius-sm);
    text-align: center;
}

.credentials-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.credential-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--surface);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
}

code {
    padding: 2px 6px;
    background: rgba(25, 118, 210, 0.1);
    color: var(--primary);
    border-radius: 4px;
    font-family: "Courier New", monospace;
    font-size: 0.875rem;
}
</style>
