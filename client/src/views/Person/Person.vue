<template>
  <div class="min-h-screen page-root">
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 spinner"></div>
    </div>

    <div v-else-if="!person" class="text-center py-24 meta-text">
      Person not found.
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 py-8">
      <!-- Person Header -->
      <div class="flex items-center gap-6 mb-8">
        <img
          :src="person.avatar_url || '/placeholder-avatar.png'"
          :alt="person.name"
          class="w-24 h-24 rounded-full object-cover avatar-bg"
        >
        <div>
          <h1 class="text-2xl font-bold">{{ person.name }}</h1>
          <p v-if="person.bio" class="mt-2 secondary-text">{{ person.bio }}</p>
        </div>
      </div>

      <!-- Person's Videos -->
      <h2 class="text-xl font-semibold mb-4">Videos</h2>
      <div v-if="videos.length === 0" class="meta-text">
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
            class="text-sm accent-link"
          >
            View all &rarr;
          </a>
        </div>

        <div v-if="articlesLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 spinner"></div>
        </div>

        <div v-else-if="articles.length === 0" class="meta-text">
          No articles published yet.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <a
            v-for="article in articles"
            :key="article.id"
            :href="articleUrl(article)"
            target="_blank"
            rel="noopener noreferrer"
            class="article-card group block rounded-lg p-4 transition-colors"
          >
            <h3 class="article-title font-medium transition-colors line-clamp-2">
              {{ article.title }}
            </h3>
            <p v-if="article.excerpt" class="mt-2 text-sm meta-text line-clamp-2">
              {{ article.excerpt }}
            </p>
            <div class="mt-3 flex items-center gap-3 text-xs tertiary-text">
              <span v-if="article.category" class="chip px-2 py-0.5 rounded">{{ article.category }}</span>
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

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.spinner {
  border-color: var(--primary-color);
}

.secondary-text {
  color: var(--secondary-text-color);
}

.meta-text {
  color: var(--secondary-text-color);
}

.tertiary-text {
  color: var(--tertiary-text-color);
}

.avatar-bg {
  background-color: var(--secondary-card-bg-color);
}

.accent-link {
  color: var(--primary-color);
}

.accent-link:hover {
  color: var(--primary-color-hover);
}

.article-card {
  background-color: var(--card-bg-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.article-card:hover {
  border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);
}

.article-title {
  color: var(--primary-text-color);
}

.article-card:hover .article-title {
  color: var(--primary-color);
}

.chip {
  background-color: var(--secondary-card-bg-color);
}
</style>
