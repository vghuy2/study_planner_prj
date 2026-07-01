<template>
  <aside class="w-64 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col p-6">
    <div class="animate-pulse flex items-center gap-3 mb-10 px-2">
      <div class="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
      <div class="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
    </div>
    
    <div class="space-y-5 flex-1">
      <div v-for="i in 6" :key="i" class="animate-pulse flex items-center gap-4 px-2">
        <div class="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
      </div>
    </div>
    
    <div class="mt-auto space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div class="animate-pulse flex items-center gap-4 px-2">
        <div class="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
      </div>
    </div>
  </aside>
</template>
