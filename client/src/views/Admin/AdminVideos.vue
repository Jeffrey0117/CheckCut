<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Manage Videos</h1>
        <router-link
          to="/admin/videos/new"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          + New Video
        </router-link>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>

      <div v-else-if="videos.length === 0" class="text-center py-12 text-gray-400">
        No videos yet. Create your first video.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="video in videos"
          :key="video.id"
          class="flex items-center gap-4 p-4 rounded-lg bg-gray-800"
        >
          <img
            :src="video.thumbnail_url || '/placeholder-thumb.png'"
            :alt="video.title"
            class="w-32 h-20 object-cover rounded bg-gray-700 flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ video.title }}</p>
            <p class="text-sm text-gray-400">{{ video.person_name || 'No person' }} | {{ video.status || 'draft' }}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <router-link
              :to="`/admin/videos/${video.id}`"
              class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Edit
            </router-link>
            <button
              class="px-3 py-1.5 text-sm rounded bg-red-700 hover:bg-red-600 transition-colors"
              @click="handleDelete(video.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVideos, deleteVideo } from '../../helpers/api/local.js'

const videos = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const data = await getVideos({ limit: 200 })
    videos.value = data.videos || []
  } catch (err) {
    console.error('Failed to load videos:', err)
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this video?')) return
  try {
    await deleteVideo(id)
    videos.value = videos.value.filter((v) => v.id !== id)
  } catch (err) {
    alert('Failed to delete: ' + err.message)
  }
}

onMounted(load)
</script>
