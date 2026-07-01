<script setup>
import SkeletonCard from './SkeletonCard.vue'
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header Skeleton -->
    <div class="animate-pulse mb-8">
      <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-3"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
    </div>
    
    <!-- Cards Skeleton Layer -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    
    <!-- Big Box Skeleton Layer -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2 p-6 min-h-[350px] animate-pulse">
        <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
        <div class="h-[200px] bg-gray-100 dark:bg-gray-800/50 rounded-xl w-full"></div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 min-h-[350px] animate-pulse">
        <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div class="space-y-4">
          <div class="h-14 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-full"></div>
          <div class="h-14 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-full"></div>
          <div class="h-14 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>
