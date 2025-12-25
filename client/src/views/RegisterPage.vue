<template>
    <div class="register-page">
        <div class="container">
            <div class="auth-container">
                <div class="auth-card card">
                    <div class="card-body">
                        <h1 class="auth-title">Регистрация</h1>
                        <p class="auth-subtitle">Создайте новый аккаунт</p>

                        <form @submit.prevent="handleRegister">
                            <div class="form-group">
                                <label class="form-label"
                                    >Имя (необязательно)</label
                                >
                                <input
                                    v-model="form.name"
                                    type="text"
                                    class="form-control"
                                    placeholder="Иван Иванов"
                                />
                            </div>

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
                                    placeholder="Минимум 6 символов"
                                    required
                                />
                                <div v-if="errors.password" class="form-error">
                                    {{ errors.password }}
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label"
                                    >Подтверждение пароля</label
                                >
                                <input
                                    v-model="form.confirmPassword"
                                    type="password"
                                    class="form-control"
                                    placeholder="Повторите пароль"
                                    required
                                />
                                <div
                                    v-if="errors.confirmPassword"
                                    class="form-error"
                                >
                                    {{ errors.confirmPassword }}
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
                                {{
                                    loading
                                        ? "Регистрация..."
                                        : "Зарегистрироваться"
                                }}
                            </button>
                        </form>

                        <div class="auth-footer">
                            <p>Уже есть аккаунт?</p>
                            <router-link to="/login" class="btn btn-text">
                                Войти
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
});

const errors = reactive({
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
});

const loading = ref(false);

const validateForm = () => {
    errors.email = "";
    errors.password = "";
    errors.confirmPassword = "";
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

    if (!form.confirmPassword) {
        errors.confirmPassword = "Подтвердите пароль";
        isValid = false;
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "Пароли не совпадают";
        isValid = false;
    }

    return isValid;
};

const handleRegister = async () => {
    if (!validateForm()) return;

    loading.value = true;
    errors.general = "";

    try {
        const result = await authStore.register({
            email: form.email,
            password: form.password,
            name: form.name || null,
        });

        if (result.success) {
            router.push("/");
        } else {
            errors.general = result.error || "Ошибка при регистрации";
        }
    } catch (error) {
        console.error("Register error:", error);
        errors.general = "Произошла ошибка. Попробуйте снова";
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.register-page {
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
</style>
