<template>
  <header class="ck-header sticky top-0 z-50">
    <div class="flex items-center gap-4 px-4 h-14">
      <!-- Menu toggle -->
      <button
        class="icon-btn p-2 rounded-lg transition-colors lg:hidden"
        @click="$emit('toggle-sidebar')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Brand -->
      <router-link to="/" class="brand text-lg font-bold flex-shrink-0">
        雀可<span class="brand-accent">影片</span>
      </router-link>

      <!-- Search -->
      <div class="flex-1 max-w-xl mx-auto">
        <form class="flex" @submit.prevent="handleSearch">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋影片…"
            class="search-input w-full px-4 py-2 rounded-l-lg text-sm focus:outline-none"
          >
          <button
            type="submit"
            class="search-btn px-4 py-2 rounded-r-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      <!-- User -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- Light/Dark toggle -->
        <button
          type="button"
          class="icon-btn p-2 rounded-lg transition-colors"
          :aria-label="isDark ? '切換為淺色主題' : '切換為深色主題'"
          :title="isDark ? '切換為淺色主題' : '切換為深色主題'"
          @click="toggleTheme"
        >
          <!-- Sun icon (shown in dark mode → click to go light) -->
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" stroke-width="2" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            />
          </svg>
          <!-- Moon icon (shown in light mode → click to go dark) -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            />
          </svg>
        </button>

        <template v-if="isAdmin">
          <router-link
            to="/admin"
            class="nav-link text-sm transition-colors"
          >
            管理
          </router-link>
        </template>
        <template v-if="isLoggedIn">
          <button
            class="nav-link text-sm transition-colors"
            @click="handleLogout"
          >
            登出
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="nav-link text-sm transition-colors"
          >
            登入
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
const isDark = computed(() => store.getters.getBaseTheme === 'dark')

function toggleTheme() {
  store.dispatch('toggleTheme')
}

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

<style scoped>
.ck-header {
  background: var(--bg-color);
  border-bottom: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.brand {
  color: var(--primary-text-color);
}

.brand-accent {
  color: var(--primary-color);
}

.icon-btn {
  color: var(--secondary-text-color);
}

.icon-btn:hover {
  color: var(--primary-text-color);
  background: var(--yt-bg-hover);
}

.search-input {
  background: var(--card-bg-color);
  color: var(--primary-text-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.search-input::placeholder {
  color: var(--tertiary-text-color);
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-btn {
  background: var(--secondary-card-bg-color);
  color: var(--secondary-text-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
  border-left: none;
}

.search-btn:hover {
  background: var(--yt-bg-hover);
  color: var(--primary-text-color);
}

.nav-link {
  color: var(--secondary-text-color);
}

.nav-link:hover {
  color: var(--primary-text-color);
}
</style>
