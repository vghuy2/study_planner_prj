<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
</script>

<template>
  <!--
    bg-gray-50 / dark:bg-[#080c14]
    Light mode: crisp neutral-50 background
    Dark mode:  near-OLED #080c14
  -->
  <div
    class="flex h-screen bg-gray-50 dark:bg-[#080c14] text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300"
    style="font-family: 'Outfit', system-ui, sans-serif;"
  >
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" @close-sidebar="isSidebarOpen = false" />

    <!-- Content wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden w-full lg:w-auto min-w-0">
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Page content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
        <slot />
      </main>
    </div>
  </div>
</template>
