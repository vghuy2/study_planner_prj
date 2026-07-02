<script setup>
defineProps({
  variant: { type: String, default: 'neutral' }, // high|medium|low|danger|warning|success|info|neutral|completed
  size: { type: String, default: 'sm' } // sm | md
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 font-semibold rounded-full tracking-wide capitalize"
    :class="[
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      variant === 'high' || variant === 'danger'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : variant === 'medium' || variant === 'warning'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : variant === 'low'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : variant === 'success' || variant === 'completed'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : variant === 'info'
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    ]"
  >
    <slot />
  </span>
</template>
