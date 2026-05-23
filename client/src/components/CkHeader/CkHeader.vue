<template>
  <header class="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
    <div class="flex items-center gap-4 px-4 h-14">
      <!-- Menu toggle -->
      <button
        class="p-2 rounded-lg hover:bg-gray-800 transition-colors lg:hidden"
        @click="$emit('toggle-sidebar')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Brand -->
      <router-link to="/" class="text-lg font-bold text-white flex-shrink-0">
        CheckCut
      </router-link>

      <!-- Search -->
      <div class="flex-1 max-w-xl mx-auto">
        <form class="flex" @submit.prevent="handleSearch">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full px-4 py-2 rounded-l-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          >
          <button
            type="submit"
            class="px-4 py-2 rounded-r-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <!-- User -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <template v-if="isAdmin">
          <router-link
            to="/admin"
            class="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Admin
          </router-link>
        </template>
        <template v-if="isLoggedIn">
          <button
            class="text-sm text-gray-300 hover:text-white transition-colors"
            @click="handleLogout"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Login
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const store = useStore()
const searchQuery = ref('')

const isLoggedIn = computed(() => store.getters['user/getIsLoggedIn'])
const isAdmin = computed(() => store.getters['user/getIsAdmin'])

function handleSearch() {
  const q = searchQuery.value.trim()
  if (q) {
    router.push({ name: 'search', query: { q } })
    searchQuery.value = ''
  }
}

async function handleLogout() {
  await store.dispatch('user/logout')
  router.push('/')
}
</script>
