<template>
  <div class="min-h-screen page-root">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search Input -->
      <div class="mb-8">
        <div class="search-wrap relative w-full max-w-xl">
          <font-awesome-icon
            :icon="['fas', 'magnifying-glass']"
            class="search-icon absolute left-4 top-1/2 -translate-y-1/2"
          />
          <input
            v-model="query"
            type="text"
            placeholder="搜尋影片…"
            class="themed-input w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none"
            @keydown.enter="doSearch"
          >
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 spinner"></div>
      </div>

      <div v-else-if="searched && results.length === 0" class="text-center py-12 meta-text">
        沒有結果
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <VideoCard v-for="video in results" :key="video.id" :video="video" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { search } from '../../helpers/api/local.js'
import VideoCard from '../../components/VideoCard/VideoCard.vue'

const route = useRoute()
const router = useRouter()

const query = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

async function doSearch() {
  const q = query.value.trim()
  if (!q) return

  router.replace({ query: { q } })

  loading.value = true
  searched.value = true
  try {
    const data = await search(q)
    results.value = data.videos || []
  } catch (err) {
    console.error('Search failed:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q
    doSearch()
  }
})

watch(() => route.query.q, (newQ) => {
  if (newQ && newQ !== query.value) {
    query.value = newQ
    doSearch()
  }
})
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.spinner {
  border-color: var(--primary-color);
}

.meta-text {
  color: var(--tertiary-text-color);
}

.search-icon {
  color: var(--tertiary-text-color);
  pointer-events: none;
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
</style>
