<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search Input -->
      <div class="mb-8">
        <input
          v-model="query"
          type="text"
          placeholder="Search videos..."
          class="w-full max-w-xl px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keydown.enter="doSearch"
        >
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>

      <div v-else-if="searched && results.length === 0" class="text-center py-12 text-gray-400">
        No results found.
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
