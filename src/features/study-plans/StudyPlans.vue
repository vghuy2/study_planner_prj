<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, BookOpen, Trash2, CalendarDays, Pencil, Target } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import dayjs from 'dayjs'
import { useStudyPlanStore } from './stores/study-plan.store'
import { useGoalStore } from '@/features/goals/stores/goal.store'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const studyPlanStore = useStudyPlanStore()
const goalStore = useGoalStore()

onMounted(() => {
  goalStore.fetchGoals()
  studyPlanStore.fetchStudyPlans()
})

// ─── Modal State ──────────────────────────────────────────────────────────────
const isModalOpen      = ref(false)
const isEditing        = ref(false)
const editingPlanId    = ref(null)
const isSubmitting     = ref(false)

const INITIAL_FORM = () => ({
  goalId: '',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'draft'
})
const form       = ref(INITIAL_FORM())
const formErrors = ref({})

// ─── Modal Actions ────────────────────────────────────────────────────────────
function openAddModal() {
  isEditing.value     = false
  editingPlanId.value = null
  form.value          = INITIAL_FORM()
  formErrors.value    = {}
  isModalOpen.value   = true
}

function openEditModal(plan) {
  isEditing.value     = true
  editingPlanId.value = plan.id
  form.value = {
    goalId:      plan.goalId,
    title:       plan.title,
    description: plan.description || '',
    startDate:   plan.startDate || '',
    endDate:     plan.endDate || '',
    status:      plan.status
  }
  formErrors.value  = {}
  isModalOpen.value = true
}

function validate() {
  const errors = {}
  if (!form.value.goalId) errors.goalId = 'Goal is required'
  if (!form.value.title.trim()) errors.title = 'Title is required'
  if (!form.value.startDate) errors.startDate = 'Start date is required'
  
  if (form.value.startDate && form.value.endDate) {
    if (dayjs(form.value.endDate).isBefore(dayjs(form.value.startDate))) {
      errors.endDate = 'End date cannot be before start date'
    }
  }
  
  formErrors.value = errors
  return !Object.keys(errors).length
}

async function handleSubmit() {
  if (!validate()) return
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      studyPlanStore.updateStudyPlan(editingPlanId.value, { ...form.value })
      toast.success('Study plan updated!')
    } else {
      studyPlanStore.addStudyPlan({ ...form.value })
      toast.success('Study plan added!')
    }
    isModalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

function handleDelete(plan) {
  studyPlanStore.deleteStudyPlan(plan.id)
  toast.success('Study plan deleted')
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return 'N/A'
  return dayjs(date).format('MMM D, YYYY')
}

const getGoalName = (goalId) => {
  const goal = goalStore.goals.find(g => g.id === goalId)
  return goal ? goal.title : 'Unknown Goal'
}

const sortedPlans = computed(() => {
  return [...studyPlanStore.studyPlans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})
</script>

<template>
  <div class="space-y-5 max-w-5xl mx-auto">
    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Study Plans</h1>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Organize your sessions and reach your goals.
        </p>
      </div>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
      >
        <Plus class="w-4 h-4" />
        New Plan
      </button>
    </div>

    <!-- ── List ────────────────────────────────────────────────────────── -->
    <div class="space-y-3">
      <!-- Empty State -->
      <div
        v-if="sortedPlans.length === 0"
        class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-sm"
      >
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen class="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">No study plans yet</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Create a plan to organize tasks for a specific goal.
        </p>
        <button
          @click="openAddModal"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25"
        >
          <Plus class="w-4 h-4" /> Create Plan
        </button>
      </div>

      <!-- Plan Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="plan in sortedPlans"
          :key="plan.id"
          class="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
        >
          <div class="flex items-start justify-between gap-4 mb-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white leading-snug">
              {{ plan.title }}
            </h3>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="openEditModal(plan)"
                class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                title="Edit"
              >
                <Pencil class="w-4 h-4" />
              </button>
              <button
                @click="handleDelete(plan)"
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Target class="w-4 h-4 text-blue-500" />
            <span class="truncate">{{ getGoalName(plan.goalId) }}</span>
          </div>

          <p v-if="plan.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
            {{ plan.description }}
          </p>
          <div v-else class="flex-1"></div>

          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/60">
            <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
              <CalendarDays class="w-3.5 h-3.5" />
              <span>{{ formatDate(plan.startDate) }}</span>
              <span v-if="plan.endDate"> - {{ formatDate(plan.endDate) }}</span>
            </div>
            
            <BaseBadge :variant="plan.status === 'active' ? 'success' : plan.status === 'completed' ? 'primary' : 'warning'">
              {{ plan.status === 'active' ? 'Active' : plan.status === 'completed' ? 'Completed' : 'Draft' }}
            </BaseBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit Modal ─────────────────────────────────────────────────── -->
    <BaseModal
      :isOpen="isModalOpen"
      :title="isEditing ? 'Edit Study Plan' : 'New Study Plan'"
      size="md"
      @close="isModalOpen = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4" id="plan-form">
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Goal *</label>
          <select
            v-model="form.goalId"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
            :class="{ 'border-red-500 ring-red-500': formErrors.goalId }"
          >
            <option value="" disabled>Select a Goal</option>
            <option v-for="g in goalStore.goals" :key="g.id" :value="g.id">
              {{ g.title }}
            </option>
          </select>
          <p v-if="formErrors.goalId" class="mt-1.5 text-xs font-medium text-red-500 ml-1">
            {{ formErrors.goalId }}
          </p>
        </div>

        <BaseInput
          id="plan-title"
          label="Title *"
          v-model="form.title"
          :error="formErrors.title"
          placeholder="e.g. Phase 1: Frontend Basics"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Details about this plan..."
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Start Date *</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
              :class="{ 'border-red-500 ring-red-500': formErrors.startDate }"
            />
            <p v-if="formErrors.startDate" class="mt-1.5 text-xs font-medium text-red-500 ml-1">
              {{ formErrors.startDate }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">End Date</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
              :class="{ 'border-red-500 ring-red-500': formErrors.endDate }"
            />
            <p v-if="formErrors.endDate" class="mt-1.5 text-xs font-medium text-red-500 ml-1">
              {{ formErrors.endDate }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Status</label>
          <select
            v-model="form.status"
            class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
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
          form="plan-form"
          :disabled="isSubmitting"
          class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isEditing ? 'Update Plan' : 'Create Plan' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
