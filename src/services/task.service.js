import { storageService } from './storage.service'

const TASKS_KEY = 'study_planner_tasks'

export const taskService = {
  getTasks() {
    return storageService.get(TASKS_KEY) || []
  },

  saveTasks(tasks) {
    storageService.set(TASKS_KEY, tasks)
  },

  addTask(task) {
    const tasks = this.getTasks()
    tasks.push({ ...task, id: Date.now().toString(), createdAt: new Date().toISOString() })
    this.saveTasks(tasks)
  }
}
