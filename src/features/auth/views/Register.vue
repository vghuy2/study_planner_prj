<script setup>
import RegisterForm from '../components/RegisterForm.vue'
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
    <div class="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 p-8 sm:p-10 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
      
      <!-- Brand & Header -->
      <div class="text-center">
        <!-- Logo -->
        <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/30">
          S
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Join Study Planner
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Organize your study routine and achieve your goals.
        </p>
      </div>

      <!-- Registration Form -->
      <div class="mt-8">
        <RegisterForm />
      </div>
      
      <!-- Footer Link -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            Sign in
          </router-link>
        </p>
      </div>
      
    </div>
  </div>
</template>
