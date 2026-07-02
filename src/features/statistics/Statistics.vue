<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import { BarChart3, Clock, Target, CheckSquare, TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { statisticsService } from './services/statistics.service'

// Register Chart.js components (only done once, safe to call multiple times)
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const authStore = useAuthStore()
const userId    = computed(() => authStore.currentUser?.id)

// ─── Aggregated Data ──────────────────────────────────────────────────────────
const stats   = computed(() => userId.value ? statisticsService.getOverallStats(userId.value)       : null)
const weekly  = computed(() => userId.value ? statisticsService.getWeeklyStudyHours(userId.value)  : [])
const monthly = computed(() => userId.value ? statisticsService.getMonthlyStudyHours(userId.value) : [])
const weeklyCompletions = computed(() => userId.value ? statisticsService.getWeeklyTaskCompletions(userId.value) : [])
const priorityDist      = computed(() => userId.value ? statisticsService.getTasksByPriority(userId.value)       : { high: 0, medium: 0, low: 0 })

// ─── Chart Datasets ───────────────────────────────────────────────────────────
const weeklyHoursChart = computed(() => ({
  labels: weekly.value.map(d => d.label),
  datasets: [{
    label: 'Study Hours',
    data: weekly.value.map(d => d.hours),
    backgroundColor: 'rgba(59, 130, 246, 0.55)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: 2, borderRadius: 8, borderSkipped: false
  }]
}))

const monthlyHoursChart = computed(() => ({
  labels: monthly.value.map(d => d.label),
  datasets: [{
    label: 'Study Hours',
    data: monthly.value.map(d => d.hours),
    backgroundColor: 'rgba(139, 92, 246, 0.55)',
    borderColor: 'rgb(139, 92, 246)',
    borderWidth: 2, borderRadius: 8, borderSkipped: false
  }]
}))

const completionChart = computed(() => ({
  labels: weeklyCompletions.value.map(d => d.label),
  datasets: [{
    label: 'Tasks Completed',
    data: weeklyCompletions.value.map(d => d.count),
    backgroundColor: 'rgba(16, 185, 129, 0.55)',
    borderColor: 'rgb(16, 185, 129)',
    borderWidth: 2, borderRadius: 8, borderSkipped: false
  }]
}))

const priorityChart = computed(() => ({
  labels: ['High Priority', 'Medium Priority', 'Low Priority'],
  datasets: [{
    data: [priorityDist.value.high, priorityDist.value.medium, priorityDist.value.low],
    backgroundColor: [
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(59, 130, 246, 0.8)'
    ],
    borderColor: ['rgb(220,38,38)', 'rgb(217,119,6)', 'rgb(37,99,235)'],
    borderWidth: 2,
    hoverOffset: 6
  }]
}))

// ─── Chart Options ────────────────────────────────────────────────────────────
const makeBarOptions = (suffix = 'h') => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: ctx => ` ${ctx.parsed.y}${suffix}` }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(156,163,175,0.15)' },
      ticks: { color: '#9ca3af', font: { size: 11 } }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af', font: { size: 11 } }
    }
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 12 }, color: '#6b7280', padding: 16, usePointStyle: true }
    }
  }
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
const summaryCards = computed(() => [
  { label: 'Total Study Hours', value: `${stats.value?.totalHours ?? 0}h`,   icon: Clock,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
  { label: 'Total Sessions',    value:   stats.value?.totalSessions ?? 0,    icon: Target,       color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Tasks Completed',   value:   stats.value?.completedTasks ?? 0,   icon: CheckSquare,  color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20'   },
  { label: 'Completion Rate',   value: `${stats.value?.completionRate ?? 0}%`, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
])

const hasTasks = computed(() =>
  (priorityDist.value.high + priorityDist.value.medium + priorityDist.value.low) > 0
)
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Track your study habits and performance over time.
      </p>
    </div>

    <!-- ── Summary Cards ──────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3"
      >
        <div :class="[card.bg, card.color, 'p-2.5 rounded-xl flex-shrink-0']">
          <component :is="card.icon" class="w-5 h-5" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ card.label }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ card.value }}</p>
        </div>
      </div>
    </div>

    <!-- ── Weekly Report ──────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div class="mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">Weekly Study Hours</h2>
          <p class="text-xs text-gray-400 mt-0.5">Hours of focused study per day (last 7 days)</p>
        </div>
        <div class="h-52">
          <Bar :data="weeklyHoursChart" :options="makeBarOptions('h')" />
        </div>
      </div>

      <!-- Weekly Task Completions -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div class="mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">Weekly Task Completions</h2>
          <p class="text-xs text-gray-400 mt-0.5">Tasks completed each day this week</p>
        </div>
        <div class="h-52">
          <Bar :data="completionChart" :options="makeBarOptions(' tasks')" />
        </div>
      </div>
    </div>

    <!-- ── Monthly Report ────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div class="mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">Monthly Study Hours</h2>
          <p class="text-xs text-gray-400 mt-0.5">Total hours studied per month (last 6 months)</p>
        </div>
        <div class="h-52">
          <Bar :data="monthlyHoursChart" :options="makeBarOptions('h')" />
        </div>
      </div>

      <!-- Priority Distribution Doughnut -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div class="mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">Task Priority Distribution</h2>
          <p class="text-xs text-gray-400 mt-0.5">Breakdown of all tasks by priority</p>
        </div>
        <div class="h-52 flex items-center justify-center">
          <Doughnut
            v-if="hasTasks"
            :data="priorityChart"
            :options="doughnutOptions"
            class="w-full h-full"
          />
          <div v-else class="text-center">
            <BarChart3 class="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            <p class="text-sm text-gray-400 dark:text-gray-500">No task data yet</p>
            <router-link to="/tasks" class="text-xs text-blue-500 hover:underline mt-1 inline-block">Add tasks →</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
