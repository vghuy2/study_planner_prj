import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { goalService } from '../services/goal.service'
import { useAuthStore } from '@/features/auth/stores/authStore'
import dayjs from 'dayjs'

export const useGoalStore = defineStore('goals', () => {
  const authStore = useAuthStore()
  const goals = ref([])

  // ─── Actions ────────────────────────────────────────────────────────────────

  function fetchGoals() {
    if (!authStore.currentUser?.id) return
    goals.value = goalService.getAll(authStore.currentUser.id)
  }

  function addGoal(data) {
    if (!authStore.currentUser?.id) return null
    const goal = goalService.add(data, authStore.currentUser.id)
    goals.value.push(goal)
    return goal
  }

  function updateGoal(id, data) {
    const updated = goalService.update(id, data)
    if (updated) {
      const idx = goals.value.findIndex(g => g.id === id)
      if (idx !== -1) goals.value[idx] = updated
    }
    return updated
  }

  function deleteGoal(id) {
    goalService.remove(id)
    goals.value = goals.value.filter(g => g.id !== id)
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  const activeGoals = computed(() => goals.value.filter(g => g.status === 'in-progress'))
  const completedGoals = computed(() => goals.value.filter(g => g.status === 'completed'))

  return {
    goals,
    activeGoals, completedGoals,
    fetchGoals, addGoal, updateGoal, deleteGoal
  }
})
