import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskService } from '@/services/task.service'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])

  function loadTasks() {
    tasks.value = taskService.getTasks()
  }

  function addTask(task) {
    taskService.addTask(task)
    loadTasks()
  }

  return { tasks, loadTasks, addTask }
})
