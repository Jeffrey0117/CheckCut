<template>
  <div class="min-h-screen page-root">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">影片管理</h1>
        <router-link
          to="/admin/videos/new"
          class="primary-btn px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
          新增影片
        </router-link>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 spinner"></div>
      </div>

      <div v-else-if="videos.length === 0" class="text-center py-12 meta-text">
        目前還沒有影片。建立你的第一支影片吧。
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="video in videos"
          :key="video.id"
          class="row-card flex items-center gap-4 p-4 rounded-lg"
        >
          <img
            :src="video.thumbnail_url || '/placeholder-thumb.png'"
            :alt="video.title"
            class="w-32 h-20 object-cover rounded avatar-bg flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ video.title }}</p>
            <p class="text-sm meta-text">{{ video.person_name || '未指定人物' }} | {{ statusLabel(video.status) }}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <router-link
              :to="`/admin/videos/${video.id}`"
              class="neutral-btn px-3 py-1.5 text-sm rounded transition-colors inline-flex items-center gap-1.5"
            >
              <font-awesome-icon :icon="['fas', 'pen']" />
              編輯
            </router-link>
            <button
              class="danger-btn px-3 py-1.5 text-sm rounded transition-colors inline-flex items-center gap-1.5"
              @click="handleDelete(video.id)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" />
              刪除
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

const STATUS_LABELS = {
  draft: '草稿',
  published: '已發布',
  unlisted: '不公開',
}

function statusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.draft
}

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
  if (!confirm('確定要刪除這支影片嗎?')) return
  try {
    await deleteVideo(id)
    videos.value = videos.value.filter((v) => v.id !== id)
  } catch (err) {
    alert('刪除失敗:' + err.message)
  }
}

onMounted(load)
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

.row-card {
  background-color: var(--card-bg-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.avatar-bg {
  background-color: var(--secondary-card-bg-color);
}

.primary-btn {
  background-color: var(--primary-color);
  color: var(--text-with-main-color);
}

.primary-btn:hover {
  background-color: var(--primary-color-hover);
}

.neutral-btn {
  background-color: var(--secondary-card-bg-color);
  color: var(--primary-text-color);
}

.neutral-btn:hover {
  background-color: color-mix(in srgb, var(--primary-text-color) 12%, var(--secondary-card-bg-color));
}

.danger-btn {
  background-color: var(--destructive-color);
  color: var(--destructive-text-color);
}

.danger-btn:hover {
  background-color: var(--destructive-hover-color);
}
</style>
