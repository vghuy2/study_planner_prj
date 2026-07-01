import { storageService } from './storage.service'

const GOALS_KEY = 'study_planner_goals'

export const goalService = {
  getGoals() {
    return storageService.get(GOALS_KEY) || []
  },

  saveGoals(goals) {
    storageService.set(GOALS_KEY, goals)
  }
}
