<template>
  <div class="min-h-screen page-root flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <h1 class="text-2xl font-bold text-center mb-8">Create Account</h1>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm field-label mb-1">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="themed-input w-full px-4 py-3 rounded-lg focus:outline-none"
            placeholder="Your name"
          >
        </div>
        <div>
          <label class="block text-sm field-label mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="themed-input w-full px-4 py-3 rounded-lg focus:outline-none"
            placeholder="you@example.com"
          >
        </div>
        <div>
          <label class="block text-sm field-label mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="themed-input w-full px-4 py-3 rounded-lg focus:outline-none"
            placeholder="At least 6 characters"
          >
        </div>

        <p v-if="error" class="error-text text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="primary-btn w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="mt-6 text-center meta-text text-sm">
        Already have an account?
        <router-link to="/login" class="accent-link">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await store.dispatch('user/register', { name: name.value, email: email.value, password: password.value })
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.field-label {
  color: var(--secondary-text-color);
}

.meta-text {
  color: var(--tertiary-text-color);
}

.error-text {
  color: var(--destructive-color);
}

.themed-input {
  background-color: var(--search-bar-color);
  color: var(--primary-text-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.themed-input::placeholder {
  color: var(--tertiary-text-color);
}

.themed-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.primary-btn {
  background-color: var(--primary-color);
  color: var(--text-with-main-color);
}

.primary-btn:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
}

.accent-link {
  color: var(--primary-color);
}

.accent-link:hover {
  color: var(--primary-color-hover);
}
</style>
