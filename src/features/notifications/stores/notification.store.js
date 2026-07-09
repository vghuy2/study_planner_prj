import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '@/services/storage.service'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'sp_notifications'

/**
 * Notification types:
 *  - 'task_completed'   — user marked a task done
 *  - 'task_due_soon'    — task due within 24h (checked on load)
 *  - 'task_overdue'     — task past due date
 *  - 'pomodoro_done'    — focus session completed
 *  - 'pomodoro_break'   — break session completed
 *  - 'goal_achieved'    — goal reached 100%
 *  - 'system'           — app-level info
 */

export const useNotificationStore = defineStore('notifications', () => {
  const authStore = useAuthStore()
  const notifications = ref([])

  // ─── Persistence ──────────────────────────────────────────────────────────

  function _load() {
    if (!authStore.currentUser?.id) return
    const all = storageService.get(STORAGE_KEY) || []
    notifications.value = all
      .filter(n => n.userId === authStore.currentUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function _save() {
    if (!authStore.currentUser?.id) return
    // Keep all notifications (from all users), replace current user's slice
    const all = storageService.get(STORAGE_KEY) || []
    const others = all.filter(n => n.userId !== authStore.currentUser.id)
    storageService.set(STORAGE_KEY, [...others, ...notifications.value])
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  function add({ type, title, message, icon = null, link = null }) {
    if (!authStore.currentUser?.id) return
    const notif = {
      id: uuidv4(),
      userId: authStore.currentUser.id,
      type,
      title,
      message,
      icon,
      link,
      read: false,
      createdAt: new Date().toISOString()
    }
    notifications.value.unshift(notif)
    // Cap at 50 per user
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
    _save()
    return notif
  }

  function markRead(id) {
    const n = notifications.value.find(n => n.id === id)
    if (n) {
      n.read = true
      _save()
    }
  }

  function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
    _save()
  }

  function remove(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
    _save()
  }

  function clearAll() {
    notifications.value = []
    _save()
  }

  // ─── Shorthand helpers (called from other stores / components) ─────────────

  function notifyTaskCompleted(taskTitle) {
    add({
      type: 'task_completed',
      title: 'Task completed',
      message: `"${taskTitle}" marked as done.`,
      icon: 'check',
      link: '/tasks'
    })
  }

  function notifyTaskDueSoon(taskTitle, hoursLeft) {
    add({
      type: 'task_due_soon',
      title: 'Task due soon',
      message: `"${taskTitle}" is due in ${hoursLeft < 1 ? 'less than an hour' : Math.round(hoursLeft) + 'h'}.`,
      icon: 'clock',
      link: '/tasks'
    })
  }

  function notifyTaskOverdue(taskTitle) {
    add({
      type: 'task_overdue',
      title: 'Task overdue',
      message: `"${taskTitle}" is past its due date.`,
      icon: 'alert',
      link: '/tasks'
    })
  }

  function notifyPomodoroDone(sessionNumber) {
    add({
      type: 'pomodoro_done',
      title: 'Focus session complete',
      message: `Session #${sessionNumber} done. Time for a break.`,
      icon: 'timer',
      link: '/pomodoro'
    })
  }

  function notifyPomodoroBreakDone() {
    add({
      type: 'pomodoro_break',
      title: 'Break over',
      message: 'Ready for another focus session?',
      icon: 'timer',
      link: '/pomodoro'
    })
  }

  function notifyGoalAchieved(goalTitle) {
    add({
      type: 'goal_achieved',
      title: 'Goal achieved!',
      message: `You reached your goal: "${goalTitle}".`,
      icon: 'star',
      link: '/goals'
    })
  }

  function notifySystem(title, message, link = null) {
    add({ type: 'system', title, message, icon: 'info', link })
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const hasUnread   = computed(() => unreadCount.value > 0)
  const recent      = computed(() => notifications.value.slice(0, 20))

  return {
    notifications, unreadCount, hasUnread, recent,
    add, markRead, markAllRead, remove, clearAll,
    notifyTaskCompleted, notifyTaskDueSoon, notifyTaskOverdue,
    notifyPomodoroDone, notifyPomodoroBreakDone,
    notifyGoalAchieved, notifySystem,
    loadNotifications: _load
  }
})
