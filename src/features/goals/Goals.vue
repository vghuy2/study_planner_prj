<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Target, CheckCircle2, Circle, Trash2, CalendarDays, Pencil } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from 'dayjs'
import { useGoalStore } from './stores/goal.store'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const goalStore = useGoalStore()
onMounted(() => goalStore.fetchGoals())

// ─── Modal State ──────────────────────────────────────────────────────────────
const isModalOpen    = ref(false)
const isEditing      = ref(false)
const editingGoalId  = ref(null)
const isSubmitting   = ref(false)

const INITIAL_FORM = () => ({
  title: '',
  description: '',
  targetDate: '',
  status: 'in-progress'
})
const form       = ref(INITIAL_FORM())
const formErrors = ref({})

// ─── Modal Actions ────────────────────────────────────────────────────────────
function openAddModal() {
  isEditing.value     = false
  editingGoalId.value = null
  form.value          = INITIAL_FORM()
  formErrors.value    = {}
  isModalOpen.value   = true
}

function openEditModal(goal) {
  isEditing.value     = true
  editingGoalId.value = goal.id
  form.value = {
    title:       goal.title,
    description: goal.description || '',
    targetDate:  goal.targetDate || '',
    status:      goal.status
  }
  formErrors.value  = {}
  isModalOpen.value = true
}

function validate() {
  const errors = {}
  if (!form.value.title.trim()) errors.title = 'Title is required'
  if (!form.value.targetDate) errors.targetDate = 'Target date is required'
  formErrors.value = errors
  return !Object.keys(errors).length
}

async function handleSubmit() {
  if (!validate()) return
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      goalStore.updateGoal(editingGoalId.value, { ...form.value })
      toast.success('Goal updated!')
    } else {
      goalStore.addGoal({ ...form.value })
      toast.success('Goal added!')
    }
    isModalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

function handleDelete(goal) {
  goalStore.deleteGoal(goal.id)
  toast.success('Goal deleted')
}

function handleToggleStatus(goal) {
  const newStatus = goal.status === 'completed' ? 'in-progress' : 'completed'
  goalStore.updateGoal(goal.id, { status: newStatus })
  toast.success(`Goal marked as ${newStatus}`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function targetDateMeta(date) {
  if (!date) return null
  const diff = dayjs(date).diff(dayjs(), 'day')
  if (diff < 0)   return { label: `Missed by ${Math.abs(diff)}d`, cls: 'text-red-500 dark:text-red-400' }
  if (diff === 0) return { label: 'Target today',    cls: 'text-amber-500 dark:text-amber-400' }
  if (diff === 1) return { label: 'Target tomorrow', cls: 'text-amber-500 dark:text-amber-400' }
  return { label: `Target: ${dayjs(date).format('MMM D, YYYY')}`, cls: 'text-gray-500 dark:text-gray-400' }
}

const sortedGoals = computed(() => {
  return [...goalStore.goals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})
</script>

<template>
  <div class="space-y-5 max-w-4xl mx-auto">
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {{ goalStore.completedGoals.length }} of {{ goalStore.goals.length }} goals achieved
        </p>
      </div>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
      >
        <Plus class="w-4 h-4" />
        New Goal
      </button>
    </div>

    <!-- ── Goal List ────────────────────────────────────────────────────────── -->
    <div class="space-y-3">
      <!-- Empty State -->
      <div
        v-if="sortedGoals.length === 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm"
      >
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target class="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">No goals yet</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Start by setting your first learning goal.
        </p>
        <button
          @click="openAddModal"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          <Plus class="w-4 h-4" /> Create Goal
        </button>
      </div>

      <!-- Goal Card -->
      <div
        v-for="goal in sortedGoals"
        :key="goal.id"
        class="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
        :class="{ 'opacity-60': goal.status === 'completed' }"
      >
        <div class="flex items-start gap-4 flex-1">
          <button
            @click="handleToggleStatus(goal)"
            class="mt-1 flex-shrink-0 transition-transform hover:scale-110"
          >
            <CheckCircle2
              v-if="goal.status === 'completed'"
              class="w-6 h-6 text-emerald-500"
            />
            <Circle
              v-else
              class="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors"
            />
          </button>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white leading-snug"
                :class="{ 'line-through text-gray-400 dark:text-gray-500': goal.status === 'completed' }"
              >
                {{ goal.title }}
              </h3>
            </div>

            <p
              v-if="goal.description"
              class="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
            >
              {{ goal.description }}
            </p>

            <div class="flex flex-wrap items-center gap-3 mt-3">
              <BaseBadge :variant="goal.status === 'completed' ? 'success' : 'primary'">
                {{ goal.status === 'completed' ? 'Completed' : 'In Progress' }}
              </BaseBadge>
              
              <span
                v-if="goal.targetDate && targetDateMeta(goal.targetDate)"
                class="text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800"
                :class="targetDateMeta(goal.targetDate).cls"
              >
                <CalendarDays class="w-3.5 h-3.5" />
                {{ targetDateMeta(goal.targetDate).label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex sm:flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-3 sm:pt-0 sm:pl-3">
          <button
            @click="openEditModal(goal)"
            class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all w-full flex justify-center"
            title="Edit"
          >
            <Pencil class="w-4 h-4" />
          </button>
          <button
            @click="handleDelete(goal)"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all w-full flex justify-center"
            title="Delete"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit Modal ─────────────────────────────────────────────────── -->
    <BaseModal
      :isOpen="isModalOpen"
      :title="isEditing ? 'Edit Goal' : 'New Goal'"
      size="md"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4" id="goal-form">
        <BaseInput
          id="goal-title"
          label="Title *"
          v-model="form.title"
          :error="formErrors.title"
          placeholder="e.g. Master Vue 3, Pass AWS Exam..."
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Why is this goal important?"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Target Date *</label>
          <input
            v-model="form.targetDate"
            type="date"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
            :class="{ 'border-red-500 ring-red-500': formErrors.targetDate }"
          />
          <p v-if="formErrors.targetDate" class="mt-1.5 text-xs font-medium text-red-500 ml-1">
            {{ formErrors.targetDate }}
          </p>
        </div>

        <div v-if="isEditing">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Status</label>
          <select
            v-model="form.status"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
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
          form="goal-form"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isEditing ? 'Update Goal' : 'Create Goal' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
