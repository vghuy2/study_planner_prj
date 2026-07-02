<script setup>
import { computed, onMounted } from 'vue'
import { Clock, CheckSquare, CalendarDays, TrendingUp, AlertCircle, BarChart3 } from 'lucide-vue-next'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'vue-chartjs'
import dayjs from 'dayjs'
import { useAuthStore }    from '@/features/auth/stores/authStore'
import { useTaskStore }    from '@/features/tasks/stores/task.store'
import { usePomodoroStore } from '@/features/pomodoro/stores/pomodoro.store'
import BaseBadge from '@/components/ui/BaseBadge.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const authStore    = useAuthStore()
const taskStore    = useTaskStore()
const pomodoroStore = usePomodoroStore()

onMounted(() => {
  taskStore.fetchTasks()
  pomodoroStore.loadSessions()
})

// ─── Greeting ────────────────────────────────────────────────────────────────
const firstName = computed(() => (authStore.currentUser?.fullName || 'Student').split(' ')[0])

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

const dateString = computed(() => dayjs().format('ddd, MMM D, YYYY'))

// ─── Today's study time ───────────────────────────────────────────────────────
const todayStudyLabel = computed(() => {
  const m = pomodoroStore.todayMinutes
  if (!m) return '0m'
  const h = Math.floor(m / 60), min = m % 60
  return h ? `${h}h ${min}m` : `${min}m`
})

// ─── Stat cards ───────────────────────────────────────────────────────────────
const statCards = computed(() => [
  {
    name: "Today's Study",
    value: todayStudyLabel.value,
    sub: `${pomodoroStore.todaySessions.filter(s => s.mode === 'focus').length} sessions`,
    icon: Clock,
    color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    name: 'Tasks Completed',
    value: taskStore.completedTasks.length,
    sub: `of ${taskStore.tasks.length} total`,
    icon: CheckSquare,
    color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20'
  },
  {
    name: 'Due Today',
    value: taskStore.todayTasks.length,
    sub: `${taskStore.todayTasks.filter(t => t.status === 'pending').length} still pending`,
    icon: CalendarDays,
    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    name: 'Completion Rate',
    value: taskStore.completionRate + '%',
    sub: taskStore.overdueTasks.length > 0
      ? `${taskStore.overdueTasks.length} overdue`
      : 'Great progress!',
    icon: TrendingUp,
    color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20'
  }
])

// ─── Weekly activity chart ────────────────────────────────────────────────────
const last7Labels = computed(() =>
  Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, 'day').format('ddd'))
)

const weeklyChartData = computed(() => ({
  labels: last7Labels.value,
  datasets: [{
    label: 'Study Hours',
    data: pomodoroStore.weeklyHours,
    backgroundColor: 'rgba(59,130,246,0.55)',
    borderColor: 'rgb(59,130,246)',
    borderWidth: 2,
    borderRadius: 8,
    borderSkipped: false
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}h study` } }
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
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const totalWeeklyHours = computed(() =>
  pomodoroStore.weeklyHours.reduce((a, b) => a + b, 0).toFixed(1)
)

function dueDateLabel(date) {
  if (!date) return null
  const diff = dayjs(date).diff(dayjs(), 'day')
  if (diff < 0)   return `${Math.abs(diff)}d ago`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return dayjs(date).format('MMM D')
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto w-full">

    <!-- ── Greeting ────────────────────────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ greeting }}, {{ firstName }}! 👋
      </h1>
      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        {{ dateString }} · Here's your study overview.
      </p>
    </div>

    <!-- ── Stat Cards ──────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.name"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ card.name }}</p>
            <p class="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">{{ card.value }}</p>
            <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{{ card.sub }}</p>
          </div>
          <div :class="[card.bg, card.color, 'p-2.5 rounded-xl flex-shrink-0']">
            <component :is="card.icon" class="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 1: Weekly Chart + Today's Tasks ─────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Weekly Activity Chart -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Weekly Study Activity</h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Hours of focused study per day</p>
          </div>
          <BarChart3 class="w-5 h-5 text-blue-400" />
        </div>
        <div class="h-52">
          <Bar :data="weeklyChartData" :options="chartOptions" />
        </div>
        <div class="mt-3 flex justify-between text-xs text-gray-400">
          <span>
            This week: <strong class="text-gray-700 dark:text-gray-300">{{ totalWeeklyHours }}h</strong>
          </span>
          <span>{{ pomodoroStore.todaySessions.filter(s => s.mode === 'focus').length }} sessions today</span>
        </div>
      </div>

      <!-- Today's Tasks -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">Today's Tasks</h2>
          <span class="text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            {{ taskStore.todayTasks.length }}
          </span>
        </div>

        <div
          v-if="taskStore.todayTasks.length === 0"
          class="flex-1 flex flex-col items-center justify-center text-center py-6"
        >
          <CheckSquare class="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">No tasks due today</p>
          <router-link to="/tasks" class="mt-1.5 text-xs text-blue-500 hover:underline">
            + Add a task
          </router-link>
        </div>

        <div v-else class="space-y-1.5 overflow-y-auto flex-1 max-h-56 pr-1">
          <div
            v-for="task in taskStore.todayTasks"
            :key="task.id"
            class="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div
              class="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
              :class="task.status === 'completed'
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-300 dark:border-gray-600'"
            >
              <svg v-if="task.status === 'completed'" class="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="text-sm text-gray-800 dark:text-gray-200 truncate"
                :class="{ 'line-through text-gray-400 dark:text-gray-500': task.status === 'completed' }"
              >
                {{ task.title }}
              </p>
              <BaseBadge :variant="task.priority" class="mt-1">{{ task.priority }}</BaseBadge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 2: Upcoming Deadlines + Progress Card ────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Upcoming Deadlines -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
          <router-link to="/tasks" class="text-xs font-medium text-blue-500 hover:underline">View all →</router-link>
        </div>

        <div
          v-if="taskStore.upcomingTasks.length === 0"
          class="flex flex-col items-center justify-center py-8 text-center"
        >
          <CalendarDays class="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
          <p class="text-sm text-gray-500 dark:text-gray-400">No deadlines in the next 7 days</p>
        </div>

        <div v-else class="divide-y divide-gray-50 dark:divide-gray-800/60">
          <div
            v-for="task in taskStore.upcomingTasks"
            :key="task.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="{
                  'bg-red-500':   task.priority === 'high',
                  'bg-amber-500': task.priority === 'medium',
                  'bg-blue-500':  task.priority === 'low'
                }"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ task.title }}</p>
                <p v-if="task.subject" class="text-xs text-gray-400 mt-0.5">{{ task.subject }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 ml-4">
              <BaseBadge :variant="task.priority">{{ task.priority }}</BaseBadge>
              <span class="text-xs text-gray-400 whitespace-nowrap">{{ dueDateLabel(task.dueDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Card -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h2 class="text-base font-bold text-gray-900 dark:text-white mb-4">Overall Progress</h2>

        <!-- Circular Progress Ring -->
        <div class="flex justify-center mb-5">
          <div class="relative w-32 h-32">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke-width="10"
                class="stroke-gray-100 dark:stroke-gray-800" />
              <circle
                cx="60" cy="60" r="50" fill="none" stroke-width="10"
                stroke-linecap="round"
                class="stroke-blue-500 transition-all duration-1000"
                :stroke-dasharray="`${2 * Math.PI * 50}`"
                :stroke-dashoffset="`${2 * Math.PI * 50 * (1 - taskStore.completionRate / 100)}`"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ taskStore.completionRate }}%</span>
              <span class="text-xs text-gray-400">Done</span>
            </div>
          </div>
        </div>

        <!-- Stats breakdown -->
        <div class="space-y-2.5">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Total Tasks</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ taskStore.tasks.length }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-emerald-600 dark:text-emerald-400">Completed</span>
            <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ taskStore.completedTasks.length }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-amber-600 dark:text-amber-400">Pending</span>
            <span class="font-semibold text-amber-600 dark:text-amber-400">{{ taskStore.pendingTasks.length }}</span>
          </div>
          <div v-if="taskStore.overdueTasks.length" class="flex justify-between text-sm">
            <span class="text-red-500 flex items-center gap-1">
              <AlertCircle class="w-3.5 h-3.5" /> Overdue
            </span>
            <span class="font-semibold text-red-500">{{ taskStore.overdueTasks.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
