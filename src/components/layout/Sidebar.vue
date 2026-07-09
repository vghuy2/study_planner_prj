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

const isCollapsed = ref(false)

const navigation = [
  { name: 'Dashboard',   href: '/',           icon: LayoutDashboard },
  { name: 'Goals',       href: '/goals',       icon: Target },
  { name: 'Study Plans', href: '/study-plans', icon: BookOpen },
  { name: 'Tasks',       href: '/tasks',       icon: CheckSquare },
  { name: 'Calendar',    href: '/calendar',    icon: CalendarIcon },
  { name: 'Pomodoro',    href: '/pomodoro',    icon: Timer },
  { name: 'Statistics',  href: '/statistics',  icon: BarChart3 },
]

const bottomNavigation = [
  { name: 'Profile',  href: '/profile',  icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const isActive = (path) => computed(() => route.path === path)

const handleLogout = async () => {
  emit('close-sidebar')
  await authStore.logout()
  window.location.reload()
}
</script>

<template>
  <!-- Mobile Backdrop -->
  <div
    v-if="isOpen"
    @click="emit('close-sidebar')"
    class="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-40 lg:hidden"
  />

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200/80 dark:border-white/[0.06] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:static lg:inset-auto shadow-sm dark:shadow-none"
    :class="[
      isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
      isCollapsed ? 'lg:w-[72px]' : 'w-64'
    ]"
  >
    <!-- Header -->
    <div
      class="h-16 flex items-center border-b border-gray-200/80 dark:border-white/[0.06] shrink-0"
      :class="isCollapsed ? 'justify-center px-0' : 'justify-between px-5'"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 shrink-0">
          S
        </div>
        <span
          v-if="!isCollapsed"
          class="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white truncate"
        >PlannerPro</span>
      </div>
      <button
        @click="emit('close-sidebar')"
        class="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Primary Navigation -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-0.5 custom-scrollbar">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        @click="emit('close-sidebar')"
        class="group flex items-center py-2 text-[13.5px] font-medium rounded-xl transition-all duration-200"
        :class="[
          isActive(item.href).value
            ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-gray-100',
          isCollapsed ? 'px-0 justify-center' : 'px-3'
        ]"
        :title="isCollapsed ? item.name : ''"
      >
        <component
          :is="item.icon"
          class="flex-shrink-0 h-[18px] w-[18px] transition-colors duration-200"
          :class="[
            isActive(item.href).value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300',
            isCollapsed ? 'mr-0' : 'mr-3'
          ]"
        />
        <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
        <span
          v-if="isActive(item.href).value && !isCollapsed"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
        />
      </router-link>
    </nav>

    <!-- Bottom Section -->
    <div class="px-3 py-3 border-t border-gray-200/80 dark:border-white/[0.06] space-y-0.5">
      <router-link
        v-for="item in bottomNavigation"
        :key="item.name"
        :to="item.href"
        @click="emit('close-sidebar')"
        class="group flex items-center py-2 text-[13.5px] font-medium rounded-xl transition-all duration-200"
        :class="[
          isActive(item.href).value
            ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-gray-100',
          isCollapsed ? 'px-0 justify-center' : 'px-3'
        ]"
        :title="isCollapsed ? item.name : ''"
      >
        <component
          :is="item.icon"
          class="flex-shrink-0 h-[18px] w-[18px] transition-colors"
          :class="[
            isActive(item.href).value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
            isCollapsed ? 'mr-0' : 'mr-3'
          ]"
        />
        <span v-if="!isCollapsed" class="truncate">{{ item.name }}</span>
      </router-link>

      <!-- Logout -->
      <button
        @click="handleLogout"
        class="w-full group flex items-center py-2 text-[13.5px] font-medium rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
        :class="isCollapsed ? 'px-0 justify-center' : 'px-3'"
        :title="isCollapsed ? 'Sign out' : ''"
      >
        <LogOut class="flex-shrink-0 h-[18px] w-[18px] transition-colors" :class="isCollapsed ? 'mr-0' : 'mr-3'" />
        <span v-if="!isCollapsed">Sign out</span>
      </button>
    </div>

    <!-- Collapse Toggle (Desktop) -->
    <div class="hidden lg:flex items-center justify-end px-3 py-3 border-t border-gray-200/80 dark:border-white/[0.06]">
      <button
        @click="isCollapsed = !isCollapsed"
        class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
      >
        <ChevronRight v-if="isCollapsed" class="w-4 h-4" />
        <ChevronLeft  v-else              class="w-4 h-4" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 4px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.2); }
</style>
