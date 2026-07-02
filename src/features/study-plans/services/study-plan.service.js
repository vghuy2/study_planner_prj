import { storageService } from '@/services/storage.service'
import { v4 as uuidv4 } from 'uuid'

const STUDY_PLANS_KEY = 'sp_study_plans'

export const studyPlanService = {
  /** Get all study plans for a specific user */
  getAll(userId) {
    const all = storageService.get(STUDY_PLANS_KEY) || []
    return all.filter(sp => sp.userId === userId)
  },

  /** Add a new study plan */
  add(data, userId) {
    const all = storageService.get(STUDY_PLANS_KEY) || []
    const studyPlan = {
      id: uuidv4(),
      goalId: data.goalId,
      userId,
      title: data.title?.trim() || '',
      description: data.description?.trim() || '',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    all.push(studyPlan)
    storageService.set(STUDY_PLANS_KEY, all)
    return studyPlan
  },

  /** Update an existing study plan */
  update(id, updates) {
    const all = storageService.get(STUDY_PLANS_KEY) || []
    const idx = all.findIndex(sp => sp.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    storageService.set(STUDY_PLANS_KEY, all)
    return all[idx]
  },

  /** Delete a study plan */
  remove(id) {
    const all = storageService.get(STUDY_PLANS_KEY) || []
    storageService.set(STUDY_PLANS_KEY, all.filter(sp => sp.id !== id))
  }
}
