<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import {
  Moon, Sun, Lock, Trash2, LogOut, Eye, EyeOff, ShieldAlert, Palette, UserCog
} from 'lucide-vue-next'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useThemeStore } from '@/stores/theme.store'
import { storageService } from '@/services/storage.service'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const authStore  = useAuthStore()
const themeStore = useThemeStore()
const router     = useRouter()

// ─── Dark Mode — delegates entirely to themeStore ─────────────────────────────
const isDark = computed(() => themeStore.isDark)

function toggleDarkMode() {
  themeStore.toggle()
}

// ─── Change Password ──────────────────────────────────────────────────────────
const pwForm = ref({
  current: '',
  next: '',
  confirm: ''
})
const pwErrors  = ref({})
const pwLoading = ref(false)
const showCurrent = ref(false)
const showNext    = ref(false)
const showConfirm = ref(false)

function validatePwForm() {
  const errors = {}
  if (!pwForm.value.current) errors.current = 'Current password is required.'
  if (!pwForm.value.next) {
    errors.next = 'New password is required.'
  } else if (pwForm.value.next.length < 6) {
    errors.next = 'Password must be at least 6 characters.'
  }
  if (!pwForm.value.confirm) {
    errors.confirm = 'Please confirm your new password.'
  } else if (pwForm.value.next !== pwForm.value.confirm) {
    errors.confirm = 'Passwords do not match.'
  }
  return errors
}

async function handleChangePassword() {
  pwErrors.value = validatePwForm()
  if (Object.keys(pwErrors.value).length) return

  pwLoading.value = true
  try {
    await authStore.changePassword(pwForm.value.current, pwForm.value.next)
    toast.success('Password changed successfully!')
    pwForm.value = { current: '', next: '', confirm: '' }
  } catch (err) {
    toast.error(err.message || 'Failed to change password.')
    if (err.message?.includes('Current password')) {
      pwErrors.value.current = err.message
    }
  } finally {
    pwLoading.value = false
  }
}

// ─── Clear All Data ───────────────────────────────────────────────────────────
const showClearModal = ref(false)
const clearLoading   = ref(false)

async function confirmClearData() {
  clearLoading.value = true
  await new Promise(r => setTimeout(r, 600))
  storageService.clear()
  window.location.reload()
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
const logoutLoading = ref(false)

async function handleLogout() {
  logoutLoading.value = true
  await authStore.logout()
  window.location.reload()
}
</script>

<template>
  <div class="max-w-2xl mx-auto w-full space-y-6">

    <!-- ── Page Header ──────────────────────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        Manage your preferences, security and account data.
      </p>
    </div>

    <!-- ── Appearance ──────────────────────────────────────────────────────── -->
    <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
          <Palette class="w-4 h-4 text-purple-500" />
        </div>
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h2>
      </div>

      <div class="px-6 py-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
              :class="isDark ? 'bg-gray-800' : 'bg-amber-50'"
            >
              <Moon v-if="isDark" class="w-5 h-5 text-blue-400" />
              <Sun  v-else         class="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                {{ isDark ? 'Currently using dark theme' : 'Currently using light theme' }}
              </p>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            id="settings-dark-mode-toggle"
            @click="toggleDarkMode"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            :class="isDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
            :aria-checked="isDark"
            role="switch"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300"
              :class="isDark ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- ── Change Password ─────────────────────────────────────────────────── -->
    <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Lock class="w-4 h-4 text-blue-500" />
        </div>
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h2>
      </div>

      <div class="px-6 py-5 space-y-1">
        <!-- Current Password -->
        <div class="mb-4">
          <label for="pw-current" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            Current Password
          </label>
          <div class="relative">
            <input
              id="pw-current"
              v-model="pwForm.current"
              :type="showCurrent ? 'text' : 'password'"
              placeholder="Enter current password"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 pr-11"
              :class="{ 'border-red-500 dark:border-red-500 focus:ring-red-500': pwErrors.current }"
            />
            <button
              type="button"
              @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeOff v-if="showCurrent" class="w-4 h-4" />
              <Eye    v-else              class="w-4 h-4" />
            </button>
          </div>
          <p v-if="pwErrors.current" class="mt-1.5 ml-1 text-sm text-red-500">{{ pwErrors.current }}</p>
        </div>

        <!-- New Password -->
        <div class="mb-4">
          <label for="pw-new" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            New Password
          </label>
          <div class="relative">
            <input
              id="pw-new"
              v-model="pwForm.next"
              :type="showNext ? 'text' : 'password'"
              placeholder="At least 6 characters"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 pr-11"
              :class="{ 'border-red-500 dark:border-red-500 focus:ring-red-500': pwErrors.next }"
            />
            <button
              type="button"
              @click="showNext = !showNext"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeOff v-if="showNext" class="w-4 h-4" />
              <Eye    v-else           class="w-4 h-4" />
            </button>
          </div>
          <p v-if="pwErrors.next" class="mt-1.5 ml-1 text-sm text-red-500">{{ pwErrors.next }}</p>
        </div>

        <!-- Confirm Password -->
        <div class="mb-5">
          <label for="pw-confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
            Confirm New Password
          </label>
          <div class="relative">
            <input
              id="pw-confirm"
              v-model="pwForm.confirm"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="Repeat new password"
              class="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 pr-11"
              :class="{ 'border-red-500 dark:border-red-500 focus:ring-red-500': pwErrors.confirm }"
            />
            <button
              type="button"
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <EyeOff v-if="showConfirm" class="w-4 h-4" />
              <Eye    v-else              class="w-4 h-4" />
            </button>
          </div>
          <p v-if="pwErrors.confirm" class="mt-1.5 ml-1 text-sm text-red-500">{{ pwErrors.confirm }}</p>
        </div>

        <button
          id="settings-change-password-btn"
          @click="handleChangePassword"
          :disabled="pwLoading"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-500/30"
        >
          <Lock class="w-4 h-4" />
          {{ pwLoading ? 'Updating…' : 'Update Password' }}
        </button>
      </div>
    </section>

    <!-- ── Account Actions ─────────────────────────────────────────────────── -->
    <section class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <UserCog class="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Account Actions</h2>
      </div>

      <div class="px-6 py-5">
        <div class="flex items-center justify-between py-3">
          <div>
            <p class="text-sm font-medium text-gray-800 dark:text-gray-200">Sign Out</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">You will be redirected to the login page.</p>
          </div>
          <button
            id="settings-logout-btn"
            @click="handleLogout"
            :disabled="logoutLoading"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-60"
          >
            <LogOut class="w-4 h-4" />
            {{ logoutLoading ? 'Signing out…' : 'Sign Out' }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── Danger Zone ─────────────────────────────────────────────────────── -->
    <section class="bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
      <div class="flex items-center gap-3 px-6 py-4 border-b border-red-100 dark:border-red-900/30">
        <div class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <ShieldAlert class="w-4 h-4 text-red-500" />
        </div>
        <h2 class="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
      </div>

      <div class="px-6 py-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
          <div>
            <p class="text-sm font-medium text-red-700 dark:text-red-400">Clear All Local Data</p>
            <p class="text-xs text-red-500/80 dark:text-red-500/60 mt-0.5">
              Permanently deletes all tasks, sessions, and account data. This cannot be undone.
            </p>
          </div>
          <button
            id="settings-clear-data-btn"
            @click="showClearModal = true"
            class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-sm shadow-red-500/30"
          >
            <Trash2 class="w-4 h-4" />
            Clear Data
          </button>
        </div>
      </div>
    </section>

    <!-- ── Confirm Clear Modal ─────────────────────────────────────────────── -->
    <BaseModal
      :isOpen="showClearModal"
      title="Clear All Data?"
      size="sm"
      @close="showClearModal = false"
    >
      <div class="flex flex-col items-center text-center gap-3 py-2">
        <div class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Trash2 class="w-7 h-7 text-red-500" />
        </div>
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          This will permanently delete <strong>all</strong> your tasks, Pomodoro sessions, goals, and account data from this device. You will be signed out immediately.
        </p>
        <p class="text-xs text-red-500 font-medium">This action cannot be undone.</p>
      </div>

      <template #footer>
        <button
          @click="showClearModal = false"
          class="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
        <button
          id="settings-confirm-clear-btn"
          @click="confirmClearData"
          :disabled="clearLoading"
          class="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-60 shadow-sm shadow-red-500/30"
        >
          {{ clearLoading ? 'Clearing…' : 'Yes, clear everything' }}
        </button>
      </template>
    </BaseModal>

  </div>
</template>
