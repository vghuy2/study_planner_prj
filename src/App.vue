<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import MainLayout from '@/components/layout/MainLayout.vue'

const route = useRoute()

// Resolve wrapper cleanly so users on /login do NOT see a sidebar.
const layout = computed(() => {
  if (route.meta.requiresGuest) return 'div'
  return MainLayout
})
</script>

<template>
  <Toaster position="top-right" richColors />
  <!-- Dynamic Layout Wrap -->
  <component :is="layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
