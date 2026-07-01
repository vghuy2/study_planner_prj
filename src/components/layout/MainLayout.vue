<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
    <!-- Sidebar -->
    <Sidebar :isOpen="isSidebarOpen" @close-sidebar="isSidebarOpen = false" />

    <!-- Main ContentWrapper -->
    <div class="flex-1 flex flex-col overflow-hidden w-full lg:w-auto transition-all duration-300">
      
      <!-- Navbar Component -->
      <Navbar @toggle-sidebar="toggleSidebar" />
      
      <!-- Page Content via slot -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8 scroll-smooth">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
