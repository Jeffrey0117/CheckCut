<template>
  <div class="min-h-screen bg-gray-950 text-white flex items-center justify-center">
    <div class="w-full max-w-md px-6">
      <h1 class="text-2xl font-bold text-center mb-8">Create Account</h1>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          >
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          >
        </div>
        <div>
          <label class="block text-sm text-gray-300 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="At least 6 characters"
          >
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="mt-6 text-center text-gray-400 text-sm">
        Already have an account?
        <router-link to="/login" class="text-blue-400 hover:text-blue-300">Login</router-link>
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
