<template>
  <div class="home-page min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Featured Persons -->
      <section v-if="persons.length > 0" class="mb-12">
        <h2 class="section-title text-xl font-semibold mb-4">精選創作者</h2>
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          <router-link
            v-for="person in persons"
            :key="person.id"
            :to="`/person/${person.slug}`"
            class="person-card flex-shrink-0 flex flex-col items-center gap-2 w-28 transition-opacity"
          >
            <img
              :src="person.avatar_url || '/placeholder-avatar.png'"
              :alt="person.name"
              class="avatar w-20 h-20 rounded-full object-cover"
            >
            <span class="person-name text-sm text-center truncate w-full">{{ person.name }}</span>
          </router-link>
        </div>
      </section>

      <!-- Categories -->
      <section v-if="categories.length > 0" class="mb-8">
        <div class="flex flex-wrap gap-2">
          <router-link
            v-for="cat in categories"
            :key="cat"
            :to="`/category/${encodeURIComponent(cat)}`"
            class="category-pill px-4 py-1.5 rounded-full text-sm transition-colors"
          >
            {{ cat }}
          </router-link>
        </div>
      </section>

      <!-- Latest Videos -->
      <section>
        <h2 class="section-title text-xl font-semibold mb-4">最新影片</h2>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="spinner animate-spin rounded-full h-8 w-8"></div>
        </div>
        <div v-else-if="videos.length === 0" class="empty-state text-center py-12">
          目前還沒有影片。
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <VideoCard v-for="video in videos" :key="video.id" :video="video" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVideos, getPersons, getCategories } from '../../helpers/api/local.js'
import VideoCard from '../../components/VideoCard/VideoCard.vue'

const videos = ref([])
const persons = ref([])
const categories = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [videosRes, personsRes, categoriesRes] = await Promise.allSettled([
      getVideos({ limit: 20 }),
      getPersons(),
      getCategories(),
    ])

    if (videosRes.status === 'fulfilled') {
      videos.value = videosRes.value.videos || []
    }
    if (personsRes.status === 'fulfilled') {
      persons.value = personsRes.value.persons || []
    }
    if (categoriesRes.status === 'fulfilled') {
      categories.value = categoriesRes.value.categories || []
    }
  } catch (err) {
    console.error('Failed to load home data:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-page {
  background: var(--bg-color);
  color: var(--primary-text-color);
}

.section-title {
  color: var(--primary-text-color);
}

.person-card:hover {
  opacity: 0.8;
}

.avatar {
  background: var(--card-bg-color);
}

.person-name {
  color: var(--primary-text-color);
}

.category-pill {
  background: var(--card-bg-color);
  color: var(--primary-text-color);
}

.category-pill:hover {
  background: var(--yt-bg-hover);
  color: var(--primary-color);
}

.spinner {
  border-bottom: 2px solid var(--primary-color);
}

.empty-state {
  color: var(--secondary-text-color);
}
</style>
