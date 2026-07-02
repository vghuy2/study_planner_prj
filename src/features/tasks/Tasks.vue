<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus, Search, CheckCircle2, Circle,
  Trash2, CalendarDays, Flag, Pencil
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from 'dayjs'
import { useTaskStore } from './stores/task.store'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const taskStore = useTaskStore()
onMounted(() => taskStore.fetchTasks())

// ─── Filter State ─────────────────────────────────────────────────────────────
const activeFilter = ref('all')
const searchQuery  = ref('')
const priorityFilter = ref('all')

const STATUS_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'completed', label: 'Completed' }
]

const filteredTasks = computed(() => {
  let result = [...taskStore.tasks]

  if (activeFilter.value !== 'all')
    result = result.filter(t => t.status === activeFilter.value)

  if (priorityFilter.value !== 'all')
    result = result.filter(t => t.priority === priorityFilter.value)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.subject || '').toLowerCase().includes(q)
    )
  }

  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// ─── Modal State ──────────────────────────────────────────────────────────────
const isModalOpen    = ref(false)
const isEditing      = ref(false)
const editingTaskId  = ref(null)
const isSubmitting   = ref(false)

const INITIAL_FORM = () => ({
  title: '', subject: '', description: '',
  priority: 'medium', dueDate: ''
})
const form       = ref(INITIAL_FORM())
const formErrors = ref({})

const SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology',
  'Literature','History','Geography','English',
  'Computer Science','Economics','Other'
]

// ─── Modal Actions ────────────────────────────────────────────────────────────
function openAddModal() {
  isEditing.value     = false
  editingTaskId.value = null
  form.value          = INITIAL_FORM()
  formErrors.value    = {}
  isModalOpen.value   = true
}

function openEditModal(task) {
  isEditing.value     = true
  editingTaskId.value = task.id
  form.value = {
    title:       task.title,
    subject:     task.subject || '',
    description: task.description || '',
    priority:    task.priority,
    dueDate:     task.dueDate || ''
  }
  formErrors.value  = {}
  isModalOpen.value = true
}

function validate() {
  const errors = {}
  if (!form.value.title.trim()) errors.title = 'Title is required'
  formErrors.value = errors
  return !Object.keys(errors).length
}

async function handleSubmit() {
  if (!validate()) return
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      taskStore.updateTask(editingTaskId.value, { ...form.value })
      toast.success('Task updated!')
    } else {
      taskStore.addTask({ ...form.value })
      toast.success('Task added!')
    }
    isModalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

function handleDelete(task) {
  taskStore.deleteTask(task.id)
  toast.success('Task deleted')
}

function handleToggle(id) {
  taskStore.toggleComplete(id)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dueDateMeta(date) {
  if (!date) return null
  const diff = dayjs(date).diff(dayjs(), 'day')
  if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, cls: 'text-red-500 dark:text-red-400' }
  if (diff === 0) return { label: 'Due today',    cls: 'text-amber-500 dark:text-amber-400' }
  if (diff === 1) return { label: 'Due tomorrow', cls: 'text-amber-500 dark:text-amber-400' }
  return { label: `Due ${dayjs(date).format('MMM D')}`, cls: 'text-gray-400 dark:text-gray-500' }
}
</script>

<template>
  <div class="space-y-5 max-w-4xl mx-auto">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {{ taskStore.completedTasks.length }} of {{ taskStore.tasks.length }} completed
        </p>
      </div>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
      >
        <Plus class="w-4 h-4" />
        Add Task
      </button>
    </div>

    <!-- ── Filters ──────────────────────────────────────────────────────────── -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5 flex flex-col sm:flex-row gap-3 shadow-sm">
      <!-- Search -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tasks..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <!-- Status Tabs -->
      <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 self-start">
        <button
          v-for="f in STATUS_FILTERS"
          :key="f.key"
          @click="activeFilter = f.key"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
          :class="activeFilter === f.key
            ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Priority Filter -->
      <select
        v-model="priorityFilter"
        class="text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        <option value="all">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>

    <!-- ── Task List ────────────────────────────────────────────────────────── -->
    <div class="space-y-2">

      <!-- Empty State -->
      <div
        v-if="filteredTasks.length === 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm"
      >
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 class="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">No tasks found</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ taskStore.tasks.length === 0 ? 'Start by adding your first task.' : 'Try adjusting your filters.' }}
        </p>
        <button
          v-if="taskStore.tasks.length === 0"
          @click="openAddModal"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          <Plus class="w-4 h-4" /> Add your first task
        </button>
      </div>

      <!-- Task Card -->
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3.5 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
        :class="{ 'opacity-55': task.status === 'completed' }"
      >
        <!-- Checkbox -->
        <button
          @click="handleToggle(task.id)"
          class="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        >
          <CheckCircle2
            v-if="task.status === 'completed'"
            class="w-5 h-5 text-emerald-500"
          />
          <Circle
            v-else
            class="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors"
          />
        </button>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p
              class="text-sm font-medium text-gray-900 dark:text-white leading-snug"
              :class="{ 'line-through text-gray-400 dark:text-gray-500': task.status === 'completed' }"
            >
              {{ task.title }}
            </p>

            <!-- Hover actions -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                @click="openEditModal(task)"
                class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="Edit"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                @click="handleDelete(task)"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              v-if="task.subject"
              class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
            >
              {{ task.subject }}
            </span>

            <BaseBadge :variant="task.priority">
              <Flag class="w-2.5 h-2.5" />
              {{ task.priority }}
            </BaseBadge>

            <span
              v-if="task.dueDate && dueDateMeta(task.dueDate)"
              class="text-xs flex items-center gap-1"
              :class="dueDateMeta(task.dueDate).cls"
            >
              <CalendarDays class="w-3 h-3" />
              {{ dueDateMeta(task.dueDate).label }}
            </span>
          </div>

          <p
            v-if="task.description"
            class="mt-1.5 text-xs text-gray-400 dark:text-gray-500 line-clamp-2"
          >
            {{ task.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit Modal ─────────────────────────────────────────────────── -->
    <BaseModal
      :isOpen="isModalOpen"
      :title="isEditing ? 'Edit Task' : 'New Task'"
      size="md"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4" id="task-form">
        <BaseInput
          id="task-title"
          label="Title *"
          v-model="form.title"
          :error="formErrors.title"
          placeholder="What do you need to study?"
        />

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Subject</label>
            <select
              v-model="form.subject"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Select subject</option>
              <option v-for="s in SUBJECTS" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Priority</label>
            <select
              v-model="form.priority"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Due Date</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Add notes or details..."
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none"
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="isModalOpen = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="task-form"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isEditing ? 'Update Task' : 'Add Task' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
