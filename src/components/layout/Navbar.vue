<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { Menu, Search } from 'lucide-vue-next'
import NotificationPanel from '@/features/notifications/components/NotificationPanel.vue'

const emit = defineEmits(['toggle-sidebar'])
const authStore = useAuthStore()
const route = useRoute()

const avatarInitials = computed(() => {
  const name = authStore.currentUser?.fullName || 'U'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
})

const pageTitle = computed(() => {
  const titles = {
    '/':           'Dashboard',
    '/tasks':      'Tasks',
    '/calendar':   'Calendar',
    '/pomodoro':   'Pomodoro',
    '/statistics': 'Statistics',
    '/goals':      'Goals',
    '/study-plans':'Study Plans',
    '/profile':    'Profile',
    '/settings':   'Settings',
  }
  return titles[route.path] || 'PlannerPro'
})
</script>

<template>
  <header class="sticky top-0 w-full bg-white/90 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[0.06] flex items-center justify-between px-4 sm:px-6 h-[60px] z-30 transition-colors duration-300">

    <!-- Left: Mobile toggle + Page title -->
    <div class="flex items-center gap-3 lg:gap-5 shrink-0">
      <button
        @click="emit('toggle-sidebar')"
        class="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all focus:outline-none"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Mobile logo -->
      <div class="flex lg:hidden items-center gap-2">
        <div class="w-7 h-7 rounded-[8px] bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-base shadow-md shadow-blue-500/30 shrink-0">
          S
        </div>
      </div>

      <!-- Page Title -->
      <div class="hidden sm:block">
        <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight leading-tight">
          {{ pageTitle }}
        </h2>
      </div>
    </div>

    <!-- Right: Search + Notification + Avatar -->
    <div class="flex items-center gap-1 sm:gap-2 flex-1 justify-end ml-4">

      <!-- Search bar (desktop) -->
      <div class="hidden md:flex relative max-w-xs w-full mx-2">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="w-3.5 h-3.5 text-gray-500" />
        </div>
        <input
          type="text"
          class="block w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all"
          placeholder="Search..."
        />
      </div>

      <!-- Search icon (mobile) -->
      <button class="md:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
        <Search class="w-[18px] h-[18px]" />
      </button>

      <!-- Notification Bell -->
      <NotificationPanel />

      <!-- Divider -->
      <div class="hidden sm:block h-5 w-px bg-white/[0.08] mx-1"></div>

      <!-- Avatar — links to /profile -->
      <router-link to="/profile" class="group">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center text-white text-[12px] font-semibold tracking-wider shadow-md shadow-blue-500/20 ring-2 ring-transparent group-hover:ring-blue-500/40 transition-all duration-200">
          {{ avatarInitials }}
        </div>
      </router-link>
    </div>
  </header>
</template>
