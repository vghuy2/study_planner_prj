<script setup>
import { computed, onMounted } from 'vue'
import { Play, Pause, RotateCcw, SkipForward, Timer, Coffee, Moon } from 'lucide-vue-next'
import { usePomodoroStore, POMODORO_MODES } from '../stores/pomodoro.store'
import dayjs from 'dayjs'

const store = usePomodoroStore()
onMounted(() => store.loadSessions())

// ─── SVG Circular Progress ────────────────────────────────────────────────────
const RADIUS       = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * stroke-dashoffset = 0            → full ring   (start of session)
 * stroke-dashoffset = CIRCUMFERENCE → empty ring  (end of session)
 */
const strokeDashoffset = computed(() =>
  CIRCUMFERENCE * (1 - store.progress)
)

// ─── Mode Config ──────────────────────────────────────────────────────────────
const MODES = [
  { key: 'focus',      label: 'Focus',       icon: Timer,  colorClass: 'text-blue-600 dark:text-blue-400',   activeRing: 'stroke-blue-500',   activeBg: 'bg-blue-600 shadow-blue-500/30'   },
  { key: 'shortBreak', label: 'Short Break', icon: Coffee, colorClass: 'text-teal-600 dark:text-teal-400',   activeRing: 'stroke-teal-500',   activeBg: 'bg-teal-600 shadow-teal-500/30'   },
  { key: 'longBreak',  label: 'Long Break',  icon: Moon,   colorClass: 'text-purple-600 dark:text-purple-400', activeRing: 'stroke-purple-500', activeBg: 'bg-purple-600 shadow-purple-500/30' }
]

const currentMode = computed(() => MODES.find(m => m.key === store.mode))

const tipText = computed(() => {
  if (store.mode === 'focus')      return '💡 Stay focused! Eliminate distractions for 25 minutes.'
  if (store.mode === 'shortBreak') return '☕ Short break — stretch, hydrate, rest your eyes.'
  return '🌙 Long break earned! Rest and recharge fully.'
})

// ─── Today summary ────────────────────────────────────────────────────────────
const todayFocusSessions  = computed(() => store.todaySessions.filter(s => s.mode === 'focus').length)
const todayBreakSessions  = computed(() => store.todaySessions.filter(s => s.mode !== 'focus').length)

const todayTimeFormatted = computed(() => {
  const m = store.todayMinutes
  if (!m) return '0m'
  const h = Math.floor(m / 60)
  const min = m % 60
  return h ? `${h}h ${min}m` : `${min}m`
})

// ─── Session dots (4 dots per long-break cycle) ───────────────────────────────
const dotsFilled = computed(() => {
  const count = store.sessionCount % 4
  return count === 0 && store.sessionCount > 0 ? 4 : count
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">

    <!-- ── Page Header ──────────────────────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Stay focused with structured study sessions.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ── Timer Card ────────────────────────────────────────────────────── -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm flex flex-col items-center gap-6">

        <!-- Mode Selector -->
        <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            v-for="m in MODES"
            :key="m.key"
            @click="store.setMode(m.key)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            :class="store.mode === m.key
              ? ['bg-white dark:bg-gray-900 shadow-sm', m.colorClass]
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
          >
            <component :is="m.icon" class="w-3.5 h-3.5" />
            {{ m.label }}
          </button>
        </div>

        <!-- SVG Ring Timer -->
        <div class="relative select-none">
          <svg
            class="w-56 h-56 -rotate-90"
            viewBox="0 0 200 200"
          >
            <!-- Background track -->
            <circle
              cx="100" cy="100" :r="RADIUS"
              fill="none" stroke-width="10"
              class="stroke-gray-100 dark:stroke-gray-800"
            />
            <!-- Progress arc -->
            <circle
              cx="100" cy="100" :r="RADIUS"
              fill="none" stroke-width="10"
              stroke-linecap="round"
              :class="currentMode?.activeRing"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="strokeDashoffset"
              style="transition: stroke-dashoffset 0.8s ease, stroke 0.4s ease;"
            />
          </svg>

          <!-- Center display -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-1 rotate-0">
            <span class="text-5xl font-bold tracking-tight tabular-nums text-gray-900 dark:text-white">
              {{ store.formattedTime }}
            </span>
            <span class="text-sm font-medium text-gray-400 dark:text-gray-500">
              {{ POMODORO_MODES[store.mode].label }}
            </span>
            <span
              v-if="store.isRunning"
              class="text-xs text-gray-400 animate-pulse"
            >
              Running...
            </span>
          </div>
        </div>

        <!-- Session dots -->
        <div class="flex items-center gap-2">
          <div
            v-for="i in 4"
            :key="i"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="i <= dotsFilled ? currentMode?.activeBg?.split(' ')[0] || 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
          />
          <span class="text-xs text-gray-400 ml-1">{{ store.sessionCount }} sessions today</span>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-4">
          <button
            @click="store.reset()"
            class="p-3 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Reset"
          >
            <RotateCcw class="w-5 h-5" />
          </button>

          <!-- Start / Pause / Resume -->
          <button
            @click="store.isRunning ? store.pause() : store.start()"
            class="flex items-center gap-2.5 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            :class="currentMode?.activeBg"
          >
            <Pause v-if="store.isRunning" class="w-5 h-5" />
            <Play  v-else                 class="w-5 h-5" />
            <span v-if="store.isRunning">Pause</span>
            <span v-else-if="store.timeLeft < POMODORO_MODES[store.mode].duration">Resume</span>
            <span v-else>Start</span>
          </button>

          <button
            @click="store.skip()"
            class="p-3 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Skip to next"
          >
            <SkipForward class="w-5 h-5" />
          </button>
        </div>

        <!-- Tip -->
        <p class="text-sm text-center text-gray-400 dark:text-gray-500 max-w-xs">
          {{ tipText }}
        </p>
      </div>

      <!-- ── Side Panel ──────────────────────────────────────────────────── -->
      <div class="flex flex-col gap-4">

        <!-- Today's Stats -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Today's Stats</h3>
          <div class="space-y-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Study time</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ todayTimeFormatted }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Focus sessions</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ todayFocusSessions }}</span>
            </div>
            <div class="h-px bg-gray-100 dark:bg-gray-800" />
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Breaks taken</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ todayBreakSessions }}</span>
            </div>
          </div>
        </div>

        <!-- Session History -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex-1 min-h-0">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Session History</h3>

          <div
            v-if="store.todaySessions.length === 0"
            class="flex flex-col items-center justify-center py-8 text-center"
          >
            <Timer class="w-9 h-9 text-gray-300 dark:text-gray-700 mb-2" />
            <p class="text-xs text-gray-400">No sessions today yet.</p>
            <p class="text-xs text-gray-400 mt-0.5">Start your first session!</p>
          </div>

          <div v-else class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <div
              v-for="session in store.todaySessions"
              :key="session.id"
              class="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <div class="flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :class="{
                    'bg-blue-500':   session.mode === 'focus',
                    'bg-teal-500':   session.mode === 'shortBreak',
                    'bg-purple-500': session.mode === 'longBreak'
                  }"
                />
                <span class="text-xs text-gray-600 dark:text-gray-400">
                  {{ session.mode === 'focus' ? 'Focus' : session.mode === 'shortBreak' ? 'Short Break' : 'Long Break' }}
                </span>
              </div>
              <div class="text-right">
                <p class="text-xs font-semibold text-gray-900 dark:text-white">{{ session.duration }}m</p>
                <p class="text-xs text-gray-400">{{ dayjs(session.completedAt).format('HH:mm') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
