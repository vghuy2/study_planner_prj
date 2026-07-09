<script setup>
import LoginForm from '../components/LoginForm.vue'
</script>

<template>
  <div class="min-h-[100dvh] flex items-center justify-center bg-[#080c14] p-4 relative overflow-hidden">

    <!-- Background ambient orbs -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]"></div>
      <div class="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-teal-500/8 blur-[100px]"></div>
    </div>

    <!-- Card — double-bezel outer shell -->
    <div class="relative w-full max-w-md animate-fade-up">
      <!-- Outer shell -->
      <div class="p-[1px] rounded-[28px] bg-gradient-to-b from-white/[0.12] to-white/[0.04]">
        <!-- Inner card -->
        <div class="bg-[#0d1420] rounded-[27px] px-8 pt-10 pb-8 shadow-2xl shadow-black/60">

          <!-- Brand header -->
          <div class="text-center mb-8">
            <div class="mx-auto w-14 h-14 rounded-[16px] bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/30 mb-5">
              S
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p class="mt-1.5 text-[13px] text-gray-500">Sign in to continue your progress.</p>
          </div>

          <!-- Form -->
          <LoginForm />

          <!-- Footer -->
          <p class="mt-6 text-center text-[13px] text-gray-600">
            No account?
            <router-link to="/register" class="ml-1 font-medium text-blue-400 hover:text-blue-300 transition-colors">
              Create one
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
