<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { User, Mail, Calendar, CheckSquare, Clock, Edit3, Save, X } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useTaskStore } from '@/features/tasks/stores/task.store'
import { usePomodoroStore } from '@/features/pomodoro/stores/pomodoro.store'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const authStore     = useAuthStore()
const taskStore     = useTaskStore()
const pomodoroStore = usePomodoroStore()

onMounted(() => {
  taskStore.fetchTasks()
  pomodoroStore.loadSessions()
})

// ─── User Info ────────────────────────────────────────────────────────────────
const user = computed(() => authStore.currentUser)

const avatarInitials = computed(() => {
  const name = user.value?.fullName || 'User'
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const joinedDate = computed(() =>
  user.value?.createdAt
    ? dayjs(user.value.createdAt).format('MMMM D, YYYY')
    : '—'
)

// ─── Stats ───────────────────────────────────────────────────────────────────
const totalCompleted = computed(() => taskStore.completedTasks.length)

const totalStudyHours = computed(() => {
  const total = pomodoroStore.sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  return (total / 60).toFixed(1)
})

const completionRate = computed(() => taskStore.completionRate)

// ─── Edit Form ────────────────────────────────────────────────────────────────
const isEditing    = ref(false)
const isSaving     = ref(false)
const fullNameEdit = ref('')
const nameError    = ref('')

function startEditing() {
  fullNameEdit.value = user.value?.fullName || ''
  nameError.value    = ''
  isEditing.value    = true
}

function cancelEditing() {
  isEditing.value = false
  nameError.value = ''
}

async function saveProfile() {
  nameError.value = ''
  const trimmed = fullNameEdit.value.trim()
  if (!trimmed) {
    nameError.value = 'Display name cannot be empty.'
    return
  }
  if (trimmed.length < 2) {
    nameError.value = 'Name must be at least 2 characters.'
    return
  }

  isSaving.value = true
  try {
    await authStore.updateProfile({ fullName: trimmed })
    toast.success('Profile updated successfully!')
    isEditing.value = false
  } catch (err) {
    toast.error(err.message || 'Failed to update profile.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto w-full space-y-6">

    <!-- ── Page Header ──────────────────────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        Manage your personal information and view your study stats.
      </p>
    </div>

    <!-- ── Profile Card ────────────────────────────────────────────────────── -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

      <!-- Gradient Banner -->
      <div class="h-28 bg-gradient-to-r from-blue-500 via-blue-600 to-teal-400 relative">
        <div class="absolute inset-0 opacity-20"
          style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 40px 40px;">
        </div>
      </div>

      <!-- Avatar + Name -->
      <div class="px-6 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 mb-5">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-white dark:ring-gray-900 select-none">
              {{ avatarInitials }}
            </div>
          </div>

          <!-- Edit / Save Controls -->
          <div class="flex items-center gap-2">
            <button
              v-if="!isEditing"
              @click="startEditing"
              id="profile-edit-btn"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <Edit3 class="w-4 h-4" />
              Edit Profile
            </button>
            <template v-else>
              <button
                @click="cancelEditing"
                id="profile-cancel-btn"
                class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <X class="w-4 h-4" />
                Cancel
              </button>
              <button
                @click="saveProfile"
                :disabled="isSaving"
                id="profile-save-btn"
                class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-500/30"
              >
                <Save class="w-4 h-4" />
                {{ isSaving ? 'Saving…' : 'Save' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Name + Badge -->
        <div class="mb-5">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ user?.fullName }}</h2>
          <span class="inline-flex items-center gap-1 mt-1 text-xs font-medium bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded-full">
            <Calendar class="w-3 h-3" />
            Member since {{ joinedDate }}
          </span>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <!-- Display Name -->
          <div v-if="isEditing">
            <BaseInput
              id="profile-fullname"
              label="Display Name"
              v-model="fullNameEdit"
              placeholder="Enter your display name"
              :error="nameError"
            />
          </div>
          <div v-else class="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <User class="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500">Display Name</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ user?.fullName }}</p>
            </div>
          </div>

          <!-- Email (always readonly) -->
          <div class="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
              <Mail class="w-4 h-4 text-teal-500" />
            </div>
            <div class="min-w-0">
              <p class="text-xs text-gray-400 dark:text-gray-500">Email Address</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ user?.email }}</p>
            </div>
            <span class="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
              read-only
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Quick Stats ──────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <!-- Tasks Completed -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasks Completed</p>
          <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
            <CheckSquare class="w-4 h-4 text-teal-500" />
          </div>
        </div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalCompleted }}</p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">of {{ taskStore.tasks.length }} total tasks</p>
        <!-- Mini progress bar -->
        <div class="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-teal-500 rounded-full transition-all duration-700"
            :style="{ width: completionRate + '%' }"
          ></div>
        </div>
      </div>

      <!-- Total Study Hours -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Study Hours</p>
          <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Clock class="w-4 h-4 text-blue-500" />
          </div>
        </div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ totalStudyHours }}</p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">total hours via Pomodoro</p>
        <div class="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 rounded-full w-full"></div>
        </div>
      </div>

      <!-- Completion Rate -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completion Rate</p>
          <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20V10M18 20V4M6 20v-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ completionRate }}<span class="text-lg text-gray-400">%</span></p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">task completion rate</p>
        <div class="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-purple-500 rounded-full transition-all duration-700"
            :style="{ width: completionRate + '%' }"
          ></div>
        </div>
      </div>
    </div>

  </div>
</template>
