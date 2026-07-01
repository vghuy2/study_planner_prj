import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { AuthService } from '../services/AuthService';

export const useAuthStore = defineStore('auth', () => {
    // State
    // Initializes the state from the Auth Service
    const currentUser = ref(AuthService.getCurrentUser());

    // Getters
    const isAuthenticated = computed(() => !!currentUser.value);

    // Actions
    const register = async (userData) => {
        // Typically async to allow for API latency or encryption delays
        const user = await AuthService.register(userData);
        currentUser.value = user;
        return user;
    };

    const login = async (credentials) => {
        const user = await AuthService.login(credentials);
        currentUser.value = user;
        return user;
    };

    const logout = async () => {
        await AuthService.logout();
        currentUser.value = null;
    };

    return {
        currentUser,
        isAuthenticated,
        register,
        login,
        logout
    };
});
