import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '@/services/storage.service'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const SESSIONS_KEY = 'sp_sessions'

export const POMODORO_MODES = {
  focus:      { label: 'Focus',       duration: 25 * 60 },
  shortBreak: { label: 'Short Break', duration: 5  * 60 },
  longBreak:  { label: 'Long Break',  duration: 15 * 60 }
}

export const usePomodoroStore = defineStore('pomodoro', () => {
  const authStore = useAuthStore()

  // ─── State ────────────────────────────────────────────────────────────────
  const mode         = ref('focus')
  const timeLeft     = ref(POMODORO_MODES.focus.duration)
  const isRunning    = ref(false)
  const sessionCount = ref(0)
  const sessions     = ref([])

  let intervalId = null

  // ─── Actions ──────────────────────────────────────────────────────────────

  function loadSessions() {
    if (!authStore.currentUser?.id) return
    const all = storageService.get(SESSIONS_KEY) || []
    sessions.value = all.filter(s => s.userId === authStore.currentUser.id)
    // Restore today's focus session count
    const today = dayjs().format('YYYY-MM-DD')
    sessionCount.value = sessions.value.filter(
      s => s.mode === 'focus' && dayjs(s.completedAt).format('YYYY-MM-DD') === today
    ).length
  }

  function setMode(newMode) {
    pause()
    mode.value     = newMode
    timeLeft.value = POMODORO_MODES[newMode].duration
  }

  /** Start the countdown. No-op if already running. */
  function start() {
    if (isRunning.value) return
    isRunning.value = true
    intervalId = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        _complete()
      }
    }, 1000)
  }

  /** Pause the countdown. No-op if already paused. */
  function pause() {
    if (!isRunning.value) return
    isRunning.value = false
    clearInterval(intervalId)
    intervalId = null
  }

  /** Reset to the beginning of the current mode. */
  function reset() {
    pause()
    timeLeft.value = POMODORO_MODES[mode.value].duration
  }

  /** Skip to the next mode without saving a session. */
  function skip() {
    pause()
    _autoNextMode()
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  function _complete() {
    pause()
    if (mode.value === 'focus') {
      sessionCount.value++
      _saveSession()
    }
    _autoNextMode()
  }

  function _autoNextMode() {
    if (mode.value === 'focus') {
      const next = sessionCount.value % 4 === 0 ? 'longBreak' : 'shortBreak'
      setMode(next)
    } else {
      setMode('focus')
    }
  }

  function _saveSession() {
    if (!authStore.currentUser?.id) return
    const all = storageService.get(SESSIONS_KEY) || []
    const session = {
      id: uuidv4(),
      userId: authStore.currentUser.id,
      duration: POMODORO_MODES.focus.duration / 60, // stored in minutes
      mode: 'focus',
      completedAt: new Date().toISOString()
    }
    all.push(session)
    storageService.set(SESSIONS_KEY, all)
    sessions.value.push(session)
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  const totalDuration = computed(() => POMODORO_MODES[mode.value].duration)

  /** 0 → 1 progress (1 means fully elapsed) */
  const progress = computed(() => 1 - timeLeft.value / totalDuration.value)

  const formattedTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
    const s = (timeLeft.value % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  })

  /** Hours studied each of the last 7 days (oldest → newest) */
  const weeklyHours = computed(() => {
    const hours = []
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      const minutes = sessions.value
        .filter(s => s.mode === 'focus' && dayjs(s.completedAt).format('YYYY-MM-DD') === date)
        .reduce((sum, s) => sum + (s.duration || 0), 0)
      hours.push(parseFloat((minutes / 60).toFixed(1)))
    }
    return hours
  })

  /** Minutes studied today */
  const todayMinutes = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return sessions.value
      .filter(s => s.mode === 'focus' && dayjs(s.completedAt).format('YYYY-MM-DD') === today)
      .reduce((sum, s) => sum + (s.duration || 0), 0)
  })

  /** All sessions completed today, newest first */
  const todaySessions = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return sessions.value
      .filter(s => dayjs(s.completedAt).format('YYYY-MM-DD') === today)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  })

  return {
    mode, timeLeft, isRunning, sessionCount, sessions,
    totalDuration, progress, formattedTime,
    weeklyHours, todayMinutes, todaySessions,
    loadSessions, setMode, start, pause, reset, skip
  }
})
