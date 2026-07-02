import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { studyPlanService } from '../services/study-plan.service'
import { useAuthStore } from '@/features/auth/stores/authStore'

export const useStudyPlanStore = defineStore('study-plans', () => {
  const authStore = useAuthStore()
  const studyPlans = ref([])

  // ─── Actions ────────────────────────────────────────────────────────────────

  function fetchStudyPlans() {
    if (!authStore.currentUser?.id) return
    studyPlans.value = studyPlanService.getAll(authStore.currentUser.id)
  }

  function addStudyPlan(data) {
    if (!authStore.currentUser?.id) return null
    const studyPlan = studyPlanService.add(data, authStore.currentUser.id)
    studyPlans.value.push(studyPlan)
    return studyPlan
  }

  function updateStudyPlan(id, data) {
    const updated = studyPlanService.update(id, data)
    if (updated) {
      const idx = studyPlans.value.findIndex(sp => sp.id === id)
      if (idx !== -1) studyPlans.value[idx] = updated
    }
    return updated
  }

  function deleteStudyPlan(id) {
    studyPlanService.remove(id)
    studyPlans.value = studyPlans.value.filter(sp => sp.id !== id)
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  const activePlans = computed(() => studyPlans.value.filter(sp => sp.status === 'active'))
  
  function getPlansByGoal(goalId) {
    return studyPlans.value.filter(sp => sp.goalId === goalId)
  }

  return {
    studyPlans,
    activePlans,
    getPlansByGoal,
    fetchStudyPlans, addStudyPlan, updateStudyPlan, deleteStudyPlan
  }
})
