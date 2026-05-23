<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <router-link
          to="/admin/videos"
          class="block p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <h2 class="text-lg font-semibold mb-2">Manage Videos</h2>
          <p class="text-gray-400 text-sm">Add, edit, and delete videos</p>
          <p v-if="videoCount !== null" class="mt-3 text-2xl font-bold text-blue-400">{{ videoCount }}</p>
        </router-link>

        <router-link
          to="/admin/persons"
          class="block p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <h2 class="text-lg font-semibold mb-2">Manage Persons</h2>
          <p class="text-gray-400 text-sm">Add, edit, and delete persons</p>
          <p v-if="personCount !== null" class="mt-3 text-2xl font-bold text-green-400">{{ personCount }}</p>
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
