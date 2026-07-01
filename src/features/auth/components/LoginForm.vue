<script setup>
import { useForm, useField } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/authStore'
import { loginSchema } from '../validations/authSchema'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'

const router = useRouter()
const authStore = useAuthStore()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: loginSchema,
})

const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: rememberMe } = useField('rememberMe', undefined, { initialValue: false })

const onSubmit = handleSubmit(async (values) => {
  try {
    // Auth Store naturally processes the logic via AuthService without duplication
    await authStore.login({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe
    })
    
    toast.success('Logged in successfully!')
    router.push('/')
  } catch (error) {
    toast.error(error.message || 'Login failed')
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-5">
    <BaseInput
      id="email"
      type="email"
      label="Email Address"
      v-model="email"
      :error="emailError"
      placeholder="you@example.com"
    />
    
    <div>
      <BaseInput
        id="password"
        type="password"
        label="Password"
        v-model="password"
        :error="passwordError"
        placeholder="••••••••"
      />
    </div>

    <!-- Additional Options (Remember Me & Forgot pass) -->
    <div class="flex items-center justify-between mt-2">
      <BaseCheckbox
        id="rememberMe"
        label="Remember me"
        v-model="rememberMe"
      />
      
      <div class="text-sm">
        <a href="#" class="font-medium text-gray-400 cursor-not-allowed pointer-events-none" aria-disabled="true">
          Forgot your password?
        </a>
      </div>
    </div>
    
    <div class="pt-4">
      <BaseButton type="submit" variant="primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
      </BaseButton>
    </div>
  </form>
</template>
