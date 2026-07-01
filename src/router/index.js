import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/features/dashboard/Dashboard.vue')
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/features/tasks/Tasks.vue')
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/features/calendar/Calendar.vue')
    }
  ],
})

export default router
