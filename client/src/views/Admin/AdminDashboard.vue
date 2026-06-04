<template>
  <div class="min-h-screen page-root">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-8">管理後台</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <router-link
          to="/admin/videos"
          class="admin-card block p-6 rounded-lg transition-colors"
        >
          <h2 class="text-lg font-semibold mb-2">影片管理</h2>
          <p class="meta-text text-sm">新增、編輯與刪除影片</p>
          <p v-if="videoCount !== null" class="count-stat mt-3 text-2xl font-bold">{{ videoCount }}</p>
        </router-link>

        <router-link
          to="/admin/persons"
          class="admin-card block p-6 rounded-lg transition-colors"
        >
          <h2 class="text-lg font-semibold mb-2">人物管理</h2>
          <p class="meta-text text-sm">新增、編輯與刪除人物</p>
          <p v-if="personCount !== null" class="count-stat mt-3 text-2xl font-bold">{{ personCount }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVideos, getPersons } from '../../helpers/api/local.js'

const videoCount = ref(null)
const personCount = ref(null)

onMounted(async () => {
  try {
    const [vRes, pRes] = await Promise.allSettled([getVideos({ limit: 0 }), getPersons()])
    if (vRes.status === 'fulfilled') videoCount.value = vRes.value.total ?? vRes.value.videos?.length ?? 0
    if (pRes.status === 'fulfilled') personCount.value = pRes.value.persons?.length ?? 0
  } catch {
    // ignore
  }
})
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.meta-text {
  color: var(--secondary-text-color);
}

.admin-card {
  background-color: var(--card-bg-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.admin-card:hover {
  background-color: var(--secondary-card-bg-color);
}

.count-stat {
  color: var(--primary-color);
}
</style>
