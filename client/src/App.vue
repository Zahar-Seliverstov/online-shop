<template>
    <div id="app">
        <AppHeader v-if="!isMobile || currentRoute !== 'Admin'" />

        <main class="main-content">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </router-view>
        </main>

        <MobileNavigation v-if="isMobile && currentRoute !== 'Admin'" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { useCartStore } from "./stores/cart";
import AppHeader from "./components/AppHeader.vue";
import MobileNavigation from "./components/MobileNavigation.vue";

const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const isMobile = ref(window.innerWidth < 1200);
const currentRoute = computed(() => route.name);

const handleResize = () => {
    isMobile.value = window.innerWidth < 1200;
};

onMounted(async () => {
    window.addEventListener("resize", handleResize);
    await authStore.initialize();
    await cartStore.fetchCart();
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    padding-bottom: 80px;
}

@media (min-width: 1200px) {
    .main-content {
        padding-bottom: 0;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
