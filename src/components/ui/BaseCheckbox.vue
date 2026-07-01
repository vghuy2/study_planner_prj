<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-offset-gray-900 transition-colors"
    />
    <label :for="id" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
  </div>
</template>
