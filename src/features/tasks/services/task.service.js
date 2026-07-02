import { storageService } from '@/services/storage.service'
import { v4 as uuidv4 } from 'uuid'

const TASKS_KEY = 'sp_tasks'

export const taskService = {
  /** Get all tasks belonging to a specific user */
  getAll(userId) {
    const all = storageService.get(TASKS_KEY) || []
    return all.filter(t => t.userId === userId)
  },

  /** Add a new task for a user */
  add(data, userId) {
    const all = storageService.get(TASKS_KEY) || []
    const task = {
      id: uuidv4(),
      studyPlanId: data.studyPlanId || null,
      userId,
      title: data.title?.trim() || '',
      subject: data.subject?.trim() || '',
      description: data.description?.trim() || '',
      priority: data.priority || 'medium',
      status: 'pending',
      dueDate: data.dueDate || null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    all.push(task)
    storageService.set(TASKS_KEY, all)
    return task
  },

  /** Update fields of an existing task */
  update(id, updates) {
    const all = storageService.get(TASKS_KEY) || []
    const idx = all.findIndex(t => t.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
    storageService.set(TASKS_KEY, all)
    return all[idx]
  },

  /** Permanently remove a task */
  remove(id) {
    const all = storageService.get(TASKS_KEY) || []
    storageService.set(TASKS_KEY, all.filter(t => t.id !== id))
  },

  /** Toggle task between 'pending' and 'completed' */
  toggleComplete(id) {
    const all = storageService.get(TASKS_KEY) || []
    const task = all.find(t => t.id === id)
    if (!task) return null
    task.status = task.status === 'completed' ? 'pending' : 'completed'
    task.completedAt = task.status === 'completed' ? new Date().toISOString() : null
    task.updatedAt = new Date().toISOString()
    storageService.set(TASKS_KEY, all)
    return task
  }
}
