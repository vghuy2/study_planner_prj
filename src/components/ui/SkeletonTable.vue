<script setup>
defineProps({
  rows: {
    type: Number,
    default: 5
  }
})
</script>

<template>
  <div class="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
    <div class="animate-pulse flex space-x-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
      <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
    <div class="space-y-6">
      <div v-for="i in rows" :key="i" class="animate-pulse flex space-x-4">
        <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
      </div>
    </div>
  </div>
</template>
