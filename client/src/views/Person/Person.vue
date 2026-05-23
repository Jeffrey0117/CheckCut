<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
    </div>

    <div v-else-if="!person" class="text-center py-24 text-gray-400">
      Person not found.
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 py-8">
      <!-- Person Header -->
      <div class="flex items-center gap-6 mb-8">
        <img
          :src="person.avatar_url || '/placeholder-avatar.png'"
          :alt="person.name"
          class="w-24 h-24 rounded-full object-cover bg-gray-800"
        >
        <div>
          <h1 class="text-2xl font-bold">{{ person.name }}</h1>
          <p v-if="person.bio" class="mt-2 text-gray-300">{{ person.bio }}</p>
        </div>
      </div>

      <!-- Person's Videos -->
      <h2 class="text-xl font-semibold mb-4">Videos</h2>
      <div v-if="videos.length === 0" class="text-gray-400">
        No videos yet.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <VideoCard v-for="video in videos" :key="video.id" :video="video" />
      </div>

      <!-- SeedBlog Articles -->
      <div v-if="person.seedblog_author_id" class="mt-12">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Articles</h2>
          <a
            v-if="seedblogBaseUrl"
            :href="`${seedblogBaseUrl}/author/${person.seedblog_author_id}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-blue-400 hover:text-blue-300"
          >
            View all &rarr;
          </a>
        </div>

        <div v-if="articlesLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
        </div>

        <div v-else-if="articles.length === 0" class="text-gray-400">
          No articles published yet.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <a
            v-for="article in articles"
            :key="article.id"
            :href="articleUrl(article)"
            target="_blank"
            rel="noopener noreferrer"
            class="group block rounded-lg bg-gray-900 border border-gray-800 p-4 hover:border-gray-600 transition-colors"
          >
            <h3 class="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
              {{ article.title }}
            </h3>
            <p v-if="article.excerpt" class="mt-2 text-sm text-gray-400 line-clamp-2">
              {{ article.excerpt }}
            </p>
            <div class="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span v-if="article.category" class="bg-gray-800 px-2 py-0.5 rounded">{{ article.category }}</span>
              <span v-if="article.published_at">{{ formatDate(article.published_at) }}</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPerson, getVideos, getSeedblogConfig, getSeedblogArticles } from '../../helpers/api/local.js'
import VideoCard from '../../components/VideoCard/VideoCard.vue'

const route = useRoute()
const person = ref(null)
const videos = ref([])
const loading = ref(true)

const seedblogBaseUrl = ref('')
const articles = ref([])
const articlesLoading = ref(false)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })
}

function articleUrl(article) {
  if (!seedblogBaseUrl.value || !article.slug) return '#'
  return `${seedblogBaseUrl.value}/${article.slug}`
}

async function loadSeedblogArticles(authorId) {
  if (!authorId) return
  articlesLoading.value = true
  try {
    articles.value = await getSeedblogArticles(authorId, { limit: 9 })
  } catch {
    articles.value = []
  } finally {
    articlesLoading.value = false
  }
}

async function loadPerson(slug) {
  loading.value = true
  try {
    const data = await getPerson(slug)
    person.value = data.person || null

    if (person.value) {
      const vData = await getVideos({ person_id: person.value.id, limit: 50 })
      videos.value = vData.videos || []

      if (person.value.seedblog_author_id) {
        loadSeedblogArticles(person.value.seedblog_author_id)
      }
    }
  } catch (err) {
    console.error('Failed to load person:', err)
    person.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const config = await getSeedblogConfig()
    seedblogBaseUrl.value = config.base_url || ''
  } catch {
    // SeedBlog not available, links will be hidden
  }
  loadPerson(route.params.slug)
})

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) loadPerson(newSlug)
})
</script>
