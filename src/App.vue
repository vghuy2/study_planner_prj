<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'
import { useTaskStore } from '@/features/tasks/stores/task.store'
import dayjs from 'dayjs'

const route   = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const taskStore = useTaskStore()

const layout = computed(() => {
  if (route.meta.requiresGuest) return 'div'
  return MainLayout
})

// Load notifications whenever the logged-in user changes
watch(
  () => authStore.currentUser?.id,
  (userId) => {
    if (!userId) return
    notifStore.loadNotifications()
    taskStore.fetchTasks()

    // Check for overdue tasks and fire notifications (once per login session)
    const sessionKey = `sp_overdue_checked_${userId}_${dayjs().format('YYYY-MM-DD')}`
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1')
      // Give taskStore a tick to load
      setTimeout(() => {
        taskStore.overdueTasks.forEach(task => {
          notifStore.notifyTaskOverdue(task.title)
        })
        // Welcome notification on first-ever login
        const welcomeKey = `sp_welcomed_${userId}`
        if (!localStorage.getItem(welcomeKey)) {
          localStorage.setItem(welcomeKey, '1')
          notifStore.notifySystem(
            'Welcome to PlannerPro',
            'Add your first task or start a Pomodoro session to get going.'
          )
        }
      }, 300)
    }
  },
  { immediate: true }
)
</script>


<template>
  <Toaster position="top-right" richColors />
  <!-- Dynamic Layout Wrap -->
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
