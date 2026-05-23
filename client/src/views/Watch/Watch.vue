<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
    </div>

    <div v-else-if="!video" class="text-center py-24 text-gray-400">
      Video not found.
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Main Content -->
        <div class="flex-1">
          <!-- Video Player -->
          <div class="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref="playerRef"
              class="w-full h-full"
              controls
              autoplay
              preload="auto"
              :poster="video.thumbnail_url"
              :src="video.stream_url"
              @play="onPlay"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <!-- Video Info -->
          <div class="mt-4">
            <h1 class="text-xl font-semibold">{{ video.title }}</h1>
            <div class="flex items-center justify-between mt-2">
              <router-link
                v-if="video.person"
                :to="`/person/${video.person.slug}`"
                class="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  :src="video.person.avatar_url || '/placeholder-avatar.png'"
                  :alt="video.person.name"
                  class="w-10 h-10 rounded-full object-cover bg-gray-800"
                >
                <span class="font-medium">{{ video.person.name }}</span>
              </router-link>
              <button
                class="px-4 py-2 rounded-lg transition-colors"
                :class="isFav ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'"
                @click="toggleFav"
              >
                {{ isFav ? 'Unfavorite' : 'Favorite' }}
              </button>
            </div>
            <p
              v-if="video.description"
              class="mt-4 text-gray-300 whitespace-pre-wrap text-sm"
            >
              {{ video.description }}
            </p>
          </div>
        </div>

        <!-- Related Videos -->
        <div class="lg:w-80 flex-shrink-0">
          <h3 class="text-lg font-semibold mb-3">Related</h3>
          <div class="flex flex-col gap-3">
            <router-link
              v-for="rv in relatedVideos"
              :key="rv.id"
              :to="`/watch/${rv.id}`"
              class="flex gap-3 hover:bg-gray-800 rounded-lg p-2 transition-colors"
            >
              <img
                :src="rv.thumbnail_url || '/placeholder-thumb.png'"
                :alt="rv.title"
                class="w-40 h-24 object-cover rounded bg-gray-800 flex-shrink-0"
              >
              <div class="min-w-0">
                <p class="text-sm font-medium line-clamp-2">{{ rv.title }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ rv.person_name }}</p>
                <p v-if="rv.duration" class="text-xs text-gray-500">{{ formatDuration(rv.duration) }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { getVideo, getVideos } from '../../helpers/api/local.js'

const route = useRoute()
const store = useStore()

const video = ref(null)
const relatedVideos = ref([])
const loading = ref(true)
const playerRef = ref(null)

const isFav = computed(() => store.getters['favorites/isFavorite']?.(route.params.id))

async function loadVideo(id) {
  loading.value = true
  try {
    const data = await getVideo(id)
    video.value = data.video || null

    if (video.value) {
      const params = {}
      if (video.value.person_id) params.person_id = video.value.person_id
      else if (video.value.category) params.category = video.value.category
      const related = await getVideos({ ...params, limit: 10 })
      relatedVideos.value = (related.videos || []).filter((v) => v.id !== id)
    }
  } catch (err) {
    console.error('Failed to load video:', err)
    video.value = null
  } finally {
    loading.value = false
  }
}

function onPlay() {
  if (!video.value) return
  store.dispatch('history/recordWatch', {
    videoId: video.value.id,
    title: video.value.title,
    thumbnail_url: video.value.thumbnail_url,
    person_name: video.value.person?.name,
    person_slug: video.value.person?.slug,
    duration: video.value.duration,
  })
}

function toggleFav() {
  if (!video.value) return
  store.dispatch('favorites/toggleFavorite', {
    videoId: video.value.id,
    title: video.value.title,
    thumbnail_url: video.value.thumbnail_url,
    person_name: video.value.person?.name,
    person_slug: video.value.person?.slug,
    duration: video.value.duration,
  })
}

function formatDuration(seconds) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

onMounted(() => loadVideo(route.params.id))

watch(() => route.params.id, (newId) => {
  if (newId) loadVideo(newId)
})
</script>
