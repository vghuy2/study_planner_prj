<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin   from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarDays, Flag, CheckCircle2, Circle, X } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useTaskStore } from '@/features/tasks/stores/task.store'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const taskStore = useTaskStore()
onMounted(() => taskStore.fetchTasks())

// ─── Event Detail Sidebar ────────────────────────────────────────────────────
const selectedTask = ref(null)

function handleEventClick(info) {
  selectedTask.value = info.event.extendedProps
}

function closeDetail() {
  selectedTask.value = null
}

function toggleTask() {
  if (!selectedTask.value?.id) return
  taskStore.toggleComplete(selectedTask.value.id)
  // Sync selected task status
  const updated = taskStore.tasks.find(t => t.id === selectedTask.value.id)
  if (updated) selectedTask.value = { ...selectedTask.value, status: updated.status }
}

// ─── FullCalendar Options ────────────────────────────────────────────────────
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left:   'prev,next today',
    center: 'title',
    right:  'dayGridMonth,dayGridWeek'
  },
  events:         taskStore.calendarEvents,
  height:         'auto',
  dayMaxEventRows: 3,
  moreLinkText:   n => `+${n} more`,
  eventClick:     handleEventClick,
  eventMouseEnter: info => { info.el.style.cursor = 'pointer' }
}))
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View tasks and deadlines on a monthly calendar.
        </p>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"/><span>High</span></div>
        <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500"/><span>Medium</span></div>
        <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500"/><span>Low</span></div>
        <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"/><span>Completed</span></div>
      </div>
    </div>

    <div class="flex gap-5 items-start">

      <!-- ── Calendar ──────────────────────────────────────────────────────── -->
      <div
        class="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 overflow-hidden fc-custom"
      >
        <FullCalendar :options="calendarOptions" />
      </div>

      <!-- ── Task Detail Panel ──────────────────────────────────────────────── -->
      <Transition name="slide-in">
        <div
          v-if="selectedTask"
          class="w-72 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-5 flex-shrink-0 space-y-4"
        >
          <!-- Panel Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white">Task Detail</h3>
            <button
              @click="closeDetail"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Toggle Complete -->
          <button
            @click="toggleTask"
            class="flex items-start gap-3 w-full text-left group"
          >
            <CheckCircle2
              v-if="selectedTask.status === 'completed'"
              class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
            />
            <Circle
              v-else
              class="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors"
            />
            <span
              class="text-sm font-semibold text-gray-900 dark:text-white"
              :class="{ 'line-through text-gray-400 dark:text-gray-500': selectedTask.status === 'completed' }"
            >
              {{ selectedTask.title }}
            </span>
          </button>

          <!-- Badges -->
          <div class="flex flex-wrap gap-1.5">
            <BaseBadge :variant="selectedTask.priority">
              <Flag class="w-3 h-3" />
              {{ selectedTask.priority }}
            </BaseBadge>
            <BaseBadge :variant="selectedTask.status === 'completed' ? 'completed' : 'neutral'">
              {{ selectedTask.status }}
            </BaseBadge>
          </div>

          <!-- Subject -->
          <p v-if="selectedTask.subject" class="text-xs text-gray-500 dark:text-gray-400">
            📚 {{ selectedTask.subject }}
          </p>

          <!-- Due Date -->
          <div v-if="selectedTask.dueDate" class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarDays class="w-4 h-4 flex-shrink-0" />
            <span>{{ dayjs(selectedTask.dueDate).format('MMMM D, YYYY') }}</span>
          </div>

          <!-- Description -->
          <p
            v-if="selectedTask.description"
            class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed"
          >
            {{ selectedTask.description }}
          </p>

          <!-- Close -->
          <button
            @click="closeDetail"
            class="w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style>
/* ── FullCalendar Custom Styles ─────────────────────────────────────────────── */
.fc-custom .fc-button-primary {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  border-radius: 0.5rem !important;
  padding: 0.375rem 0.75rem !important;
}
.fc-custom .fc-button-primary:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}
.fc-custom .fc-button-primary:disabled {
  opacity: 0.5 !important;
}
.fc-custom .fc-button-active {
  background-color: #1e40af !important;
}
.fc-custom .fc-toolbar-title {
  font-size: 1rem !important;
  font-weight: 700 !important;
}
.fc-custom .fc-daygrid-day.fc-day-today {
  background-color: rgba(59,130,246,0.07) !important;
}
.fc-custom .fc-daygrid-event {
  border-radius: 4px !important;
  padding: 1px 4px !important;
  font-size: 0.7rem !important;
  font-weight: 500 !important;
}
.fc-custom .fc-event:hover {
  opacity: 0.85 !important;
}
.fc-custom .fc-more-link {
  color: #3b82f6 !important;
  font-size: 0.7rem !important;
}
/* Dark mode overrides */
.dark .fc-custom .fc-toolbar-title,
.dark .fc-custom .fc-col-header-cell-cushion,
.dark .fc-custom .fc-daygrid-day-number {
  color: #d1d5db !important;
}
.dark .fc-custom .fc-scrollgrid {
  border-color: #374151 !important;
}
.dark .fc-custom td,
.dark .fc-custom th {
  border-color: #1f2937 !important;
}
.dark .fc-custom .fc-daygrid-day.fc-day-today {
  background-color: rgba(59,130,246,0.1) !important;
}
</style>

<style scoped>
.slide-in-enter-active, .slide-in-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-in-enter-from, .slide-in-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
