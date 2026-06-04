<template>
  <div class="min-h-screen page-root">
    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 spinner"></div>
    </div>

    <div v-else-if="!video" class="text-center py-24 meta-text">
      找不到影片。
    </div>

    <div v-else class="watch-layout">
      <!-- Main Content -->
      <div class="watch-main">
        <!-- Video Player -->
        <div class="player-frame">
          <video
            ref="playerRef"
            class="player-video"
            controls
            autoplay
            preload="auto"
            :poster="video.thumbnail_url"
            :src="video.stream_url"
            @play="onPlay"
          >
            您的瀏覽器不支援影片播放。
          </video>
        </div>

        <!-- Video Info -->
        <div class="mt-4">
          <h1 class="video-title">{{ video.title }}</h1>
          <div class="flex items-center justify-between mt-3 gap-3 flex-wrap">
            <router-link
              v-if="video.person"
              :to="`/person/${video.person.slug}`"
              class="author-link flex items-center gap-3"
            >
              <img
                :src="video.person.avatar_url || '/placeholder-avatar.png'"
                :alt="video.person.name"
                class="author-avatar"
              >
              <span class="author-name">{{ video.person.name }}</span>
            </router-link>
            <button
              class="fav-button"
              :class="isFav ? 'fav-btn-active' : 'fav-btn'"
              @click="toggleFav"
            >
              <font-awesome-icon :icon="['fas', 'heart']" />
              <span>{{ isFav ? '已收藏' : '收藏' }}</span>
            </button>
          </div>
          <p
            v-if="video.description"
            class="video-description"
          >
            {{ video.description }}
          </p>
        </div>
      </div>

      <!-- Related Videos -->
      <aside class="watch-sidebar">
        <h3 class="related-heading">相關影片</h3>
        <div class="flex flex-col gap-3">
          <router-link
            v-for="rv in relatedVideos"
            :key="rv.id"
            :to="`/watch/${rv.id}`"
            class="related-item"
          >
            <img
              :src="rv.thumbnail_url || '/placeholder-thumb.png'"
              :alt="rv.title"
              class="related-thumb"
            >
            <div class="min-w-0">
              <p class="related-title line-clamp-2">{{ rv.title }}</p>
              <p class="related-meta">{{ rv.person_name }}</p>
              <p v-if="rv.duration" class="related-duration">{{ formatDuration(rv.duration) }}</p>
            </div>
          </router-link>
        </div>
      </aside>
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

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.spinner {
  border-color: var(--primary-color);
}

.meta-text {
  color: var(--secondary-text-color);
}

/* ---- Layout: full-width YouTube-style ---- */
.watch-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px 24px 48px;
}

@media (min-width: 1024px) {
  .watch-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}

.watch-main {
  flex: 1 1 auto;
  min-width: 0;
}

.watch-sidebar {
  flex: 0 0 auto;
  width: 100%;
}

@media (min-width: 1024px) {
  .watch-sidebar {
    width: 402px;
  }
}

/* ---- Player ---- */
.player-frame {
  position: relative;
  width: 100%;
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
}

.player-video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
}

/* ---- Video info ---- */
.video-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--primary-text-color);
}

.author-link {
  text-decoration: none;
  color: var(--primary-text-color);
  transition: opacity 0.15s ease;
}

.author-link:link,
.author-link:visited {
  color: var(--primary-text-color);
}

.author-link:hover {
  opacity: 0.85;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  object-fit: cover;
  background-color: var(--card-bg-color);
  flex-shrink: 0;
}

.author-name {
  font-weight: 500;
  color: var(--primary-text-color);
}

.fav-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 9999px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.fav-btn {
  background-color: var(--card-bg-color);
  color: var(--primary-text-color);
}

.fav-btn:hover {
  background-color: var(--yt-bg-hover);
}

.fav-btn-active {
  background-color: var(--primary-color);
  color: var(--text-with-main-color);
}

.fav-btn-active:hover {
  background-color: var(--primary-color-hover);
}

.video-description {
  margin-top: 16px;
  font-size: 0.875rem;
  white-space: pre-wrap;
  color: var(--secondary-text-color);
}

/* ---- Related sidebar ---- */
.related-heading {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--primary-text-color);
}

.related-item {
  display: flex;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

/* Override global a:link / a:visited blue */
.related-item:link,
.related-item:visited {
  color: var(--primary-text-color);
}

.related-item:hover {
  background-color: var(--yt-bg-hover);
}

.related-thumb {
  width: 168px;
  height: 94px;
  border-radius: 8px;
  object-fit: cover;
  background-color: var(--card-bg-color);
  color: var(--secondary-text-color);
  flex-shrink: 0;
}

.related-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-text-color);
  transition: color 0.15s ease;
}

.related-item:hover .related-title {
  color: var(--primary-color);
}

.related-meta {
  font-size: 0.75rem;
  margin-top: 4px;
  color: var(--secondary-text-color);
}

.related-duration {
  font-size: 0.75rem;
  color: var(--tertiary-text-color);
}
</style>
