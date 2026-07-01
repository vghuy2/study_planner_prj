<script setup>
import { BarChart3, CheckSquare, Clock, TrendingUp } from 'lucide-vue-next'

const stats = [
  { name: 'Total Study Hours', value: '32h 15m', change: '+12%', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Tasks Completed', value: '28', change: '+5', icon: CheckSquare, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { name: 'Current Streak', value: '4 Days', change: 'Keep it up!', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { name: 'Overall Progress', value: '68%', change: '+2.4%', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Monitor your study progress and metrics over time.
      </p>
    </div>

    <!-- Stats Grid (Responsive Cards) -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="stat in stats" 
        :key="stat.name"
        class="bg-white dark:bg-gray-900 overflow-hidden rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-800 transition-all hover:translate-y-[-2px] hover:shadow-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div :class="[stat.bg, stat.color, 'p-3 rounded-xl']">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
            </div>
            <div class="ml-4 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {{ stat.name }}
                </dt>
                <dd class="text-2xl font-bold text-gray-900 dark:text-white flex items-baseline mt-1">
                  {{ stat.value }}
                  <span class="ml-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" :class="stat.change.includes('+') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                    {{ stat.change }}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content Grid (Responsive mapping for chart / activity feeds) -->
     <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Activity Chart Box -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-800 lg:col-span-2 p-6 min-h-[350px] flex flex-col justify-center items-center text-center">
        <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-4">
          <BarChart3 class="w-8 h-8 text-blue-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Activity Overview</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Chart visualizations representing your study streaks will be naturally embedded here seamlessly expanding filling width.
        </p>
      </div>
      
      <!-- Upcoming Tasks Box -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-800 p-6 min-h-[350px] flex flex-col justify-center items-center text-center">
        <div class="w-16 h-16 bg-teal-50 dark:bg-teal-900/10 rounded-full flex items-center justify-center mb-4">
          <CheckSquare class="w-8 h-8 text-teal-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Recent Reminders</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[200px]">
          Short task widget lists align smoothly matching height grids.
        </p>
      </div>

    </div>
  </div>
</template>
