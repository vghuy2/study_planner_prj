import { storageService } from '@/services/storage.service'
import { v4 as uuidv4 } from 'uuid'

const GOALS_KEY = 'sp_goals'

export const goalService = {
  /** Get all goals belonging to a specific user */
  getAll(userId) {
    const all = storageService.get(GOALS_KEY) || []
    return all.filter(g => g.userId === userId)
  },

  /** Add a new goal for a user */
  add(data, userId) {
    const all = storageService.get(GOALS_KEY) || []
    const goal = {
      id: uuidv4(),
      userId,
      title: data.title?.trim() || '',
      description: data.description?.trim() || '',
      targetDate: data.targetDate || null,
      status: data.status || 'in-progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    all.push(goal)
    storageService.set(GOALS_KEY, all)
    return goal
  },

  /** Update fields of an existing goal */
  update(id, updates) {
    const all = storageService.get(GOALS_KEY) || []
    const idx = all.findIndex(g => g.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    storageService.set(GOALS_KEY, all)
    return all[idx]
  },

  /** Permanently remove a goal */
  remove(id) {
    const all = storageService.get(GOALS_KEY) || []
    storageService.set(GOALS_KEY, all.filter(g => g.id !== id))
  }
}
