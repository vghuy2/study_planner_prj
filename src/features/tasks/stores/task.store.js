import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService } from '../services/task.service'
import { useAuthStore } from '@/features/auth/stores/authStore'
import dayjs from 'dayjs'

export const useTaskStore = defineStore('tasks', () => {
  const authStore = useAuthStore()
  const tasks = ref([])

  // ─── Actions ────────────────────────────────────────────────────────────────

  function fetchTasks() {
    if (!authStore.currentUser?.id) return
    tasks.value = taskService.getAll(authStore.currentUser.id)
  }

  function addTask(data) {
    if (!authStore.currentUser?.id) return null
    const task = taskService.add(data, authStore.currentUser.id)
    tasks.value.push(task)
    return task
  }

  function updateTask(id, data) {
    const updated = taskService.update(id, data)
    if (updated) {
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = updated
    }
    return updated
  }

  function deleteTask(id) {
    taskService.remove(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  function toggleComplete(id) {
    const updated = taskService.toggleComplete(id)
    if (updated) {
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...updated }
    }
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))
  const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))

  const todayTasks = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return tasks.value.filter(t => t.dueDate && dayjs(t.dueDate).format('YYYY-MM-DD') === today)
  })

  const upcomingTasks = computed(() => {
    const now = dayjs()
    return tasks.value
      .filter(t => {
        if (!t.dueDate || t.status === 'completed') return false
        const diff = dayjs(t.dueDate).diff(now, 'day')
        return diff >= 0 && diff <= 7
      })
      .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)))
      .slice(0, 5)
  })

  const overdueTasks = computed(() => {
    const todayStart = dayjs().startOf('day')
    return tasks.value.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false
      return dayjs(t.dueDate).isBefore(todayStart)
    })
  })

  const completionRate = computed(() => {
    if (!tasks.value.length) return 0
    return Math.round((completedTasks.value.length / tasks.value.length) * 100)
  })

  /** Formatted events for FullCalendar */
  const calendarEvents = computed(() =>
    tasks.value
      .filter(t => !!t.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        date: task.dueDate,
        backgroundColor:
          task.status === 'completed' ? '#10b981'
          : task.priority === 'high'   ? '#ef4444'
          : task.priority === 'medium' ? '#f59e0b'
          :                              '#3b82f6',
        borderColor:
          task.status === 'completed' ? '#059669'
          : task.priority === 'high'   ? '#dc2626'
          : task.priority === 'medium' ? '#d97706'
          :                              '#2563eb',
        textColor: '#ffffff',
        extendedProps: { ...task }
      }))
  )

  return {
    tasks,
    completedTasks, pendingTasks,
    todayTasks, upcomingTasks, overdueTasks,
    completionRate, calendarEvents,
    fetchTasks, addTask, updateTask, deleteTask, toggleComplete
  }
})
