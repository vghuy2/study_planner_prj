import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'sp_dark_mode'

export const useThemeStore = defineStore('theme', () => {
  // True = dark, false = light
  const isDark = ref(false)

  // Sync the <html> class AND persist preference
  function _apply(dark) {
    isDark.value = dark
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, dark ? 'true' : 'false')
  }

  // Call once on app boot to restore saved preference
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY)
    // Default to dark if no preference saved
    _apply(saved === null ? true : saved === 'true')
  }

  function toggle() {
    _apply(!isDark.value)
  }

  function setDark(value) {
    _apply(value)
  }

  return { isDark, init, toggle, setDark }
})
