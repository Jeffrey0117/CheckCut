<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Featured Persons -->
      <section v-if="persons.length > 0" class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Featured Persons</h2>
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          <router-link
            v-for="person in persons"
            :key="person.id"
            :to="`/person/${person.slug}`"
            class="flex-shrink-0 flex flex-col items-center gap-2 w-28 hover:opacity-80 transition-opacity"
          >
            <img
              :src="person.avatar_url || '/placeholder-avatar.png'"
              :alt="person.name"
              class="w-20 h-20 rounded-full object-cover bg-gray-800"
            >
            <span class="text-sm text-center truncate w-full">{{ person.name }}</span>
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
            class="px-4 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
          >
            {{ cat }}
          </router-link>
        </div>
      </section>

      <!-- Latest Videos -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Latest Videos</h2>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <div v-else-if="videos.length === 0" class="text-center py-12 text-gray-400">
          No videos yet.
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
