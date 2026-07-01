<script setup>
import { useForm, useField } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '../stores/authStore'
import { registerSchema } from '../validations/authSchema'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// Setup form validation
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: registerSchema,
})

// Setup fields
const { value: fullName, errorMessage: fullNameError } = useField('fullName')
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  try {
    // Send data to Pinia store which saves to LocalStorage
    await authStore.register({
      fullName: values.fullName,
      email: values.email,
      password: values.password
    })
    
    // Notify user and switch to dashboard 
    toast.success('Account created successfully!')
    router.push('/')
  } catch (error) {
    toast.error(error.message || 'Registration failed')
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-5">
    <BaseInput
      id="fullName"
      label="Full Name"
      v-model="fullName"
      :error="fullNameError"
      placeholder="John Doe"
    />
    
    <BaseInput
      id="email"
      type="email"
      label="Email Address"
      v-model="email"
      :error="emailError"
      placeholder="you@example.com"
    />
    
    <BaseInput
      id="password"
      type="password"
      label="Password"
      v-model="password"
      :error="passwordError"
      placeholder="••••••••"
    />
    
    <BaseInput
      id="confirmPassword"
      type="password"
      label="Confirm Password"
      v-model="confirmPassword"
      :error="confirmPasswordError"
      placeholder="••••••••"
    />
    
    <div class="pt-2">
      <BaseButton type="submit" variant="primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
      </BaseButton>
    </div>
  </form>
</template>
