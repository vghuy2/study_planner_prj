import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── Authenticated Routes ───────────────────────────────────────────────
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/features/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/features/tasks/Tasks.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/features/calendar/Calendar.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/pomodoro',
      name: 'pomodoro',
      component: () => import('@/features/pomodoro/views/Pomodoro.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('@/features/statistics/Statistics.vue'),
      meta: { requiresAuth: true }
    },
    // Placeholder routes (sidebar links — pages to be built later)
    {
      path: '/goals',
      name: 'goals',
      component: () => import('@/features/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/study-plans',
      name: 'study-plans',
      component: () => import('@/features/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/features/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/features/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    // ─── Guest Routes ────────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/features/auth/views/Register.vue'),
      meta: { requiresGuest: true }
    }
  ]
})

// Route Guards — return-value pattern (Vue Router 5, next() is deprecated)
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
  return true
})

export default router
