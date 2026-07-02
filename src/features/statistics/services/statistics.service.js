import { storageService } from '@/services/storage.service'
import dayjs from 'dayjs'

const TASKS_KEY    = 'sp_tasks'
const SESSIONS_KEY = 'sp_sessions'

export const statisticsService = {
  /**
   * Study hours per day for the last 7 days.
   * Returns: [{ label: 'Mon', fullLabel: 'Jul 1', hours: 1.5 }, ...]
   */
  getWeeklyStudyHours(userId) {
    const sessions = (storageService.get(SESSIONS_KEY) || [])
      .filter(s => s.userId === userId && s.mode === 'focus')

    return Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day')
      const dateStr = date.format('YYYY-MM-DD')
      const minutes = sessions
        .filter(s => dayjs(s.completedAt).format('YYYY-MM-DD') === dateStr)
        .reduce((sum, s) => sum + (s.duration || 0), 0)
      return {
        label:     date.format('ddd'),
        fullLabel: date.format('MMM D'),
        hours:     parseFloat((minutes / 60).toFixed(1))
      }
    })
  },

  /**
   * Study hours per month for the last 6 months.
   * Returns: [{ label: 'Jan', hours: 12.5 }, ...]
   */
  getMonthlyStudyHours(userId) {
    const sessions = (storageService.get(SESSIONS_KEY) || [])
      .filter(s => s.userId === userId && s.mode === 'focus')

    return Array.from({ length: 6 }, (_, i) => {
      const month    = dayjs().subtract(5 - i, 'month')
      const monthStr = month.format('YYYY-MM')
      const minutes = sessions
        .filter(s => s.completedAt && s.completedAt.startsWith(monthStr))
        .reduce((sum, s) => sum + (s.duration || 0), 0)
      return {
        label: month.format('MMM YYYY'),
        hours: parseFloat((minutes / 60).toFixed(1))
      }
    })
  },

  /**
   * Tasks completed per day for the last 7 days.
   * Returns: [{ label: 'Mon', count: 3 }, ...]
   */
  getWeeklyTaskCompletions(userId) {
    const tasks = (storageService.get(TASKS_KEY) || []).filter(t => t.userId === userId)

    return Array.from({ length: 7 }, (_, i) => {
      const date    = dayjs().subtract(6 - i, 'day')
      const dateStr = date.format('YYYY-MM-DD')
      const count   = tasks.filter(t =>
        t.completedAt && dayjs(t.completedAt).format('YYYY-MM-DD') === dateStr
      ).length
      return { label: date.format('ddd'), count }
    })
  },

  /**
   * Task counts grouped by priority.
   * Returns: { high: N, medium: N, low: N }
   */
  getTasksByPriority(userId) {
    const tasks = (storageService.get(TASKS_KEY) || []).filter(t => t.userId === userId)
    return {
      high:   tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low:    tasks.filter(t => t.priority === 'low').length
    }
  },

  /**
   * Aggregate overview stats for the profile/dashboard cards.
   */
  getOverallStats(userId) {
    const tasks    = (storageService.get(TASKS_KEY)    || []).filter(t => t.userId === userId)
    const sessions = (storageService.get(SESSIONS_KEY) || []).filter(s => s.userId === userId && s.mode === 'focus')

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const completed    = tasks.filter(t => t.status === 'completed').length
    const todayStart   = dayjs().startOf('day')

    return {
      totalTasks:      tasks.length,
      completedTasks:  completed,
      pendingTasks:    tasks.filter(t => t.status === 'pending').length,
      overdueTasks:    tasks.filter(t =>
        t.status !== 'completed' && t.dueDate && dayjs(t.dueDate).isBefore(todayStart)
      ).length,
      completionRate:  tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      totalSessions:   sessions.length,
      totalMinutes,
      totalHours:      parseFloat((totalMinutes / 60).toFixed(1))
    }
  }
}
