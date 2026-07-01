<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { Menu, Bell, Search } from 'lucide-vue-next'

const emit = defineEmits(['toggle-sidebar'])
const authStore = useAuthStore()

const searchQuery = ref('')

const firstName = computed(() => {
  const fullName = authStore.currentUser?.fullName || 'User'
  return fullName.split(' ')[0]
})
</script>

<template>
  <header class="sticky top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 h-16 shadow-sm z-30 transition-all">
    
    <!-- Left Section: Mobile Menu & Logo & Greeting -->
    <div class="flex items-center gap-3 lg:gap-6 flex-shrink-0">
      <button 
        @click="emit('toggle-sidebar')"
        class="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Menu class="w-6 h-6" />
      </button>

      <!-- App Logo (Primarily for Mobile responsiveness when sidebar is hidden) -->
      <div class="flex lg:hidden items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
          S
        </div>
      </div>
      
      <!-- Greeting Context -->
      <div class="hidden sm:flex flex-col">
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          Hello, {{ firstName }}! 👋
        </h2>
      </div>
    </div>

    <!-- Right Section: Search, Notifications, Profile -->
    <div class="flex items-center gap-1 sm:gap-4 flex-1 justify-end ml-4">
      
      <!-- Desktop Search Bar -->
      <div class="hidden md:flex relative max-w-sm w-full mx-4">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="w-4 h-4 text-gray-400" />
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          class="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-gray-900 dark:text-white shadow-inner" 
          placeholder="Search..." 
        />
      </div>

      <!-- Mobile Search Icon -->
      <button class="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Search class="w-5 h-5" />
      </button>

      <!-- Notifications -->
      <button class="relative p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Bell class="w-5 h-5" />
        <span class="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
      </button>
      
      <!-- Divider -->
      <div class="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
      
      <!-- Current User Avatar -->
      <div class="p-1 cursor-pointer hover:opacity-80 transition-opacity">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white ring-2 ring-white dark:ring-gray-950 shadow-md text-sm font-bold tracking-wider">
           {{ firstName.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>
  </header>
</template>
