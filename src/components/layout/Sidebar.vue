<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { 
  LayoutDashboard, Target, BookOpen, CheckSquare, 
  Calendar as CalendarIcon, Timer, BarChart3, 
  User, Settings, LogOut, X, ChevronLeft, ChevronRight 
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['close-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Local state for desktop collapse
const isCollapsed = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Study Plans', href: '/study-plans', icon: BookOpen },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Statistics', href: '/statistics', icon: BarChart3 },
]

const bottomNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const isActive = (path) => computed(() => route.path === path)

const handleLogout = async () => {
  emit('close-sidebar')
  await authStore.logout()
  // Trigger global reload to enforce route guards correctly
  window.location.reload()
}
</script>

<template>
  <!-- Mobile Sidebar Backdrop -->
  <div 
    v-if="isOpen" 
    @click="emit('close-sidebar')"
    class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
  ></div>

  <!-- Sidebar Component -->
  <aside 
    class="fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out lg:static lg:inset-auto"
    :class="[
      isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0', 
      isCollapsed ? 'lg:w-20' : 'w-64'
    ]"
  >
    <!-- Header -->
    <div class="h-16 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 px-6" :class="{ 'lg:justify-center lg:px-0': isCollapsed }">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
          S
        </div>
        <span v-if="!isCollapsed" class="text-lg font-bold tracking-tight text-gray-900 dark:text-white truncate">PlannerPro</span>
      </div>
      <button @click="emit('close-sidebar')" class="lg:hidden p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
        <X class="w-6 h-6" />
      </button>
    </div>
    
    <!-- Primary Navigation -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1.5 custom-scrollbar">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        @click="emit('close-sidebar')"
        class="group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
        :class="[
          isActive(item.href).value 
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white',
          isCollapsed ? 'px-0 justify-center' : 'px-3'
        ]"
        :title="isCollapsed ? item.name : ''"
      >
        <component 
          :is="item.icon" 
          class="flex-shrink-0 h-5 w-5 transition-colors duration-200"
          :class="[
            isActive(item.href).value 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
            isCollapsed ? 'mr-0' : 'mr-3'
          ]"
        />
        <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Bottom Actions / Settings -->
    <div class="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1.5">
      <router-link
        v-for="item in bottomNavigation"
        :key="item.name"
        :to="item.href"
        @click="emit('close-sidebar')"
        class="group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
        :class="isCollapsed ? 'px-0 justify-center' : 'px-3'"
        :title="isCollapsed ? item.name : ''"
      >
        <component :is="item.icon" class="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors" :class="isCollapsed ? 'mr-0' : 'mr-3'" />
        <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
      </router-link>
      
      <!-- Logout Button -->
      <button 
        @click="handleLogout"
        class="w-full group flex items-center py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
        :class="isCollapsed ? 'px-0 justify-center' : 'px-3'"
        :title="isCollapsed ? 'Logout' : ''"
      >
        <LogOut class="flex-shrink-0 h-5 w-5 text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" :class="isCollapsed ? 'mr-0' : 'mr-3'" />
        <span v-if="!isCollapsed" class="truncate">Logout</span>
      </button>
    </div>

    <!-- Collapse Toggle (Desktop Only) -->
    <div class="hidden lg:flex items-center justify-end px-4 py-3 border-t border-gray-200 dark:border-gray-800">
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        <ChevronRight v-if="isCollapsed" class="w-5 h-5" />
        <ChevronLeft v-else class="w-5 h-5" />
      </button>
    </div>

  </aside>
</template>

<style scoped>
/* Hidden scrollbar purely for aesthetics */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 at 50% */
}
</style>
